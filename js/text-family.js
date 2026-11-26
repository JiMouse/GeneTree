// Free-text family history -> rows of the GeneTree table.
// Runs entirely in the browser: rules, no model, no network.
//
//   var parsed = parseFamilyText("Elle a 2 sœurs dont une décédée d'un cancer du sein à 45 ans. "
//                              + "Son père a un demi-frère paternel.");
//   var plan = planFamilyText(hot.getSourceData(), parsed, { L: lang, cancerKeys: onco_full(), year: 2026 });
//   plan.rows       the new table (nothing is changed until the caller loads it)
//   plan.lines      what will be added or changed, for the preview
//   plan.unhandled  pieces of text that could not be placed, for the user to enter by hand
//
// parseFamilyText() is pure and does not depend on the page; planFamilyText() only needs
// the language object (lang) for the names of the new rows.

(function (root) {
    'use strict';

    // ------------------------------------------------------------------ text

    // Lower case, no accents, "œ" -> "oe", single spaces, "l'" -> "l ".
    // map[i] = position in the original text of normalised character i, so that
    // disease names and unplaced relatives are shown in the user's own words.
    function normalise(text) {
        var src = String(text || ''), out = '', map = [];
        for (var i = 0; i < src.length; i++) {
            var c = src[i].toLowerCase();
            c = c === 'œ' ? 'oe' : c === 'æ' ? 'ae' : c.normalize('NFD').replace(/[̀-ͯ]/g, '');
            if (/[’`´]/.test(c)) c = "'";
            // a line break inside a sentence (text pasted from a letter or a PDF: "a eu un
            // \ncancer du côlon") is a space; before a capital, a dash or a bullet it ends the line
            if (c === '\n' && softBreak(src, i)) c = ' ';
            if (/\s/.test(c) && c !== '\n') { if (out.slice(-1) === ' ') continue; c = ' '; }
            for (var j = 0; j < c.length; j++) { out += c[j]; map.push(i); }
        }
        out = out.replace(/\b([jdlnsc]|qu)'/g, function (m, a) { return a + ' '; }); // same length
        out = out.replace(/(\d)\.(?=\d)/g, '$1/');                                       // "21.11.1960", same length
        map.push(src.length);
        return { text: out, map: map, src: src };
    }

    function softBreak(src, i) {
        var j = i + 1;
        while (j < src.length && /[ \t\r\u00a0]/.test(src[j])) j++;
        var next = src[j] || '';
        if (next === '\n' || next === '') return false;                     // blank line: a new paragraph
        return /\d/.test(next) || (next !== next.toUpperCase() && next === next.toLowerCase());
    }

    // A piece of normalised text, possibly made of several ranges (see "chez" below).
    function View(norm, ranges) {
        this.norm = norm;
        this.text = '';
        this.offs = [];
        for (var r = 0; r < ranges.length; r++) {
            if (this.text) { this.text += ' '; this.offs.push(ranges[r][0]); }
            for (var i = ranges[r][0]; i < ranges[r][1]; i++) { this.text += norm.text[i]; this.offs.push(i); }
        }
    }
    View.prototype.original = function (a, b) {
        while (a < b && this.text[a] === ' ') a++;
        while (b > a && this.text[b - 1] === ' ') b--;
        if (b <= a) return '';
        var s = this.norm.map[this.offs[a]], e = this.norm.map[this.offs[b - 1]] + 1;
        return this.norm.src.slice(s, e).replace(/\s+/g, ' ').trim();
    };

    function originalOf(norm, a, b) { return new View(norm, [[a, b]]).original(0, b - a); }

    // ------------------------------------------------------------------ words

    var NUMBERS = {
        un: 1, une: 1, deux: 2, trois: 3, quatre: 4, cinq: 5, six: 6, sept: 7, huit: 8, neuf: 9, dix: 10,
        onze: 11, douze: 12, treize: 13, quatorze: 14, quinze: 15, seize: 16,
        a: 1, an: 1, one: 1, two: 2, three: 3, four: 4, five: 5, seven: 7, eight: 8, nine: 9, ten: 10,
        eleven: 11, twelve: 12
    };
    var NUM = '(\\d{1,2}|un|une|deux|trois|quatre|cinq|six|sept|huit|neuf|dix|onze|douze|treize|quatorze|quinze|seize'
            + '|an?|one|two|three|four|five|seven|eight|nine|ten|eleven|twelve)';
    function toNumber(w) { return /^\d+$/.test(w) ? parseInt(w, 10) : (NUMBERS[w] || 0); }

    // Relatives counted in groups ("3 frères"). Combined forms first.
    var KIN = [
        { re: 'freres? (?:et|ou) soeurs?|soeurs? (?:et|ou) freres?|brothers? (?:and|or) sisters?|sisters? (?:and|or) brothers?|siblings?', kind: 'sibling', sex: 'U' },
        { re: 'oncles? (?:et|ou) tantes?|tantes? (?:et|ou) oncles?|uncles? (?:and|or) aunts?|aunts? (?:and|or) uncles?', kind: 'parentSibling', sex: 'U' },
        { re: 'freres?|brothers?', kind: 'sibling', sex: 'M' },
        { re: 'soeurs?|sisters?', kind: 'sibling', sex: 'F' },
        { re: 'enfants?|children|child|kids?', kind: 'child', sex: 'U' },
        { re: 'fils|garcons?|sons?|boys?', kind: 'child', sex: 'M' },
        { re: 'filles?|daughters?|girls?', kind: 'child', sex: 'F' },
        { re: 'oncles?|uncles?', kind: 'parentSibling', sex: 'M' },
        { re: 'tantes?|aunts?', kind: 'parentSibling', sex: 'F' },
        { re: 'neveux|neveu|nieces?|nephews?|cousins?|cousines?', kind: 'other', sex: 'U' }
    ];
    var KIN_RE = KIN.map(function (k) { return '(' + k.re + ')'; }).join('|');
    function kinOf(m, first) {
        for (var i = 0; i < KIN.length; i++) if (m[first + i]) return KIN[i];
        return null;
    }

    // Before the relative: "2 autres petites sœurs" (adjectives), "un demi-frère" (prefixes).
    var ADJ = '(autres?\\s+|other\\s+)?(?:(?:grande?s?|petite?s?|jeunes?|older|younger|elder|big|little)\\s+)?';
    var PREFIX = '(demi[- ]?|half[- ]?|step[- ]?|beaux?-|belles?-|petite?s?-|grande?s?-|great[- ]|arriere-)?';
    var DET = '(?:(?:de |chez |pour |a |et )?(?:son|sa|ses|le|la|les|l|du|des|leur|leurs|his|her|the|their|its)\\s+)?';
    var NOT_IN_WORD = '(?<![\\w-])';
    // "deux de ses oncles", "two of her brothers"
    var OF_HIS = '(?:(?:de|d) (?:ses|leurs|ces|nos|vos)\\s+|of (?:his|her|their|the)\\s+)?';

    var SIDE_AFTER = {
        P: /^\s*,?\s*(?:paternel(?:le)?s?\b|pat\b\.?|(?:du )?cote (?:paternel|du pere|de (?:son|leur) pere)\b|par (?:son |le |leur )?pere\b|(?:de|du) meme pere\b|(?:on (?:the|his|her) )?father'?s side\b|paternal(?:ly)?\b)/,
        M: /^\s*,?\s*(?:maternel(?:le)?s?\b|mat\b\.?|(?:du )?cote (?:maternel|de (?:la|sa|leur) mere)\b|par (?:sa |la |leur )?mere\b|(?:de|du) meme mere\b|(?:on (?:the|his|her) )?mother'?s side\b|maternal(?:ly)?\b)/
    };
    var SIDE_BEFORE = { P: /(?:paternal|paternel(?:le)?)\s+$/, M: /(?:maternal|maternel(?:le)?)\s+$/ };
    function sideAt(sentence, start, end) {
        var after = sentence.slice(end), before = sentence.slice(0, start);
        for (var s in SIDE_AFTER) {
            var m = after.match(SIDE_AFTER[s]);
            if (m) return { side: s, start: start, end: end + m[0].length };
            var b = before.match(SIDE_BEFORE[s]);
            if (b) return { side: s, start: start - b[0].length, end: end };
        }
        return { side: '', start: start, end: end };
    }

    // ------------------------------------------------------------------ twins
    // "vrais jumeaux", "jumeaux monozygotes" -> MZ; "faux jumeaux", "dizygotes", nothing said -> DZ
    var ZYG = '(?:vraie?s?|fausse?s?|identical|fraternal|monozygotes?|homozygotes?|univitellin\\w*|identiques?|mz|dizygotes?|bivitellin\\w*|dz)';
    var TWIN_ZYG_BEFORE = '((?:vraie?s?|fausse?s?|identical|fraternal)\\s+)?';
    var TWIN_AFTER = new RegExp('^\\s+((?:vraie?s?|fausse?s?)\\s+)?(jumea(?:u|ux)|jumelles?|twins?)\\b(?:\\s+(' + ZYG + ')\\b)?');
    function zygosity(words) {
        if (/vrai|identi|monozyg|homozyg|univitell|\bmz\b/.test(words || '')) return 'MZ';
        if (/faux|fausse|fratern|dizyg|bivitell|\bdz\b/.test(words || '')) return 'DZ';
        return '?';                                                   // not said: dizygotic in the table
    }

    // ------------------------------------------------------------------ tokens
    // A sentence is cut into tokens (the relatives it names); the text between two
    // tokens describes the first one (diseases, death, age).

    function tokens(sentence) {
        var out = [];
        function scan(source, make) {
            var re = new RegExp(source, 'g'), m;
            while ((m = re.exec(sentence)) !== null) {
                var t = make(m);
                if (t) {
                    if (t.start == null) t.start = m.index;
                    if (t.end == null) t.end = m.index + m[0].length;
                    out.push(t);
                }
                if (!m[0].length) re.lastIndex++;
            }
        }
        var withSide = function (t, m) {
            var s = sideAt(sentence, m.index, m.index + m[0].length);
            t.side = s.side; t.start = s.start; t.end = s.end;
            return t;
        };

        // "3 frères", "un demi-frère paternel", "2 autres enfants"
        scan('\\b' + NUM + '\\s+' + OF_HIS + ADJ + PREFIX + '(?:' + KIN_RE + ')\\b', function (m) {
            var kin = kinOf(m, 4), prefix = (m[3] || '').replace(/[- ]$/, '');
            var t = { type: 'group', n: toNumber(m[1]), kind: kin.kind, sex: kin.sex, other: !!m[2] };
            if (/^(demi|half)$/.test(prefix)) t.half = true;
            else if (prefix) t.kind = 'other';
            return withSide(t, m);
        });
        // "dont 2 filles", "dont une", "l'une d'elles", ", l'un a eu…"
        scan('\\b(?:dont|including|of whom|of which)\\s+' + NUM + '(?:\\s+' + ADJ + '(?:' + KIN_RE + '))?\\b', function (m) {
            var kin = kinOf(m, 3);
            return { type: 'subset', n: toNumber(m[1]), sex: kin ? kin.sex : 'U' };
        });
        scan('\\b(?:l )?(?:une|un) d (?:entre )?(?:elles|eux)\\b|\\bone of them\\b', function () { return { type: 'subset', n: 1, sex: 'U' }; });
        scan('\\b(?:pour|chez|dont)\\s*,?\\s*l (un|une|autre)\\b|\\bl (autre)\\b|\\bthe other\\b|\\bfor (?:the )?one\\b', function () {
            return { type: 'subset', n: 1, sex: 'U' };
        });
        scan(',\\s*(?:l )?(une|un)\\b(?=\\s+(?:a|est|avait|etait|ayant|decede|atteinte?|morte?|souffr))', function (m) {
            return { type: 'subset', n: 1, sex: 'U', start: m.index + m[0].indexOf(m[1]) };
        });
        // "le frère de son père", "his mother's sister"
        scan(NOT_IN_WORD + DET + '(frere|soeur) (?:de (?:son|sa|leur)|du|de la) (pere|mere)\\b', function (m) {
            return { type: 'person', role: 'parentSibling', sex: m[1] === 'frere' ? 'M' : 'F', side: m[2] === 'pere' ? 'P' : 'M' };
        });
        scan(NOT_IN_WORD + DET + '(father|dad|mother|mum|mom)\'s (brother|sister)\\b', function (m) {
            return { type: 'person', role: 'parentSibling', sex: m[2] === 'brother' ? 'M' : 'F', side: /father|dad/.test(m[1]) ? 'P' : 'M' };
        });
        // grandparents
        scan(NOT_IN_WORD + DET + '(grand[- ]?pere|grand[- ]?mere|gd[- ]?pere|gd[- ]?mere|grandfather|grandmother|grandpa|grandma)\\b', function (m) {
            return withSide({ type: 'person', role: 'grandparent', sex: /pere|father|pa$/.test(m[1]) ? 'M' : 'F' }, m);
        });
        scan(NOT_IN_WORD + '(gpp|gmp|gpm|gmm)\\b', function (m) { return { type: 'person', roles: [m[1]] }; });
        scan(NOT_IN_WORD + DET + '(?:grands?[- ]?parents|grandparents)\\b', function (m) {
            return withSide({ type: 'person', role: 'grandparents' }, m);
        });
        // half-siblings, uncles and aunts (one person, side needed)
        scan(NOT_IN_WORD + DET + '(?:demi[- ]?|half[- ]?)(frere|soeur|brother|sister)\\b', function (m) {
            return withSide({ type: 'person', role: 'half', sex: /frere|brother/.test(m[1]) ? 'M' : 'F' }, m);
        });
        scan('(?<![\\w-]|great |grand |grande )' + DET + '(oncle|tante|uncle|aunt)\\b', function (m) {
            return withSide({ type: 'person', role: 'parentSibling', sex: /oncle|uncle/.test(m[1]) ? 'M' : 'F' }, m);
        });
        // parents
        scan(NOT_IN_WORD + '(?<!grand |gd |meme |beau |belle )' + DET + '(pere|papa|father|dad|daddy|mere|maman|mother|mum|mom)\\b', function (m) {
            return { type: 'person', roles: [/pere|papa|father|dad/.test(m[1]) ? 'father' : 'mother'] };
        });
        scan(NOT_IN_WORD + DET + '(?:deux )?parents\\b', function () { return { type: 'person', roles: ['father', 'mother'] }; });
        // one brother or sister, son or daughter
        scan(NOT_IN_WORD + DET + '(?:(?:grande?|petite?|big|little|older|younger|elder)\\s+)?(frere|soeur|brother|sister)\\b(?!s)', function (m) {
            return { type: 'person', role: 'sibling', sex: /frere|brother/.test(m[1]) ? 'M' : 'F' };
        });
        scan(NOT_IN_WORD + '(?<!ses |les |des |petit |petits |petite |petites |grand |his |her )' + DET + '(fils|fille)\\b(?!s| uniques?)', function (m) {
            return { type: 'person', role: 'child', sex: m[1] === 'fils' ? 'M' : 'F' };
        });
        scan(NOT_IN_WORD + '(?:his|her|their|the) (son|daughter)\\b(?!s)', function (m) {
            return { type: 'person', role: 'child', sex: m[1] === 'son' ? 'M' : 'F' };
        });
        // the index case
        scan(NOT_IN_WORD + '(?:(?:le|la|du|de la|chez le|chez la|the)\\s+)?(patiente?|consultante?|probande?|cas index|index case|proband|index)\\b', function (m) {
            return { type: 'person', roles: ['index'], sexHint: /e$/.test(m[1]) ? 'F' : (/^(patient|consultant|proband)$/.test(m[1]) ? 'M' : '') };
        });
        scan(NOT_IN_WORD + '(monsieur|madame|mme|mr|mrs|ms)\\b', function (m) {
            return { type: 'person', roles: ['index'], civil: true, sexHint: /^(monsieur|mr)$/.test(m[1]) ? 'M' : 'F' };
        });
        scan(NOT_IN_WORD + '(?:je|j)\\b(?= )', function () { return { type: 'person', roles: ['index'] }; });
        // pronouns
        scan(NOT_IN_WORD + '(il|elle|he|she)\\b', function (m) { return { type: 'pronoun', sex: /^(il|he)$/.test(m[1]) ? 'M' : 'F' }; });
        scan(NOT_IN_WORD + '(ils|elles|they)\\b', function () { return { type: 'pronoun', plural: true }; });
        // "ses frères et sœurs", "ses enfants": the group already named
        scan(NOT_IN_WORD + '(?:ses|les|leurs|his|her|their|the)\\s+(?:' + KIN_RE + ')\\b', function (m) {
            var kin = kinOf(m, 1);
            return kin.kind === 'other' ? null : { type: 'groupRef', kind: kin.kind, sex: kin.sex };
        });
        // "côté paternel :"
        scan('\\b(?:du )?cote (paternel|maternel|du pere|de (?:son|leur) pere|de (?:la|sa|leur) mere)\\b|\\bbranche (paternelle|maternelle)\\b|\\b(?:on the )?(paternal|maternal|father\'?s|mother\'?s) side\\b', function (m) {
            return { type: 'branch', side: /pat|pere|father/.test(m[0]) ? 'P' : 'M' };
        });
        // relatives the table cannot take from a sentence: listed for the user
        scan(NOT_IN_WORD + DET + '(beaux?[- ]?(?:peres?|freres?|fils)|belles?[- ]?(?:meres?|soeurs?|filles?)|step[- ]?\\w+|\\w+[- ]in[- ]law|cousins?|cousines?|neveux|neveu|nieces?|nephews?'
             + '|petite?s?[- ](?:fils|filles?|enfants?)|grand(?:sons?|daughters?|child(?:ren)?)|mari|epoux|epouse|conjointe?|compagnon|compagne|husband|wife|partner'
             + '|grands?[- ]?oncles?|grandes?[- ]?tantes?|great[- ]?(?:uncles?|aunts?|grand\\w*)|arriere[- ]?\\w+|(?:demi[- ]?|half[- ]?)(?:freres|soeurs|brothers|sisters))\\b', function () {
            return { type: 'absorb' };
        });

        // twins named alone: "des jumeaux", "deux jumelles", "sa jumelle", "son jumeau", "twins"
        scan(NOT_IN_WORD + '(?:(' + NUM.slice(1, -1) + '|des|de|ses|les|his|her|their|the)\\s+)?' + TWIN_ZYG_BEFORE + '(jumeaux|jumelles|twins)\\b(?:\\s+(' + ZYG + ')\\b)?', function (m) {
            var n = toNumber(m[1] || '') || 2;
            return { type: 'group', n: n > 1 ? n : 2, kind: 'child', sex: m[3] === 'jumelles' ? 'F' : 'U', twin: zygosity((m[2] || '') + ' ' + (m[4] || '')), twinsOnly: true };
        });
        scan(NOT_IN_WORD + DET + '(?:(?:un|une|a)\\s+)?' + TWIN_ZYG_BEFORE + '(jumeau|jumelle|twin)\\b(?!s| (?:brother|sister|son|daughter|boy|girl)s?\\b)(?:\\s+(' + ZYG + ')\\b)?', function (m) {
            // "elle est jumelle": a twin of unknown sex; "sa jumelle": a sister
            var is = /(?:^|\s)(?:est|etait|is|was)\s+$/.test(sentence.slice(0, m.index + (m[0].match(/^\s*/)[0].length)));
            return { type: 'person', role: 'sibling', sex: is ? 'U' : m[2] === 'jumelle' ? 'F' : m[2] === 'jumeau' ? 'M' : 'U', twin: zygosity((m[1] || '') + ' ' + (m[3] || '')), twinWithOwner: true };
        });
        scan(NOT_IN_WORD + '(?:(?:his|her|their|the)\\s+)?(?:(' + NUM.slice(1, -1) + ')\\s+)?(identical\\s+|fraternal\\s+)?twin (sons|daughters|boys|girls|brothers|sisters|children)\\b', function (m) {
            var w = m[3], n = toNumber(m[1] || '') || 2;
            return { type: 'group', n: n > 1 ? n : 2, kind: /brothers|sisters/.test(w) ? 'sibling' : 'child', sex: /sons|boys|brothers/.test(w) ? 'M' : /daughters|girls|sisters/.test(w) ? 'F' : 'U', twin: zygosity(m[2]) };
        });
        scan(NOT_IN_WORD + DET + '(?:(?:a|an)\\s+)?(identical\\s+|fraternal\\s+)?twin (brother|sister)\\b', function (m) {
            return { type: 'person', role: 'sibling', sex: m[2] === 'brother' ? 'M' : 'F', twin: zygosity(m[1]), twinWithOwner: true };
        });

        // Keep the earliest, then the longest; drop overlaps.
        out.sort(function (a, b) { return a.start - b.start || (b.end - b.start) - (a.end - a.start); });
        var kept = [], end = -1;
        out.forEach(function (t) { if (t.start >= end) { kept.push(t); end = t.end; } });
        // "deux frères jumeaux", "sa sœur jumelle", "un frère jumeau monozygote"
        kept.forEach(function (t) {
            if (t.twin || !((t.type === 'person' && /^(sibling|child)$/.test(t.role)) || (t.type === 'group' && /^(sibling|child)$/.test(t.kind)))) return;
            var m = sentence.slice(t.end).match(TWIN_AFTER);
            if (!m) return;
            t.twin = zygosity((m[1] || '') + ' ' + (m[3] || ''));
            // "un fils et une fille jumeaux": the two named; "sa sœur jumelle": the sister and the one who has her
            if ((t.type === 'person' || t.n === 1) && /^(jumeaux|jumelles|twins)$/.test(m[2])) t.twinWithPrev = true;
            else t.twinWithOwner = (t.type === 'person' || t.n === 1);
            t.end += m[0].length;
        });
        return kept.filter(function (t, k) { return !k || t.start >= kept[k - 1].end; });
    }

    // ------------------------------------------------------------------ diseases, death, age

    // Organ -> canonical cancer (the keys of the table: cancer_sein / breast_cancer…).
    var ORGANS = [
        { id: null, re: /\bcol\b|cervi/ },               // cervix: not the uterus, kept as written
        { id: 'breast', re: /sein|mammaire|breast/ },
        { id: 'ovary', re: /ovair|ovarien|ovar/ },
        { id: 'prostate', re: /prostat/ },
        { id: 'pancreas', re: /pancrea/ },
        { id: 'colon', re: /colon|colique|colo-?rect|rect|bowel|caecum|sigmoid/ },
        { id: 'stomach', re: /estomac|gastri|stomach/ },
        { id: 'lung', re: /poumon|pulmon|bronch|lung/ },
        { id: 'uterus', re: /uter|endometr|womb/ },
        { id: 'kidney', re: /\breins?\b|renal|kidney/ },
        { id: 'liver', re: /foie|hepat|liver|\bchc\b/ },
        { id: 'melanoma', re: /melanom/ },
        { id: 'orl', re: /\borl\b|larynx|laryng|pharyn|amygdal|langue|buccal|bouche|\bvads\b|head and neck|throat|tongue/ },
        { id: 'polyps', re: /polyp/ }
    ];
    var CANCER_KEYS = {
        breast: ['cancer_sein', 'breast_cancer'], breast2: ['cancer_sein2', 'breast_cancer2'],
        ovary: ['cancer_ovaire', 'ovarian_cancer'], prostate: ['cancer_prostate', 'prostate_cancer'],
        pancreas: ['cancer_pancréas', 'pancreatic_cancer'], colon: ['cancer_colon', 'colon_cancer'],
        stomach: ['cancer_estomac', 'stomach_cancer'], lung: ['cancer_poumon', 'lung_cancer'],
        uterus: ['cancer_utérus', 'uterus_cancer'], kidney: ['cancer_rein', 'kidney_cancer'],
        liver: ['cancer_foie', 'liver_cancer'], melanoma: ['mélanome', 'melanoma'],
        orl: ['cancer_orl', 'head_cancer'], polyps: ['polypes', 'polypes']
    };

    var CANCER_WORD = /\b(cancers?|k|neo|neoplasies?|carcinomes?|adenocarcinomes?|adk|tumeurs?(?: malignes?)?|carcinomas?|tumou?rs?|melanomes?|melanomas?|leucemies?|leukemias?|lymphomes?|lymphomas?|sarcomes?|sarcomas?|myelomes?|myelomas?|glioblastomes?|gliomes?|polypes?|polypose|polyps?|polyposis)\b/g;
    var CANCER_ORGAN_FIRST = /\b(breast|ovarian|prostate|pancreatic|colon|colorectal|bowel|stomach|gastric|lung|uterine|endometrial|kidney|renal|liver|skin|thyroid|bladder|brain|cervical)\s+(?:cancer|carcinoma|tumou?r)s?\b/g;
    var TRIGGER = /\b(?:atteinte?s?(?:\s+(?:d|de|du|des|par))?|porteu(?:r|se)s?\s+(?:d|de|du|des)|souffr\w*\s+(?:d|de|du|des)|(?:suivie?s?|traitee?s?|operee?s?|hospitalisee?s?)\s+pour|(?:a|avait|ont|avaient|aurait)\s+(?:eu|fait|presente|developpe|contracte)|(?:a|avait|ont|avaient)(?=\s+(?:un|une|des)\s)|presentait|presente|diagnostic\s+(?:d|de)|(?:decedee?s?|dcd|morte?s?|deces)(?:\s+(?:a|at)\s+\d{1,3}\s*ans?)?\s+(?:d|de|des suites d|suite a|par)|diagnosed with|suffer\w* from|died (?:of|from)|affected by|(?:has|had|have)(?: had)?|with)\b/g;
    var ARTICLE = /^\s*(?:(?:un|une|des|d|de|du|la|le|l|les|a|an|the)\s+)+/;
    var BOUNDARY = /\s+(?:a|at|aged?|vers|en|et|and|dont|puis|depuis|diagnostiquee?s?|decedee?s?|dcd|morte?s?|died|chez|qui|mais|but|in|il|elle|ils|elles)\b|[,;:()]|\s+\d+\s*(?:ans|an|years?|y|yo)\b|\s+\d{2,3}\s*$/;
    var NOT_A_DISEASE = /^(?:paternal|maternal|paternel\w*|maternel\w*|good health|healthy|bonne sante|sante|rien|aucun\w*|pas|probleme\w*|antecedents?|enfants?|ans?|age|frere|soeur|fils|fille|oncle|tante|pere|mere|vie|ete|\d.*)$/;
    var NEGATION = /\b(?:pas|aucun\w*|sans|ni|jamais|no|not|without|never)\b[^,;]{0,12}$/;
    var DEATH = /\b(?:decedee?s?|dcd|morte?s?|deces|died|deceased|dead)\b(?!-)/g;
    var AGE_AFTER = /^\s*,?\s*(\()?\s*(?:(a|at|vers|aged?|diagnostiquee?s?\s+a|dx\s+a)\s+)?(?:l age de\s+|age\s+|the age of\s+)?(\d{1,3})\s*(ans|an|a|years?|y|yo)?\b/;
    var AGE_ALONE = /\b(?:(?:agee?s?|age|aged)\s+(?:de\s+|of\s+)?)?(\d{1,3})\s*(?:ans|years?(?:[- ]old)?|yo)\b/g;

    var YEAR_AFTER = /^\s*,?\s*(?:en|in)\s+((?:19|20)\d\d)\b/;

    function ageAfter(text, from) {
        var m = text.slice(from).match(AGE_AFTER);
        if (!m || !(m[1] || m[2] || m[4])) return null;
        var n = parseInt(m[3], 10);
        return n > 0 && n < 120 ? { age: n, end: from + m[0].length } : null;
    }

    function organOf(phrase) {
        for (var i = 0; i < ORGANS.length; i++) if (ORGANS[i].re.test(phrase)) return { id: ORGANS[i].id };
        return null;
    }

    // Diseases, death and age in a piece of text about one person (or a group).
    function attributes(view) {
        var s = view.text, used = [], a = { diseases: [], deceased: false, deathAge: null, age: null };
        function free(i, j) { return !used.some(function (u) { return i < u[1] && j > u[0]; }); }
        function phraseEnd(from) {
            var rest = s.slice(from), m = rest.match(BOUNDARY);
            return from + (m ? m.index : rest.length);
        }
        function addDisease(start, end, organ) {
            if (!free(start, end) || NEGATION.test(s.slice(Math.max(0, start - 15), start))) return null;
            var d = { label: view.original(start, end), cancer: organ ? organ.id : null, age: null, at: start };
            if (!d.label) return null;
            used.push([start, end]);
            // "deux mélanomes, le premier en 2016 à 56 ans et le second en 2022": one disease each
            var count = s.slice(Math.max(0, start - 12), start).match(/(?:^|\s)(\d|deux|trois|quatre|two|three|four)\s+$/);
            var n = count ? toNumber(count[1]) : 1;
            if (n > 1 && n < 6) {
                var many = occurrences(end, n);
                many.items.forEach(function (it) {
                    a.diseases.push({ label: d.label, cancer: d.cancer, age: it.age, year: it.year, at: start });
                });
                return many.end;
            }
            var age = ageAfter(s, end);
            if (age) { d.age = age.age; used.push([end, age.end]); end = age.end; }
            else {
                // "cancer du sein en 2010": the year, turned into an age with the year of birth
                var y = s.slice(end).match(YEAR_AFTER);
                if (y) {
                    d.year = parseInt(y[1], 10); used.push([end, end + y[0].length]); end += y[0].length;
                    var age2 = ageAfter(s, end);
                    if (age2) { d.age = age2.age; used.push([end, age2.end]); end = age2.end; }
                }
            }
            if (d.cancer === 'breast' && /bilateral|controlateral|both breasts/.test(s.slice(start, end))) {
                var second = s.slice(end).match(/^\s*(?:,|et|and|puis)\s*(?:a\s+)?(\d{1,3})\s*(?:ans|years?)?\b/);
                var d2 = { label: d.label, cancer: 'breast2', age: second ? parseInt(second[1], 10) : d.age, at: start };
                if (second) { used.push([end, end + second[0].length]); end += second[0].length; }
                a.diseases.push(d, d2);
            } else a.diseases.push(d);
            return end;
        }

        // n times the same disease: the ages and years that follow, one per occurrence
        //   "à 56 et 62 ans", "le premier en 2016 à l'âge de 56 ans … et le second en 2022"
        function occurrences(from, n) {
            var items = [], i, rest = s.slice(from), stop = from;
            var list = rest.match(/^\s*,?\s*(?:(?:diagnostique\w*|survenu\w*)\s+)?(?:a|at|aux|at the ages? of)\s+(?:l age de\s+|ages? de\s+)?((?:\d{1,3}\s*(?:ans\s*)?(?:,|et|and)\s*)+\d{1,3})\s*(?:ans|years?)?\b/);
            if (list) {
                var ages = list[1].match(/\d{1,3}/g).map(Number);
                for (i = 0; i < n; i++) items.push({ age: ages[i] != null ? ages[i] : null, year: null });
                used.push([from, from + list[0].length]);
                return { items: items, end: from + list[0].length };
            }
            var ORD = /(?:^|[\s,])(?:et\s+|puis\s+|and\s+)?(?:le|la|l|the)\s+(premier|premiere|1er|1ere|second|seconde|deuxieme|2e|2eme|2nd|troisieme|3e|3eme|3rd|first|second|third)\b/g, m, marks = [];
            while ((m = ORD.exec(rest)) !== null) marks.push({ at: m.index, end: m.index + m[0].length });
            if (marks.length && /^\s*,?\s*$/.test(rest.slice(0, marks[0].at))) {
                marks.slice(0, n).forEach(function (mk, k) {
                    var next = marks[k + 1] && k + 1 < n ? marks[k + 1].at : rest.length;
                    var seg = rest.slice(mk.end, next);
                    var yr = seg.match(/\b(?:en|in)\s+((?:19|20)\d\d)\b/);
                    var ag = seg.match(/\b(?:a|at)\s+(?:l age de\s+|the age of\s+|age\s+)?(\d{1,3})\s*(?:ans|years?|y|yo)?\b/);
                    items.push({ age: ag ? parseInt(ag[1], 10) : null, year: yr ? parseInt(yr[1], 10) : null });
                    stop = from + next;
                });
                used.push([from, stop]);
                while (items.length < n) items.push({ age: null, year: null });
                return { items: items, end: stop };
            }
            for (i = 0; i < n; i++) items.push({ age: null, year: null });
            return { items: items, end: from };
        }

        // death first: "décédé à 60 ans", "DCD 70 ans"
        var m;
        DEATH.lastIndex = 0;
        while ((m = DEATH.exec(s)) !== null) {
            var after = m.index + m[0].length;
            if (NEGATION.test(s.slice(Math.max(0, m.index - 6), m.index)) || /^-?ne\b/.test(s.slice(after, after + 3))) continue;
            a.deceased = true;
            if (/^(?:decedes|decedees|morts|mortes)$/.test(m[0])) a.deathPlural = true;   // "également décédés": all of them
            used.push([m.index, after]);
            var age = ageAfter(s, after);
            if (age) { a.deathAge = age.age; used.push([after, age.end]); }
        }
        // "breast cancer": organ first (English)
        CANCER_ORGAN_FIRST.lastIndex = 0;
        while ((m = CANCER_ORGAN_FIRST.exec(s)) !== null) {
            addDisease(m.index, m.index + m[0].length, organOf(m[1]) || { id: null });
        }
        // cancers named by a word: "cancer du sein", "K sein", "mélanome"
        CANCER_WORD.lastIndex = 0;
        while ((m = CANCER_WORD.exec(s)) !== null) {
            var start = m.index, end = phraseEnd(m.index + m[0].length), phrase = s.slice(start, end);
            var organ = organOf(phrase) || { id: null };
            var stop = addDisease(start, end, organ);
            // "cancer du sein et de l'ovaire"
            while (stop) {
                var more = s.slice(stop).match(/^\s*(?:et|and|,)\s+(?:du|de la|de l|des|d|of the|of)\s+/);
                if (!more) break;
                var s2 = stop + more[0].length, e2 = phraseEnd(s2), o2 = organOf(s.slice(s2, e2));
                if (!o2 || !o2.id) break;
                stop = addDisease(s2, e2, o2);
            }
        }
        // other diseases, after a verb: "atteint d'une myopathie", "a eu un AVC", "décédé d'une crise cardiaque"
        TRIGGER.lastIndex = 0;
        while ((m = TRIGGER.exec(s)) !== null) {
            var from = m.index + m[0].length, art = s.slice(from).match(ARTICLE);
            var ps = from + (art ? art[0].length : 0), pe = phraseEnd(ps);
            var words = s.slice(ps, pe).trim();
            if (!words || words.length > 60 || NOT_A_DISEASE.test(words) || !free(ps, pe)) continue;
            addDisease(ps, pe, null);
        }
        // age: "45 ans", "âgée de 45 ans"
        AGE_ALONE.lastIndex = 0;
        while ((m = AGE_ALONE.exec(s)) !== null) {
            if (!free(m.index, m.index + m[0].length)) continue;
            var n = parseInt(m[1], 10);
            if (!(n >= 0 && n < 120)) continue;
            if (a.deceased && a.deathAge == null) a.deathAge = n;
            else if (a.age == null) a.age = n;
            used.push([m.index, m.index + m[0].length]);
        }
        a.diseases.sort(function (x, y) { return x.at - y.at; });
        a.diseases.forEach(function (d) { delete d.at; });
        return a;
    }

    function hasAttributes(a) { return a.deceased || a.age != null || a.diseases.length > 0; }
    function merge(into, a) {
        a.diseases.forEach(function (d) { into.diseases.push(JSON.parse(JSON.stringify(d))); });
        if (a.deceased) into.deceased = true;
        if (a.deathAge != null) into.deathAge = a.deathAge;
        if (a.age != null) into.age = a.age;
    }

    // ------------------------------------------------------------------ parse

    var ROLE_SEX = { index: '', father: 'M', mother: 'F', gpp: 'M', gmp: 'F', gpm: 'M', gmm: 'F' };
    var POSSESS = /(?:^|\s)(?:a eu|a|avait|aurait|ont|avaient|has|had|have)\s+(?:aussi\s+|egalement\s+|also\s+|encore\s+)?$|^\s*:?\s*$/;
    var AND = /^\s*(?:,|et|and|ainsi que)?\s*$/;
    var UNION = /\b(?:autres?|other|d une autre union|d un (?:premier|autre|precedent|second|deuxieme) (?:mariage|lit|union|conjoint|compagnon)|d une (?:premiere|autre|precedente|seconde|deuxieme) (?:union|compagne|conjointe)|from (?:another|a previous|an earlier) (?:marriage|relationship|partner))\b/;

    // ------------------------------------------------------------------ identity
    // "Madame DUPONT Marie, née MARTIN le 21/11/1960 (65 ans)": the index case's
    // "Nom Prénom" (surname in capitals first, as in the table's field) and date of birth.

    var MONTHS = { janvier: 1, fevrier: 2, mars: 3, avril: 4, mai: 5, juin: 6, juillet: 7, aout: 8, septembre: 9, octobre: 10, novembre: 11, decembre: 12,
                   january: 1, february: 2, march: 3, april: 4, may: 5, june: 6, july: 7, august: 8, september: 9, october: 10, november: 11, december: 12 };
    var UP = "A-ZÀÂÄÇÉÈÊËÎÏÔÖÙÛÜŸŒÆ", LOW = "a-zàâäçéèêëîïôöùûüÿœæ";
    var CIVIL = new RegExp('(?:^|[^\\w])(Madame|Mademoiselle|Monsieur|Mme|Mlle|M\\.|Mr\\.?|Mrs\\.?|Ms\\.?|Miss)\\s+'
        + '(' + NAME_WORD() + '(?:[ \\t]+' + NAME_WORD() + '){0,3})');
    // "DUPONT", "LE-GALL", "Marie", "Anne-Sophie", "O'Neil"
    function NAME_WORD() { return '(?:[' + UP + '][' + UP + "'’-]+(?![" + LOW + '])|[' + UP + '][' + LOW + "'’]+(?:-[" + UP + '][' + LOW + "'’]+)*)"; }
    var BIRTH = /^[^.;\n]{0,80}?(?:^|[^\wéè])(?:n[ée]{1,2}e?|born)(?=[\s,(:])(?:\s+(?:on\s+)?[^\d.;\n]{0,40}?)?\s*(?:le\s+|on\s+)?(\d{1,2})(?:er)?\s*(?:[\/.-]\s*(\d{1,2})\s*[\/.-]|\s+([a-zéû]+)\s+)\s*(\d{4})\b/i;

    function identity(src) {
        var m = CIVIL.exec(src);
        if (!m) return null;
        var title = m[1].toLowerCase().replace(/\./g, '');
        var sex = /^(monsieur|m|mr)$/.test(title) ? 'M' : 'F';
        var words = m[2].trim().split(/\s+/);
        // stop at a word that starts a sentence ("Madame Dupont Consulte"): names only
        var isUpper = function (w) { return w === w.toUpperCase() && w !== w.toLowerCase(); };
        var upper = words.filter(isUpper), other = words.filter(function (w) { return !isUpper(w); });
        if (!upper.length) return { sex: sex };                     // "Madame Martin": not sure which is the surname
        var out = { sex: sex, civilName: upper.join(' ') + (other.length ? ' ' + other.join(' ') : '') };
        var b = src.slice(m.index + m[0].length).match(BIRTH);
        if (b) {
            var day = parseInt(b[1], 10), month = b[2] ? parseInt(b[2], 10) : MONTHS[String(b[3] || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')], yr = parseInt(b[4], 10);
            if (month >= 1 && month <= 12 && day >= 1 && day <= 31 && yr >= 1900 && yr <= 2100) {
                out.dbirth = (day < 10 ? '0' : '') + day + '/' + (month < 10 ? '0' : '') + month + '/' + yr;
                out.yob = yr; out.month = month; out.day = day;
            }
        }
        return out;
    }

    function parseFamilyText(text) {
        var norm = normalise(text);
        var persons = [], unhandled = [], groups = [], indexSex = '', branch = '';
        // the last man / woman named and the person the previous sentence was about, for
        // "Il est décédé." after "Son père a eu un lymphome."
        var lastBySex = {}, prevSubject = null, subject = null;
        var civilOfIndex = null, twins = 0;
        var roles = {};

        function person(p) {
            p.id = persons.length;
            p.attrs = { diseases: [], deceased: false, deathAge: null, age: null };
            persons.push(p);
            return p;
        }
        function role(r) { return roles[r] || (roles[r] = person({ role: r, sex: ROLE_SEX[r], match: true })); }
        // "son frère": the first brother named before and not yet described, else a new one
        function claim(roleName, sex, side) {
            for (var i = 0; i < persons.length; i++) {
                var p = persons[i];
                if (p.role === roleName && !p.claimed && (p.side || '') === (side || '') && (p.sex === sex || p.sex === 'U' || sex === 'U')) {
                    p.claimed = true;
                    if (p.sex === 'U') p.sex = sex;
                    return p;
                }
            }
            return person({ role: roleName, sex: sex, side: side, match: true, claimed: true });
        }
        function skip(t, reason) { if (t) unhandled.push({ text: t, reason: reason }); }
        function remember(p) { if (p && p.role !== 'index' && (p.sex === 'M' || p.sex === 'F')) lastBySex[p.sex] = p; }

        var splitter = /[^.;!?\n]+/g, sm;
        while ((sm = splitter.exec(norm.text)) !== null) {
            var sentence = sm[0], base = sm.index;
            var toks = tokens(sentence);
            var lastSingle = null, lastGroup = null, prev = null, prevOwner = null, lastSingleSince = false;
            prevSubject = subject; subject = null;
            var namesKin = toks.some(function (x) { return /^(person|group|groupRef|subset|absorb)$/.test(x.type); });
            var raw = function (t) { return originalOf(norm, base + t.start, base + t.end); };

            toks.forEach(function (t, k) {
                var gapBefore = sentence.slice(prev ? prev.end : 0, t.start);
                t.targets = [];
                t.chez = /^(?:chez|in)\b/.test(sentence.slice(t.start, t.end)) || /\b(?:chez|in)\s*$/.test(gapBefore);
                if (t.type === 'branch') { branch = t.side; }
                else if (t.type === 'absorb') { skip(raw(t), 'relative'); t.skipped = unhandled[unhandled.length - 1]; }
                else if (t.type === 'person' && t.civil && prev && prev.type === 'person' && prev.targets.length === 1 && /^\s*,?\s*$/.test(gapBefore)) {
                    // "Son père, Monsieur DUPONT Jean, …": the father, not the index case
                    t.targets = prev.targets.slice();
                } else if (t.type === 'person') {
                    var list = t.roles;
                    if (t.civil && !civilOfIndex) civilOfIndex = { at: norm.map[base + t.start] };
                    if (t.role === 'grandparent' || t.role === 'grandparents') {
                        var side = t.side || branch;
                        if (!side && t.role === 'grandparent') { // "sa grand-mère" after "sa grand-mère paternelle"
                            var known = ['p', 'm'].filter(function (x) { return roles[(t.sex === 'M' ? 'gp' : 'gm') + x]; });
                            if (known.length === 1) side = known[0] === 'p' ? 'P' : 'M';
                        }
                        if (!side) { skip(raw(t), 'side'); t.skipped = unhandled[unhandled.length - 1]; list = []; }
                        else if (t.role === 'grandparents') list = side === 'P' ? ['gpp', 'gmp'] : ['gpm', 'gmm'];
                        else list = [(t.sex === 'M' ? 'gp' : 'gm') + (side === 'P' ? 'p' : 'm')];
                    }
                    var holder = (t.twinWithOwner && prev && (prev.type === 'person' || prev.type === 'pronoun') && prev.targets.length === 1 && POSSESS.test(gapBefore)) ? prev.targets[0] : null;
                    if (list) t.targets = list.map(role);
                    else if (t.twinWithOwner && holder && (holder.role === 'father' || holder.role === 'mother')) {
                        // "son père a un frère jumeau": an uncle, twin of the father
                        t.targets = [claim('parentSibling', t.sex, holder.role === 'father' ? 'P' : 'M')];
                        t.twinOwner = holder;
                    }
                    else if (t.role === 'sibling' || t.role === 'child') {
                        t.targets = [claim(t.role, t.sex, '')];
                        // "sa sœur a une jumelle": the twin of the sister
                        if (holder && (holder.role === 'index' || holder.role === 'sibling')) t.twinOwner = holder;
                    }
                    else {
                        var sd = t.side || branch;
                        if (!sd) { skip(raw(t), 'side'); t.skipped = unhandled[unhandled.length - 1]; }
                        else t.targets = [claim(t.role, t.sex, sd)];
                    }
                    if (t.sexHint && !indexSex) indexSex = t.sexHint;
                    if (t.targets.length === 1) { lastSingle = t.targets[0]; remember(lastSingle); }
                    lastSingleSince = true;
                } else if (t.type === 'pronoun') {
                    lastSingleSince = true;
                    if (t.plural) t.targets = lastGroup ? lastGroup.members : [];
                    else {
                        var same = lastSingle && lastSingle.role !== 'index' && (lastSingle.sex === t.sex || lastSingle.sex === 'U');
                        var target = same ? lastSingle : null;
                        // "Son père a eu un lymphome. Il est décédé.": at the start of a sentence, the
                        // relative the previous sentence was about, when the sex agrees
                        // (not when the sentence names other relatives: "She has a brother." is the patient)
                        if (!target && !lastSingle && !namesKin && prevSubject && prevSubject.role !== 'index' && prevSubject.sex === t.sex) target = prevSubject;
                        // "Il" in a new sentence, when the index case is a woman: the last man named
                        var idxSex = indexSex || (roles.index && roles.index.sex) || '';
                        if (!target && idxSex && idxSex !== t.sex && lastBySex[t.sex]) target = lastBySex[t.sex];
                        t.targets = [target || role('index')];
                        if (!target && !indexSex) indexSex = t.sex;
                        lastSingle = t.targets[0];
                    }
                } else if (t.type === 'groupRef') {
                    for (var g = groups.length - 1; g >= 0; g--) {
                        if (groups[g].kind === t.kind && (t.sex === 'U' || groups[g].sex === t.sex || groups[g].sex === 'U')) { t.targets = groups[g].members; break; }
                    }
                } else if (t.type === 'subset') {
                    if (lastGroup) {
                        var pick = lastGroup.members.filter(function (p) { return !p.inSubset; }).slice(0, t.n);
                        pick.forEach(function (p) {
                            p.inSubset = true;
                            if (t.sex !== 'U' && p.sex === 'U') p.sex = t.sex;
                        });
                        t.targets = pick;
                        t.group = lastGroup;
                    }
                } else if (t.type === 'group' && t.twinsOnly && prev && prev.targets && prev.targets.length
                           && /^\s*(?:,|:)?\s*(?:(?:qui|ils|elles|they|who)\s+)?(?:sont|etaient|are|were)?\s*$/.test(gapBefore)) {
                    // "deux frères, de vrais jumeaux", "ses deux fils sont jumeaux", "elle et sa sœur sont jumelles",
                    // "une sœur jumelle, de vraies jumelles": the people just named
                    var named = prev.targets.slice(), j = k - 1;
                    while (j > 0 && toks[j - 1].targets && toks[j - 1].targets.length && AND.test(sentence.slice(toks[j - 1].end, toks[j].start))) {
                        toks[j - 1].targets.forEach(function (p) { if (named.indexOf(p) < 0) named.unshift(p); });
                        j--;
                    }
                    if (named.length === 1 && named[0].twin) {
                        if (t.twin !== '?') persons.forEach(function (p) { if (p.twin && p.twin.id === named[0].twin.id) p.twin.zyg = t.twin; });
                        t.targets = named; t.twin = null;   // what follows still describes them
                    } else t.targets = named;
                } else if (t.type === 'group') {
                    // Whose relatives? "son père a 2 frères" -> the father's.
                    var owner = null;
                    if (prev && (prev.type === 'person' || prev.type === 'pronoun') && prev.targets.length === 1 && POSSESS.test(gapBefore)) owner = prev.targets[0];
                    else if (prev && (prev.type === 'group' || prev.type === 'subset') && AND.test(gapBefore)) owner = prevOwner;
                    if (owner && owner.role === 'index') owner = null;
                    prevOwner = owner;
                    var gapAfter = sentence.slice(t.end, toks[k + 1] ? toks[k + 1].start : sentence.length);
                    var spec = null, why = 'relative';

                    // "2 enfants, un fils de 15 ans et une fille": the same two, now with their sex
                    if (lastGroup && lastGroup.sentence === sm.index && lastGroup.kind === t.kind && lastGroup.sex === 'U' && !t.half && !t.other && !lastSingleSince) {
                        var rest = lastGroup.members.filter(function (p) { return !p.inSubset; });
                        if (rest.length >= t.n) {
                            t.targets = rest.slice(0, t.n);
                            t.targets.forEach(function (p) { p.inSubset = true; if (t.sex !== 'U') p.sex = t.sex; });
                            prev = t; return;
                        }
                    }
                    // "ses deux frères" after "il a 2 frères": the same two
                    if (/(?:^|\s)(?:ses|les|leurs|his|her|their|the)\s+$/.test(gapBefore)) {
                        var again = groups.filter(function (g) { return g.kind === t.kind && g.members.length === t.n; }).pop();
                        if (again) { t.targets = again.members; lastGroup = again; prev = t; return; }
                    }
                    if (t.kind === 'other') spec = null;
                    else if (!owner) {
                        if (t.half) { var hs = t.side || branch; if (hs) spec = { role: 'half', side: hs }; else why = 'side'; }
                        else if (t.kind === 'sibling') spec = { role: 'sibling' };
                        else if (t.kind === 'child') spec = { role: 'child' };
                        else if (t.kind === 'parentSibling') { var ps = t.side || branch; if (ps) spec = { role: 'parentSibling', side: ps }; else why = 'side'; }
                    } else if (owner.role === 'father' || owner.role === 'mother') {
                        var os = owner.role === 'father' ? 'P' : 'M';
                        if (t.kind === 'sibling' && !t.half) spec = { role: 'parentSibling', side: os };
                        else if (t.kind === 'child' && (t.other || UNION.test(gapAfter))) spec = { role: 'half', side: os };
                    } else if (/^(sibling|half|child|parentSibling|childOf)$/.test(owner.role) && t.kind === 'child' && !t.half) {
                        spec = { role: 'childOf', ownerId: owner.id };
                    }
                    if (!spec) { skip(raw(t), why); t.skipped = unhandled[unhandled.length - 1]; prev = t; return; }
                    if (t.twinWithOwner) t.twinOwner = owner;
                    var members = [];
                    for (var i = 0; i < t.n; i++) {
                        members.push(person({ role: spec.role, sex: t.sex, side: spec.side, ownerId: spec.ownerId, match: false }));
                    }
                    lastGroup = { kind: t.kind, sex: t.sex, members: members, sentence: sm.index };
                    lastSingleSince = false;
                    groups.push(lastGroup);
                    t.targets = members;
                }
                // twins: the members of the group, or the relative and whoever "has" him or her
                if (t.twin && t.targets.length) {
                    var pair = t.targets.slice();
                    if (t.twinWithPrev && prev && prev.targets) prev.targets.forEach(function (p) { if (pair.indexOf(p) < 0) pair.unshift(p); });
                    if (t.twinWithOwner) {
                        var with_ = t.twinOwner || role('index');
                        if (pair.indexOf(with_) < 0) pair.push(with_);
                    }
                    if (pair.length > 1) {
                        twins++;
                        pair.forEach(function (p) { p.twin = { zyg: t.twin, id: twins }; });
                    }
                }
                if (!subject && (t.type === 'person' || t.type === 'pronoun') && t.targets.length === 1) subject = t.targets[0];
                prev = t;
            });

            // The text after each relative describes it; "cancer du sein chez sa mère" describes the next one.
            var orphan = [];
            toks.forEach(function (t, k) {
                var next = toks[k + 1];
                var ranges = [];
                if (t.chez) ranges.push([k ? toks[k - 1].end : 0, t.start]);
                if (!(next && next.chez)) ranges.push([t.end, next ? next.start : sentence.length]);
                ranges = ranges.map(function (r) { return [base + r[0], base + r[1]]; });
                if (!t.targets.length) {
                    var v = new View(norm, ranges);
                    if (t.skipped) { if (attributes(v).diseases.length) t.skipped.text += ' ' + v.original(0, v.text.length); }
                    else if (t.type !== 'branch') orphan.push(ranges);
                    return;
                }
                var a = attributes(new View(norm, ranges));
                if (hasAttributes(a)) t.targets.forEach(function (p) { merge(p.attrs, a); });
                // "pour l'un…, pour l'autre…, également décédés": the death is said of the whole group
                if (a.deathPlural && t.type === 'subset' && t.group) t.group.members.forEach(function (p) { p.attrs.deceased = true; });
            });
            if (!toks.length || !toks[0].chez) orphan.push([[base, base + (toks.length ? toks[0].start : sentence.length)]]);
            orphan.forEach(function (ranges) {
                var v = new View(norm, ranges), a = attributes(v);
                if (a.diseases.length) skip(v.original(0, v.text.length), 'orphan');
            });
        }
        var id = civilOfIndex ? identity(norm.src.slice(civilOfIndex.at)) : null;
        if (id && !indexSex) indexSex = id.sex;
        return { persons: persons, unhandled: unhandled, indexSex: indexSex, identity: id };
    }

    // ------------------------------------------------------------------ plan

    function planFamilyText(rows, parsed, ctx) {
        ctx = ctx || {};
        var L = ctx.L || {}, year = ctx.year || new Date().getFullYear();
        var cancerKeys = ctx.cancerKeys || [];
        var obj = JSON.parse(JSON.stringify(rows || []));
        var unhandled = parsed.unhandled.slice();
        var created = {}, used = {}, touched = [], details = {}, memo = {}, rowOf = {};
        var t = function (key, fallback) { return L[key] != null ? L[key] : fallback; };

        var zero = function (id) { return id == null || id === '' || String(id) === '0'; };
        var byId = function (id) { for (var i = 0; i < obj.length; i++) if (String(obj[i].IndivID) === String(id)) return obj[i]; return null; };
        var famId = obj.length && obj[0].FamID ? obj[0].FamID : '1';
        var index = obj.filter(function (r) { return r.proband === true || r.proband === 'true'; })[0] || obj[0];
        if (!index) return { rows: obj, lines: [], unhandled: unhandled };
        if (index.Sex !== 'M' && index.Sex !== 'F' && parsed.indexSex
            && !obj.some(function (r) { return String(r.FathID) === String(index.IndivID) || String(r.MothID) === String(index.IndivID); })) index.Sex = parsed.indexSex;

        function touch(r) { if (touched.indexOf(r) < 0) touched.push(r); }
        function name(base) {
            var n = obj.filter(function (r) { var x = String(r.Name || ''); return x === base || (x.indexOf(base) === 0 && /^\d+$/.test(x.slice(base.length))); }).length;
            return n ? base + (n + 1) : base;
        }
        function nextId() {
            var max = 0;
            obj.forEach(function (r) { var n = parseInt(r.IndivID, 10); if (!isNaN(n) && n > max) max = n; });
            return String(max + 1);
        }
        function add(base, sex, fath, moth) {
            var r = { FamID: famId, Name: name(base), IndivID: nextId(), FathID: fath ? fath.IndivID : '0', MothID: moth ? moth.IndivID : '0',
                      Sex: sex, Affected: '1', Deceased: '0', Age: '', Yob: '', Disease1: '', Age1: '', Disease2: '', Age2: '', Disease3: '', Age3: '' };
            obj.push(r);
            created[r.IndivID] = true;
            touch(r);
            return r;
        }
        function parents(r, names) {
            var f = zero(r.FathID) ? null : byId(r.FathID), m = zero(r.MothID) ? null : byId(r.MothID);
            if (!f) { f = add(names[0], 'M'); r.FathID = f.IndivID; }
            if (!m) { m = add(names[1], 'F'); r.MothID = m.IndivID; }
            return [f, m];
        }
        function partnerOf(r, excludeId, base) {
            var key = r.IndivID + '|' + (excludeId || '');
            if (memo[key]) return memo[key];
            for (var i = 0; i < obj.length; i++) {
                var c = obj[i], other = null;
                if (String(c.FathID) === String(r.IndivID)) other = c.MothID;
                else if (String(c.MothID) === String(r.IndivID)) other = c.FathID;
                if (other != null && !zero(other) && String(other) !== String(excludeId || '')) return (memo[key] = byId(other));
            }
            if (r.Sex !== 'M' && r.Sex !== 'F') return null;
            return (memo[key] = add(base, r.Sex === 'M' ? 'F' : 'M'));
        }
        function childOf(p1, p2, base, sex) { return p1.Sex === 'M' ? add(base, sex, p1, p2) : add(base, sex, p2, p1); }
        function existing(test, sex) {
            for (var i = 0; i < obj.length; i++) {
                var r = obj[i];
                if (!created[r.IndivID] && !used[r.IndivID] && (sex === 'U' || r.Sex === sex) && test(r)) return r;
            }
            return null;
        }
        function bySex(sex, m, f, u) { return sex === 'M' ? m : sex === 'F' ? f : u; }
        var PARENTS = function () { return [t('father', 'Père'), t('mother', 'Mère')]; };

        var roleRow = {
            index: function () { return index; },
            father: function () { return parents(index, PARENTS())[0]; },
            mother: function () { return parents(index, PARENTS())[1]; },
            gpp: function () { return parents(roleRow.father(), [t('gpp', 'Grand-père pat'), t('gmp', 'Grand-mère pat')])[0]; },
            gmp: function () { return parents(roleRow.father(), [t('gpp', 'Grand-père pat'), t('gmp', 'Grand-mère pat')])[1]; },
            gpm: function () { return parents(roleRow.mother(), [t('gpm', 'Grand-père mat'), t('gmm', 'Grand-mère mat')])[0]; },
            gmm: function () { return parents(roleRow.mother(), [t('gpm', 'Grand-père mat'), t('gmm', 'Grand-mère mat')])[1]; }
        };

        function resolve(p) {
            if (p.id in rowOf) return rowOf[p.id];
            var r = null, s = p.sex || 'U';
            if (roleRow[p.role]) r = roleRow[p.role]();
            else if (p.role === 'sibling') {
                var fm = parents(index, PARENTS());
                if (p.match) r = existing(function (x) { return x !== index && String(x.FathID) === String(fm[0].IndivID) && String(x.MothID) === String(fm[1].IndivID); }, s);
                r = r || add(bySex(s, t('brother', 'Frère'), t('sister', 'Sœur'), t('sibling', 'Frère/sœur')), s, fm[0], fm[1]);
            } else if (p.role === 'half') {
                var parent = roleRow[p.side === 'P' ? 'father' : 'mother'](), other = roleRow[p.side === 'P' ? 'mother' : 'father']();
                if (p.match) r = existing(function (x) {
                    var mine = p.side === 'P' ? x.FathID : x.MothID, theirs = p.side === 'P' ? x.MothID : x.FathID;
                    return String(mine) === String(parent.IndivID) && !zero(theirs) && String(theirs) !== String(other.IndivID);
                }, s);
                if (!r) {
                    var partner = partnerOf(parent, other.IndivID, p.side === 'P' ? t('ft_otherPartnerP', 'Autre conjointe du père') : t('ft_otherPartnerM', 'Autre conjoint de la mère'));
                    var hb = p.side === 'P' ? ['halfBrotherPat', 'halfSisterPat', 'halfSiblingPat'] : ['halfBrotherMat', 'halfSisterMat', 'halfSiblingMat'];
                    r = childOf(parent, partner, bySex(s, t(hb[0], 'Demi-frère'), t(hb[1], 'Demi-sœur'), t(hb[2], 'Demi-frère/sœur')), s);
                }
            } else if (p.role === 'parentSibling') {
                var par = roleRow[p.side === 'P' ? 'father' : 'mother']();
                var gp = p.side === 'P' ? [roleRow.gpp(), roleRow.gmp()] : [roleRow.gpm(), roleRow.gmm()];
                if (p.match) r = existing(function (x) { return x !== par && String(x.FathID) === String(gp[0].IndivID) && String(x.MothID) === String(gp[1].IndivID); }, s);
                var ns = p.side === 'P' ? ['unclePat', 'auntPat', 'parentSiblingPat'] : ['uncleMat', 'auntMat', 'parentSiblingMat'];
                r = r || add(bySex(s, t(ns[0], 'Oncle'), t(ns[1], 'Tante'), t(ns[2], 'Oncle/tante')), s, gp[0], gp[1]);
            } else if (p.role === 'child' || p.role === 'childOf') {
                var ownerP = p.role === 'childOf' ? parsed.persons[p.ownerId] : null;
                var owner = ownerP ? resolve(ownerP) : index;
                if (owner) {
                    if (p.match) r = existing(function (x) { return String(x.FathID) === String(owner.IndivID) || String(x.MothID) === String(owner.IndivID); }, s);
                    if (!r) {
                        var mate = partnerOf(owner, null, owner === index ? t('ft_partner', 'Conjoint(e)') : String(t('ft_partnerOf', 'Conjoint(e) de {name}')).replace('{name}', owner.Name || owner.IndivID));
                        if (mate) {
                            var ownerRole = ownerP ? ownerP.role : 'index', cn;
                            if (ownerRole === 'index') cn = bySex(s, t('son', 'Fils'), t('daughter', 'Fille'), t('child', 'Enfant'));
                            else if (ownerRole === 'sibling' || ownerRole === 'half') cn = bySex(s, t('nephew', 'Neveu'), t('niece', 'Nièce'), t('nephewNiece', 'Neveu/nièce'));
                            else if (ownerRole === 'child' || ownerRole === 'childOf') cn = bySex(s, t('grandson', 'Petit-fils'), t('granddaughter', 'Petite-fille'), t('grandchild', 'Petit-enfant'));
                            else if (ownerRole === 'parentSibling') cn = bySex(s, t('cousinM', 'Cousin'), t('cousinF', 'Cousine'), t('cousinU', 'Cousin(e)'));
                            else cn = t('child', 'Enfant');
                            r = childOf(owner, mate, cn, s);
                        } else unhandled.push({ text: owner.Name || ('Id. ' + owner.IndivID), reason: 'sex' });
                    }
                }
            }
            if (r && !created[r.IndivID]) used[r.IndivID] = true;
            rowOf[p.id] = r;
            return r;
        }

        function cancerKey(id) {
            var keys = CANCER_KEYS[id];
            for (var i = 0; i < keys.length; i++) if (cancerKeys.indexOf(keys[i]) >= 0) return keys[i];
            return keys[0];
        }
        function show(value) { return String(value).replace(/_/g, ' '); }
        function note(r, text) { (details[r.IndivID] = details[r.IndivID] || []).push(text); touch(r); }
        function ageText(n) { return String(t('ft_age', '{n} ans')).replace('{n}', n); }

        // "Madame DUPONT Marie, née le 21/11/1960": Nom Prénom, date and year of birth, age today
        var ident = parsed.identity, today = ctx.today || new Date(), born = false;
        if (ident && ident.civilName && !index.civil_name) { index.civil_name = ident.civilName; note(index, ident.civilName); }
        if (ident && ident.dbirth && !index.dbirth) {
            index.dbirth = ident.dbirth;
            index.Yob = String(ident.yob);
            var age = today.getFullYear() - ident.yob;
            if (today.getMonth() + 1 < ident.month || (today.getMonth() + 1 === ident.month && today.getDate() < ident.day)) age--;
            index.Age = String(age);
            born = true;
            note(index, String(t('ft_born', 'né(e) le {date}')).replace('{date}', ident.dbirth) + ' (' + ageText(age) + ')');
        }

        parsed.persons.forEach(resolve);
        parsed.persons.forEach(function (p) {
            var r = rowOf[p.id], a = p.attrs;
            if (!r) return;
            var hasBreast = [1, 2, 3].some(function (i) { return /^(cancer_sein|breast_cancer)$/.test(r['Disease' + i] || ''); });
            // diseases already in the table: the same text applied twice adds nothing
            var before = [1, 2, 3].filter(function (i) { return r['Disease' + i]; }).map(function (i) { return { value: r['Disease' + i], age: String(r['Age' + i] == null ? '' : r['Age' + i]) }; });
            // year of birth, to turn "en 2022" into an age
            var yob = parseInt(r.Yob, 10);
            if (isNaN(yob) && a.age != null && !a.deceased) yob = year - a.age;
            a.diseases.forEach(function (d) {
                var id = d.cancer === 'breast' && hasBreast ? 'breast2' : d.cancer;
                if (id === 'breast') hasBreast = true;
                var value = id ? cancerKey(id) : d.label;
                var age = d.age != null ? String(d.age) : (d.year && !isNaN(yob) && d.year > yob ? String(d.year - yob) : '');
                var label = (id ? show(value) : d.label) + (age ? ' (' + ageText(age) + ')' : '');
                for (var i = 0; i < before.length; i++) {
                    if (before[i].value === value && (before[i].age === age || before[i].age === '' || age === '')) { before.splice(i, 1); return; }
                }
                for (var j = 1; j <= 3; j++) {
                    if (!r['Disease' + j]) { r['Disease' + j] = value; r['Age' + j] = age; note(r, label); return; }
                }
                r.comment = (r.comment ? r.comment + ', ' : '') + d.label + (age ? ' (' + ageText(age) + ')' : '');
                note(r, label);
            });
            if (a.deceased) {
                r.Deceased = '1';
                if (a.deathAge != null) r.Age = String(a.deathAge);
                note(r, t('ft_deceased', 'décédé(e)') + (a.deathAge != null ? ' (' + ageText(a.deathAge) + ')' : ''));
            } else if (a.age != null && !(born && r === index)) {   // the date of birth gives the age
                r.Age = String(a.age);
                r.Yob = String(year - a.age);
                note(r, ageText(a.age));
            }
        });

        // twins: the Option column ("JumMZ" / "JumDZ"); identical twins have the same sex
        var twinRows = {};
        parsed.persons.forEach(function (p) {
            var r = rowOf[p.id];
            if (!r || !p.twin) return;
            (twinRows[p.twin.id] = twinRows[p.twin.id] || { zyg: p.twin.zyg, rows: [] });
            if (twinRows[p.twin.id].rows.indexOf(r) < 0) twinRows[p.twin.id].rows.push(r);
        });
        Object.keys(twinRows).forEach(function (k) {
            var g = twinRows[k];
            if (g.rows.length < 2) return;
            var sexes = g.rows.map(function (r) { return r.Sex; }).filter(function (x) { return x === 'M' || x === 'F'; });
            var zyg = (g.zyg === 'MZ' && sexes.every(function (x) { return x === sexes[0]; })) ? 'MZ' : 'DZ';   // "?" (not said): DZ
            if (zyg === 'MZ' && sexes.length) g.rows.forEach(function (r) { if (r.Sex !== 'M' && r.Sex !== 'F') r.Sex = sexes[0]; });
            var label = zyg === 'MZ' ? t('mztwin', 'JumMZ') : t('dztwin', 'JumDZ');
            g.rows.forEach(function (r) {
                if (r.Option) return;
                r.Option = label;
                note(r, String(t(zyg === 'MZ' ? 'ft_mztwin' : 'ft_dztwin', zyg === 'MZ' ? 'jumeau/jumelle monozygote' : 'jumeau/jumelle dizygote')));
            });
        });

        var lines = touched.map(function (r) {
            return { name: r.Name || ('Id. ' + r.IndivID), isNew: !!created[r.IndivID], details: details[r.IndivID] || [] };
        });
        return { rows: obj, lines: lines, unhandled: unhandled };
    }

    root.parseFamilyText = parseFamilyText;
    root.planFamilyText = planFamilyText;
    if (typeof module !== 'undefined' && module.exports) module.exports = { parseFamilyText: parseFamilyText, planFamilyText: planFamilyText };
})(typeof window !== 'undefined' ? window : this);
