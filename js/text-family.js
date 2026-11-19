// Free-text family description -> counts for createFamily().
// Runs entirely in the browser: no model, no network.
//
// parseFamilyText("il a 3 frères et sœurs, son père a 2 sœurs")
//   -> { counts: { sibling: 3, auntP: 2 }, unhandled: [] }
//
// Keys match createFamily(): brother, sister, sibling (sex unknown),
// son, daughter, child (sex unknown), uncleP, auntP, uncleM, auntM.
// "unhandled" lists the pieces of text that mention relatives the form
// cannot add (half-siblings, cousins, uncles without a side…), so the
// user knows to add them by hand.

(function (root) {
    'use strict';

    var NUMBERS = {
        un: 1, une: 1, deux: 2, trois: 3, quatre: 4, cinq: 5, six: 6, sept: 7,
        huit: 8, neuf: 9, dix: 10, onze: 11, douze: 12, treize: 13,
        quatorze: 14, quinze: 15, seize: 16,
        a: 1, an: 1, one: 1, two: 2, three: 3, four: 4, five: 5,
        seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12
    };
    var NUM = '(\\d{1,2}|un|une|deux|trois|quatre|cinq|six|sept|huit|neuf|dix|onze|douze|treize|quatorze|quinze|seize'
            + '|an?|one|two|three|four|five|seven|eight|nine|ten|eleven|twelve)';

    // Order matters: the combined forms come before the single ones.
    var KIN = [
        { re: 'freres? (?:et|ou) soeurs?|soeurs? (?:et|ou) freres?|brothers? (?:and|or) sisters?|sisters? (?:and|or) brothers?|siblings?', kind: 'sibling', sex: 'U' },
        { re: 'oncles? (?:et|ou) tantes?|tantes? (?:et|ou) oncles?|uncles? (?:and|or) aunts?|aunts? (?:and|or) uncles?', kind: 'parentSibling', sex: 'U' },
        { re: 'freres?|brothers?', kind: 'sibling', sex: 'M' },
        { re: 'soeurs?|sisters?', kind: 'sibling', sex: 'F' },
        { re: 'enfants?|children|child|kids?', kind: 'child', sex: 'U' },
        { re: 'fils|garcons?|sons?|boys?', kind: 'child', sex: 'M' },
        { re: 'filles?|daughters?|girls?', kind: 'child', sex: 'F' },
        { re: 'oncles?|uncles?', kind: 'parentSibling', sex: 'M' },
        { re: 'tantes?|aunts?', kind: 'parentSibling', sex: 'F' }
    ];
    var KIN_RE = KIN.map(function (k) { return '(' + k.re + ')'; }).join('|');

    var SIDE_P = /^\s*(?:paternel(?:le)?s?|du cote (?:paternel|du pere)|cote paternel|on (?:the|his|her) father'?s side|paternal)/;
    var SIDE_M = /^\s*(?:maternel(?:le)?s?|du cote (?:maternel|de la mere)|cote maternel|on (?:the|his|her) mother'?s side|maternal)/;
    var BEFORE_P = /(?:paternal|paternel(?:le)?s?)\s*$/;
    var BEFORE_M = /(?:maternal|maternel(?:le)?s?)\s*$/;

    // Who "has" the relatives that follow: the father, the mother, or the patient.
    // branch: true for "côté paternel", which also places uncles and aunts.
    var CONTEXT = [
        { re: /\b(?:pere|papa|father|dad)\s+(?:a eu|a|avait|aurait|has|had)\b|\b(?:father|dad)'s (?:brothers?|sisters?|siblings?)\b/g, side: 'P' },
        { re: /\b(?:mere|maman|mother|mum|mom)\s+(?:a eu|a|avait|aurait|has|had)\b|\b(?:mother|mum|mom)'s (?:brothers?|sisters?|siblings?)\b/g, side: 'M' },
        { re: /\bcote (?:paternel|du pere)\b|\bbranche paternelle\b|\b(?:father'?s|paternal) side\b/g, side: 'P', branch: true },
        { re: /\bcote (?:maternel|de la mere)\b|\bbranche maternelle\b|\b(?:mother'?s|maternal) side\b/g, side: 'M', branch: true },
        { re: /\b(?:il|elle|patient|patiente|madame|monsieur|mme|je|j ai|he|she|i)\s+(?:a eu|a|avait|ai|has|had|have)\b|\bil y a\b/g, side: '' }
    ];

    // Lower case, no accents, "œ" -> "oe", single spaces; map[i] is the position
    // in the original text of normalised character i (to quote the user's own words).
    function normalise(text) {
        var src = String(text || ''), out = '', map = [];
        for (var i = 0; i < src.length; i++) {
            var c = src[i].toLowerCase();
            c = c === 'œ' ? 'oe' : c === 'æ' ? 'ae' : c.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
            if (/[’`]/.test(c)) c = "'";
            if (/[ \t]/.test(c)) { if (out.slice(-1) === ' ') continue; c = ' '; }
            for (var j = 0; j < c.length; j++) { out += c[j]; map.push(i); }
        }
        // elisions: "j'ai" -> "j ai", "d'enfant" -> "d enfant" (same length)
        out = out.replace(/\b([jdln])'/g, '$1 ');
        map.push(src.length);
        return { text: out, map: map, src: src };
    }

    function toNumber(word) {
        if (/^\d+$/.test(word)) return parseInt(word, 10);
        return NUMBERS[word] || 0;
    }

    // The last context marker before position pos: { side: 'P' | 'M' | '', branch }.
    function contextAt(segment, pos) {
        var best = { at: -1, side: '', branch: false };
        CONTEXT.forEach(function (c) {
            c.re.lastIndex = 0;
            var m;
            while ((m = c.re.exec(segment)) !== null) {
                if (m.index < pos && m.index > best.at) best = { at: m.index, side: c.side, branch: !!c.branch };
            }
        });
        return best;
    }

    function add(counts, key, n) {
        if (n > 0) counts[key] = (counts[key] || 0) + n;
    }

    function parseFamilyText(text) {
        var counts = {}, unhandled = [];
        var norm = normalise(text);
        // Sentences, with their offset in the normalised text.
        var sentences = [], sm, splitter = /[^.;!?\n]+/g;
        while ((sm = splitter.exec(norm.text)) !== null) sentences.push({ text: sm[0], at: sm.index });
        // "2 autres petites sœurs", "un demi-frère", "3 petits-enfants"…
        var ADJ = '(?:autres?\\s+|other\\s+)?(?:(?:grande?s?|petite?s?|jeunes?|older|younger|elder|big|little)\\s+)?';
        var PREFIX = '(demi[- ]?|half[- ]?|step[- ]?|beaux?-|belles?-|petite?s?-|grande?s?-|great[- ]|arriere-)?';
        var matcher = new RegExp('\\b' + NUM + '\\s+' + ADJ + PREFIX + '(?:' + KIN_RE + ')\\b', 'g');

        sentences.forEach(function (sent) {
            var sentence = sent.text;
            if (!sentence.trim()) return;
            // A group of unknown sex ("3 enfants") that a later "dont 2 filles" splits.
            var group = null;
            var m;
            matcher.lastIndex = 0;
            while ((m = matcher.exec(sentence)) !== null) {
                var n = toNumber(m[1]);
                var prefix = m[2];
                var k = -1;
                for (var i = 0; i < KIN.length; i++) { if (m[3 + i]) { k = i; break; } }
                var kin = KIN[k];
                // The user's own words, for the "not added" list.
                var start = sent.at + m.index, end = start + m[0].length;
                var raw = norm.src.slice(norm.map[start], norm.map[end - 1] + 1).trim();
                var before = sentence.slice(0, m.index);
                var after = sentence.slice(m.index + m[0].length);

                if (prefix) { unhandled.push(raw); group = null; continue; }
                if (!n) continue;

                // "3 enfants dont 2 filles": "dont" between the group and this match.
                var between = group ? sentence.slice(group.end, m.index) : '';
                var isPart = group && group.kind === kin.kind && kin.sex !== 'U' && /\b(?:dont|including|of whom|of which)\b/.test(between);

                if (kin.kind === 'sibling' || kin.kind === 'child') {
                    var context = contextAt(sentence, m.index).side;
                    if (context && kin.kind === 'sibling') {
                        // The father's or mother's brothers and sisters.
                        addParentSibling(counts, unhandled, kin.sex, context, n, raw);
                        group = null;
                        continue;
                    }
                    if (context && kin.kind === 'child') {
                        // The parents' children: the patient's siblings, the patient among them.
                        unhandled.push(raw);
                        group = null;
                        continue;
                    }
                    var keyU = kin.kind === 'sibling' ? 'sibling' : 'child';
                    var keyM = kin.kind === 'sibling' ? 'brother' : 'son';
                    var keyF = kin.kind === 'sibling' ? 'sister' : 'daughter';
                    if (isPart) {
                        var take = Math.min(n, group.left);
                        counts[keyU] -= take;
                        if (!counts[keyU]) delete counts[keyU];
                        group.left -= take;
                        add(counts, kin.sex === 'M' ? keyM : keyF, take);
                        continue;
                    }
                    if (kin.sex === 'U') {
                        add(counts, keyU, n);
                        group = { kind: kin.kind, left: n, end: m.index + m[0].length };
                    } else {
                        add(counts, kin.sex === 'M' ? keyM : keyF, n);
                        group = null;
                    }
                    continue;
                }

                // Uncles and aunts: the side comes from the words around them or the context.
                // The side comes from the words around them or a "côté paternel" before them.
                // Without a side (or for the parents' own uncles), the form cannot place them.
                var ctx = contextAt(sentence, m.index);
                var side = SIDE_P.test(after) || BEFORE_P.test(before) ? 'P'
                         : SIDE_M.test(after) || BEFORE_M.test(before) ? 'M'
                         : ctx.branch ? ctx.side : '';
                addParentSibling(counts, unhandled, kin.sex, side, n, raw);
                group = null;
            }
        });
        return { counts: counts, unhandled: unhandled };
    }

    function addParentSibling(counts, unhandled, sex, side, n, raw) {
        if (!side || sex === 'U') { unhandled.push(raw); return; }
        add(counts, (sex === 'M' ? 'uncle' : 'aunt') + side, n);
    }

    root.parseFamilyText = parseFamilyText;
    if (typeof module !== 'undefined' && module.exports) module.exports = { parseFamilyText: parseFamilyText };
})(typeof window !== 'undefined' ? window : this);
