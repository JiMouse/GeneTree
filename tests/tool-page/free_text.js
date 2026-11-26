// Free-text family history (js/text-family.js): relatives, half-siblings, diseases, deaths, ages.
// usage: node free_text.js <tool url>
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { chromium, openTool } = require('./harness');
const { parseFamilyText, planFamilyText } = require(path.join(__dirname, '../../js/text-family.js'));
const [url] = process.argv.slice(2);
const expect = (cond, msg) => { if (!cond) throw new Error(msg); };

// ---- 1. Without a browser: the text, the plan on the default family (index, father, mother).
function language(code) {
  const c = {};
  vm.createContext(c);
  vm.runInContext(fs.readFileSync(path.join(__dirname, `../../lang/lang.${code}.js`), 'utf8') + ';this.L = lang; this.K = onco_full(); this.D = myData;', c);
  return c;
}
const fr = language('fr'), eng = language('eng');
function plan(text, l = fr, rows = l.D) { return planFamilyText(rows, parseFamilyText(text), { L: l.L, cancerKeys: l.K, year: 2026, today: new Date('2026-11-11T10:00:00') }); }
// "+Sœur: cancer sein (45 ans), décédé(e) / ~Mère: …" ; unhandled after " ! "
function summary(p) {
  const lines = p.lines.map(l => (l.isNew ? '+' : '~') + l.name + (l.details.length ? ': ' + l.details.join(', ') : '')).join(' / ');
  return lines + (p.unhandled.length ? ' ! ' + p.unhandled.map(u => u.text + ' [' + u.reason + ']').join(' | ') : '');
}
const row = (p, name) => p.rows.find(r => r.Name === name);

const units = [];
const unit = (name, fn) => units.push({ name, fn });
const short = (text) => { const t = text.replace(/\s+/g, ' ').trim(); return t.length > 110 ? t.slice(0, 107) + '…' : t; };
const same = (text, expected, l) => unit(short(text), () => { const s = summary(plan(text, l)); expect(s === expected, '\n       got      ' + s + '\n       expected ' + expected); });

// relatives
same('il a 3 frères et soeurs', '+Frère/sœur / +Frère/sœur2 / +Frère/sœur3');
same('Elle a deux frères et une sœur. Elle a 3 enfants dont 2 filles.', '+Frère / +Frère2 / +Sœur / +Conjoint(e) / +Fille / +Fille2 / +Enfant');
same('Elle a un grand frère et une petite sœur.', '+Frère / +Sœur');
same('Son père a 2 frères et une sœur, sa mère a trois sœurs.',
  '+Grand-Père pat / +Grand-Mère pat / +Oncle pat / +Oncle pat2 / +Tante pat / +Grand-Père mat / +Grand-Mère mat / +Tante mat / +Tante mat2 / +Tante mat3');
same('côté paternel : 2 oncles. Côté maternel, une tante.', '+Grand-Père pat / +Grand-Mère pat / +Oncle pat / +Oncle pat2 / +Grand-Père mat / +Grand-Mère mat / +Tante mat');
same('fils unique, pas d\'enfant', '');
// half-siblings
same('Il a un demi-frère paternel et 2 demi-sœurs du côté de sa mère.',
  '+Autre conjointe du père / +Demi-frère pat / +Autre conjoint de la mère / +Demi-sœur mat / +Demi-sœur mat2');
same('Son père a 2 autres enfants d\'une autre union.', '+Autre conjointe du père / +Demi-frère/sœur pat / +Demi-frère/sœur pat2');
same('Un demi-frère.', ' ! Un demi-frère [side]');
unit('half-siblings share the father, not the mother; one new partner for all', () => {
  const p = plan('Il a 2 demi-frères paternels.');
  const a = row(p, 'Demi-frère pat'), b = row(p, 'Demi-frère pat2'), partner = row(p, 'Autre conjointe du père');
  expect(a.FathID === '2' && b.FathID === '2' && a.MothID === partner.IndivID && b.MothID === partner.IndivID && partner.Sex === 'F', JSON.stringify([a, b, partner]));
});
// diseases, deaths, ages
same('Elle a 2 sœurs dont une décédée d\'un cancer du sein à 45 ans. Sa mère a eu un cancer de l\'ovaire à 52 ans, elle est décédée à 60 ans.',
  '+Sœur: cancer sein (45 ans), décédé(e) / +Sœur2 / ~Mère: cancer ovaire (52 ans), décédé(e) (60 ans)');
same('Père : K prostate (65), DCD 72 ans. Mère : cancer du sein bilatéral à 40 et 55 ans.',
  '~Père: cancer prostate (65 ans), décédé(e) (72 ans) / ~Mère: cancer sein (40 ans), cancer sein2 (55 ans)');
same('Cancer du sein chez sa mère à 48 ans. Son frère, 40 ans, a eu un mélanome à 35 ans.', '+Frère: mélanome (35 ans), 40 ans / ~Mère: cancer sein (48 ans)');
same('Côté maternel : grand-père DCD d\'un infarctus à 60 ans, une tante atteinte d\'un cancer de l\'endomètre à 50 ans.',
  '+Grand-Père mat: infarctus (60 ans), décédé(e) / +Grand-Mère mat / +Tante mat: cancer utérus (50 ans)');
same('Sa tante maternelle a un diabète de type 2 et un cancer du col de l\'utérus.', '+Grand-Père mat / +Grand-Mère mat / +Tante mat: diabète de type 2, cancer du col de l\'utérus');
same('Sa mère n\'a pas eu de cancer. Pas de cancer dans la famille. Son père est en bonne santé, 70 ans.', '~Père: 70 ans');
same('Il a 45 ans. Ses grands-parents paternels sont décédés. Sa grand-mère a eu un cancer du pancréas.',
  '+Grand-Père pat: décédé(e) / +Grand-Mère pat: cancer pancréas, décédé(e) / ~Index: 45 ans');
// nephews, cousins, grandchildren through a named relative
same('Son petit frère a 3 enfants, dont un fils atteint de leucémie.', '+Frère / +Conjoint(e) de Frère / +Neveu: leucémie / +Neveu/nièce / +Neveu/nièce2');
same('Sa tante paternelle a une fille, décédée d\'un sarcome à 20 ans.', '+Grand-Père pat / +Grand-Mère pat / +Tante pat / +Conjoint(e) de Tante pat / +Cousine: sarcome (20 ans), décédé(e)');
// enumerations, a long anamnesis
same('Elle a 2 enfants, un fils de 15 ans et une fille de 12 ans.', '+Conjoint(e) / +Fils: 15 ans / +Fille: 12 ans');
same('Il a 3 frères et sœurs : 2 frères et une sœur.', '+Frère / +Frère2 / +Sœur');
same('Madame X, 42 ans, consulte pour un cancer du sein diagnostiqué à 38 ans. Elle a un frère de 45 ans en bonne santé et une sœur décédée d\'un cancer de l\'ovaire à 41 ans. '
   + 'Elle a également un demi-frère paternel. Sa mère, 68 ans, a été traitée pour un cancer du sein à 55 ans. Son père est décédé à 70 ans d\'un infarctus. '
   + 'Côté maternel, la grand-mère est décédée d\'un cancer du sein à 60 ans ; une tante maternelle a eu un cancer du pancréas à 58 ans. Pas d\'autre antécédent.',
  '+Frère: 45 ans / +Sœur: cancer ovaire (41 ans), décédé(e) / +Autre conjointe du père / +Demi-frère pat / +Grand-Père mat / +Grand-Mère mat: cancer sein (60 ans), décédé(e) / '
  + '+Tante mat: cancer pancréas (58 ans) / ~Index: cancer sein (38 ans), 42 ans / ~Mère: cancer sein (55 ans), 68 ans / ~Père: infarctus, décédé(e) (70 ans)');
// what is left to the user
same('Un oncle a eu un cancer du poumon. Sa cousine a eu une leucémie. Antécédent de cancer du pancréas.',
  ' ! Un oncle a eu un cancer du poumon [side] | Sa cousine a eu une leucémie [relative] | Antécédent de cancer du pancréas [orphan]');
// English
same('She has two brothers and a sister. Her mother had breast cancer at 45 and died at 60. Her father\'s brother had colon cancer at age 50.',
  '+Brother / +Brother2 / +Sister / +GrandFather pat / +GrandMother pat / +Uncle pat: colon cancer (50 y) / ~Mother: breast cancer (45 y), deceased (60 y)', eng);
same('He has a paternal half-brother. His maternal grandmother died of ovarian cancer.',
  '+Father\'s other partner / +Half-brother pat / +GrandFather mat / +GrandMother mat: ovarian cancer, deceased', eng);
// the table
unit('table: disease columns, death, age and year of birth', () => {
  const p = plan('Sa mère a eu un cancer du sein à 45 ans et un cancer de l\'ovaire à 50 ans, décédée à 60 ans. Il a 40 ans.');
  const m = row(p, 'Mère'), i = row(p, 'Index');
  expect(m.Disease1 === 'cancer_sein' && m.Age1 === '45' && m.Disease2 === 'cancer_ovaire' && m.Age2 === '50' && m.Deceased === '1' && m.Age === '60', JSON.stringify(m));
  expect(i.Age === '40' && i.Yob === '1986', JSON.stringify(i));
});
unit('English page: English cancer keys', () => {
  const m = row(plan('Her mother had breast cancer.', eng), 'Mother');
  expect(m.Disease1 === 'breast_cancer', JSON.stringify(m));
});
unit('a fourth disease goes to the comment', () => {
  const m = row(plan('Sa mère a eu un cancer du sein, un cancer du côlon, un mélanome et un cancer du rein.'), 'Mère');
  expect(m.Disease3 === 'mélanome' && /cancer du rein/.test(m.comment || ''), JSON.stringify(m));
});
unit('the same text twice: "son frère" is the brother already in the table, no disease twice', () => {
  const once = plan('Son frère a eu un cancer du côlon à 50 ans.');
  const twice = plan('Son frère a eu un cancer du côlon à 50 ans.', fr, once.rows);
  expect(twice.rows.length === once.rows.length, 'rows ' + once.rows.length + ' -> ' + twice.rows.length);
  expect(row(twice, 'Frère').Disease2 === '', JSON.stringify(row(twice, 'Frère')));
});
unit('existing half-brother and uncle are reused', () => {
  const first = plan('Il a un demi-frère paternel. Son père a un frère.');
  const p = plan('Son demi-frère paternel a eu un cancer du rein. Son oncle paternel est décédé.', fr, first.rows);
  expect(p.rows.length === first.rows.length, 'rows ' + first.rows.length + ' -> ' + p.rows.length);
  expect(row(p, 'Demi-frère pat').Disease1 === 'cancer_rein' && row(p, 'Oncle pat').Deceased === '1', summary(p));
});

// a letter pasted from a PDF (fixtures/courrier-oncogenetique.txt, invented identity): lines cut
// in the middle of a sentence, "Il est décédé." after "son père…", "pour l'un… pour l'autre…",
// "deux mélanomes, le premier… le second en 2022"
const COURRIER = fs.readFileSync(path.join(__dirname, 'fixtures/courrier-oncogenetique.txt'), 'utf8');
same(COURRIER, '~Index: DUPONT Marie, né(e) le 21/11/1960 (65 ans), mélanome (56 ans), mélanome (62 ans), carcinome basocellulaire de l\'épaule / '
  + '+Frère: cancer colon (45 ans) / +Grand-Père pat / +Grand-Mère pat: cancer estomac, décédé(e) (49 ans) / +Oncle pat: cancer estomac, décédé(e) / '
  + '+Oncle pat2: cancer pancréas, décédé(e) / ~Père: lymphome, décédé(e) / ~Mère: cancer colon, tumeur cérébrale');
unit('the letter gives exactly the family of fixtures/courrier-oncogenetique.json', () => {
  const want = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures/courrier-oncogenetique.json'), 'utf8'));
  const got = plan(COURRIER).rows;
  const clean = (rows) => rows.map(r => JSON.stringify(Object.keys(r).sort().filter(k => r[k] !== '' && r[k] != null).map(k => [k, String(r[k])])));
  const a = clean(got), b = clean(want);
  const diff = a.filter((x, i) => x !== b[i]).map((x, i) => x + '\n         want ' + b[a.indexOf(x)]);
  expect(a.length === b.length && !diff.length, '\n         ' + (a.length !== b.length ? a.length + ' rows for ' + b.length : diff.join('\n         ')));
});
same('Son frère a eu un\ncancer du côlon à 50 ans.', '+Frère: cancer colon (50 ans)');
same('Père : cancer du côlon\nMère : cancer du sein', '~Père: cancer colon / ~Mère: cancer sein');
same('Madame X. Son père a eu un lymphome. Il est décédé.', '~Père: lymphome, décédé(e)');
same('Monsieur Y. Son père a eu un cancer du côlon. Il est décédé à 70 ans.', '~Père: cancer colon, décédé(e) (70 ans)');
same('Deux de ses oncles paternels ont eu pour l’un un cancer de l’estomac et pour l’autre un cancer du pancréas, également décédés.',
  '+Grand-Père pat / +Grand-Mère pat / +Oncle pat: cancer estomac, décédé(e) / +Oncle pat2: cancer pancréas, décédé(e)');
same('Il a deux frères, l\'un a eu un mélanome, l\'autre un cancer du rein.', '+Frère: mélanome / +Frère2: cancer rein');
same('Elle a eu deux cancers du sein à 40 et 55 ans.', '~Index: cancer sein (40 ans), cancer sein2 (55 ans)');
same('Elle a 60 ans. Elle a eu deux mélanomes, le premier en 2016 à l\'âge de 50 ans et le second en 2022.', '~Index: mélanome (50 ans), mélanome (56 ans), 60 ans');
same('Elle a 50 ans. Elle a eu un cancer du sein en 2016.', '~Index: cancer sein (40 ans), 50 ans');
same('Sa mère a eu deux mélanomes.', '~Mère: mélanome, mélanome');
same('Her father had two melanomas, the first at 50 and the second at 61.', '~Father: melanoma (50 y), melanoma (61 y)', eng);
// the index case's identity: "Nom Prénom" (surname in capitals first), date of birth, age today
same('Monsieur Jean MARTIN, né le 3 mars 1955, consulte.', '~Index: MARTIN Jean, né(e) le 03/03/1955 (71 ans)');
same('Madame LE GALL Anne-Sophie, née le 1er janvier 1980.', '~Index: LE GALL Anne-Sophie, né(e) le 01/01/1980 (46 ans)');
same('Je vois Madame DUPONT Marie (née le 21.11.1960) pour un cancer du sein à 50 ans.', '~Index: DUPONT Marie, né(e) le 21/11/1960 (65 ans), cancer sein (50 ans)');
same('Mme DURAND, 42 ans, consulte.', '~Index: DURAND, 42 ans');
same('Madame Martin consulte pour un cancer du sein.', '~Index: cancer sein');
same('Son père, Monsieur DUPONT Jean, est décédé.', '~Père: décédé(e)');
same('Mrs Jane SMITH, born on 02/05/1970, has a brother.', '~Index: SMITH Jane, born 02/05/1970 (56 y) / +Brother', eng);
unit('identity: a "Nom Prénom" or a date of birth already in the table is kept', () => {
  const rows = JSON.parse(JSON.stringify(fr.D));
  Object.assign(rows[0], { civil_name: 'DUPONT Marie-Claire', dbirth: '01/02/1961', Yob: '1961', Age: '65' });
  const i = row(plan('Madame DUPONT Marie, née le 21/11/1960.', fr, rows), 'Index');
  expect(i.civil_name === 'DUPONT Marie-Claire' && i.dbirth === '01/02/1961' && i.Yob === '1961', JSON.stringify(i));
});
// twins: the Option column, dizygotic unless said otherwise; identical twins have the same sex
same('Elle a une sœur jumelle.', '+Sœur: jumeau/jumelle dizygote / ~Index: jumeau/jumelle dizygote');
same('Elle a une sœur jumelle monozygote, décédée à 40 ans.', '+Sœur: décédé(e) (40 ans), jumeau/jumelle monozygote / ~Index: jumeau/jumelle monozygote');
same('Elle a une sœur jumelle, de vraies jumelles.', '+Sœur: jumeau/jumelle monozygote / ~Index: jumeau/jumelle monozygote');
same('Sa sœur a une jumelle.', '+Sœur: jumeau/jumelle dizygote / +Sœur2: jumeau/jumelle dizygote');
same('Elle et sa sœur sont jumelles.', '+Sœur: jumeau/jumelle dizygote / ~Index: jumeau/jumelle dizygote');
same('Elle est jumelle.', '+Frère/sœur: jumeau/jumelle dizygote / ~Index: jumeau/jumelle dizygote');
same('Elle a deux frères jumeaux et une sœur.', '+Frère: jumeau/jumelle dizygote / +Frère2: jumeau/jumelle dizygote / +Sœur');
same('Il a deux frères, de vrais jumeaux.', '+Frère: jumeau/jumelle monozygote / +Frère2: jumeau/jumelle monozygote');
same('Elle a des jumeaux de 5 ans.', '+Conjoint(e) / +Enfant: 5 ans, jumeau/jumelle dizygote / +Enfant2: 5 ans, jumeau/jumelle dizygote');
same('Ses deux fils sont jumeaux monozygotes.', '+Conjoint(e) / +Fils: jumeau/jumelle monozygote / +Fils2: jumeau/jumelle monozygote');
same('Elle a un fils et une fille jumeaux.', '+Conjoint(e) / +Fils: jumeau/jumelle dizygote / +Fille: jumeau/jumelle dizygote');
same('Son père a un frère jumeau.', '+Grand-Père pat / +Grand-Mère pat / +Oncle pat: jumeau/jumelle dizygote / ~Père: jumeau/jumelle dizygote');
same('Elle a un frère jumeau monozygote.', '+Frère: jumeau/jumelle dizygote / ~Index: jumeau/jumelle dizygote');
same('She has an identical twin sister.', '+Sister: identical twin / ~Index: identical twin', eng);
same('She has twin daughters.', '+Partner / +Daughter: fraternal twin / +Daughter2: fraternal twin', eng);
unit('twins: "JumDZ" / "JumMZ" in the Option column', () => {
  const p = plan('Elle a une sœur jumelle. Elle a deux fils, de vrais jumeaux.');
  expect(row(p, 'Index').Option === 'JumDZ' && row(p, 'Sœur').Option === 'JumDZ' && row(p, 'Fils').Option === 'JumMZ' && row(p, 'Fils2').Option === 'JumMZ',
    JSON.stringify(p.rows.map(r => [r.Name, r.Option])));
});

unit('the same text twice: the two melanomas are not added again', () => {
  const t = 'Elle a 60 ans. Elle a eu deux mélanomes, le premier à 50 ans et le second à 56 ans. Sa mère a eu deux mélanomes.';
  const once = plan(t), twice = plan(t, fr, once.rows), i = row(twice, 'Index'), m = row(twice, 'Mère');
  expect(i.Disease1 === 'mélanome' && i.Age1 === '50' && i.Disease2 === 'mélanome' && i.Age2 === '56' && i.Disease3 === '', JSON.stringify(i));
  expect(m.Disease1 === 'mélanome' && m.Disease2 === 'mélanome' && m.Disease3 === '', JSON.stringify(m));
});

let unitFailed = 0;
for (const u of units) {
  try { u.fn(); console.log('PASS text: ' + u.name); }
  catch (e) { unitFailed++; console.log('FAIL text: ' + u.name + e.message); }
}

// ---- 2. In the tool.
const tests = [];
const test = (name, lang, fn) => tests.push({ name, lang, fn });
const openMenu = (page) => page.evaluate(() => $('#dropdownFam .dropdown-toggle').click());
const data = (page) => page.evaluate(() => hot.getSourceData());
const TEXT = 'Elle a 2 sœurs dont une décédée d\'un cancer du sein à 45 ans. Son père a un demi-frère paternel. Une cousine.';

test('Analyser: preview, menu open, nothing changed yet', 'fr', async (page) => {
  await page.evaluate(() => $('#nuclear').click()); await page.waitForTimeout(400);
  const before = JSON.stringify(await data(page));
  await openMenu(page);
  await page.fill('#freeText', TEXT);
  await page.click('#freeTextAnalyse');
  const lines = await page.$$eval('#freeTextResult li', li => li.map(x => x.textContent));
  expect(lines.length === 2 && lines[0] === 'Sœur (nouveau) : cancer sein (45 ans), décédé(e)', 'lines: ' + JSON.stringify(lines));
  const result = await page.textContent('#freeTextResult');
  expect(/Vérifiez avant/.test(result) && /Non ajoutés.*demi-frère paternel.*Une cousine/.test(result), 'result: ' + result);
  expect(await page.isVisible('#freeTextApply') && await page.isVisible('#freeText'), 'apply button or menu');
  expect(JSON.stringify(await data(page)) === before, 'table changed before Ajouter');
});

test('Ajouter à l\'arbre: rows, disease, death; drawn; story written', 'fr', async (page) => {
  await page.evaluate(() => $('#nuclear').click()); await page.waitForTimeout(400);
  await openMenu(page);
  await page.fill('#freeText', TEXT);
  await page.click('#freeTextAnalyse');
  await page.click('#freeTextApply');
  await page.waitForTimeout(600);
  const d = await data(page);
  const sister = d.find(r => r.Name === 'Sœur');
  expect(sister && sister.Disease1 === 'cancer_sein' && sister.Age1 === '45' && sister.Deceased === '1' && sister.FathID === '2' && sister.MothID === '3', JSON.stringify(sister));
  // "son père a un demi-frère": a half-brother of the father -> listed, not added
  expect(!d.some(r => /Demi-frère/.test(r.Name)), 'half-brother of the father added: ' + d.map(r => r.Name));
  expect(/Ajouté à l'arbre/.test(await page.textContent('#freeTextResult')) && !(await page.isVisible('#freeTextApply')), 'done message');
  const nodes = await page.evaluate(() => document.querySelectorAll('#pedigrees svg .node').length);
  expect(nodes >= d.length, 'pedigree nodes ' + nodes + ' for ' + d.length + ' rows');
  await page.evaluate(() => $('#loadStory').click());
  const story = await page.evaluate(() => document.getElementById('story').innerHTML);
  expect(/sein/.test(story) && !/undefined/.test(story), 'story: ' + story.slice(0, 300));
});

test('the oncogenetics letter pasted in: table, drawing ("mélanome: 56, 62") and text of the letter', 'fr', async (page) => {
  await page.evaluate(() => $('#nuclear').click()); await page.waitForTimeout(400);
  await openMenu(page);
  await page.fill('#freeText', COURRIER);
  await page.click('#freeTextAnalyse');
  const preview = await page.textContent('#freeTextResult');
  expect(/DUPONT Marie/.test(preview) && !/Non ajoutés/.test(preview), 'preview: ' + preview);
  await page.click('#freeTextApply'); await page.waitForTimeout(700);
  const i = (await data(page))[0];
  expect(i.civil_name === 'DUPONT Marie' && i.dbirth === '21/11/1960' && i.Yob === '1960' && i.Disease2 === 'mélanome' && i.Age2 === '62', JSON.stringify(i));
  const labels = await page.evaluate(() => $('#pedigree .indi_details').map((k, e) => e.textContent).get());
  expect(labels.includes('mélanome: 56, 62'), 'labels: ' + labels.filter(x => x).join(' | '));
  await page.evaluate(() => $('#loadStory').click());
  const story = (await page.evaluate(() => document.getElementById('story').innerHTML)).replace(/<br>/g, '\n');
  for (const want of ['Madame DUPONT Marie est née le 21/11/1960 (65 ans)', 'dans le cadre de deux mélanomes diagnostiqués en 2016 et 2022 à l\'âge de 56 et 62 ans',
                      'Son père est décédé.', 'Sa grand-mère paternelle est décédée à 49 ans.', 'un frère (décédé) suivi pour un cancer du pancréas'])
    expect(story.includes(want), 'missing: ' + want + '\n' + story);
});

test('twins in the text: Option column, drawn as twins', 'fr', async (page) => {
  await page.evaluate(() => $('#nuclear').click()); await page.waitForTimeout(400);
  await openMenu(page);
  await page.fill('#freeText', 'Elle a une sœur jumelle. Elle a deux fils, de vrais jumeaux.');
  await page.click('#freeTextAnalyse'); await page.click('#freeTextApply'); await page.waitForTimeout(700);
  const d = await data(page);
  expect(d[0].Option === 'JumDZ' && d.find(r => r.Name === 'Sœur').Option === 'JumDZ' && d.filter(r => r.Option === 'JumMZ').length === 2, JSON.stringify(d.map(r => [r.Name, r.Option])));
  const ped = await page.evaluate(() => window.__ped[window.__ped.length - 1]);
  expect(ped.filter(p => p.dztwin).length === 2 && ped.filter(p => p.mztwin).length === 2, JSON.stringify(ped.map(p => [p.display_name, p.mztwin, p.dztwin])));
});

test('half-siblings and a grandparent drawn in the pedigree', 'fr', async (page) => {
  await page.evaluate(() => $('#nuclear').click()); await page.waitForTimeout(400);
  await openMenu(page);
  await page.fill('#freeText', 'Il a un demi-frère paternel et une demi-sœur maternelle. Grand-mère paternelle : K pancréas à 70 ans.');
  await page.click('#freeTextAnalyse');
  await page.click('#freeTextApply');
  await page.waitForTimeout(600);
  const d = await data(page);
  const names = d.map(r => r.Name);
  expect(['Demi-frère pat', 'Demi-sœur mat', 'Autre conjointe du père', 'Autre conjoint de la mère', 'Grand-Mère pat'].every(n => names.includes(n)), names.join(','));
  const nodes = await page.evaluate(() => document.querySelectorAll('#pedigrees svg .node').length);
  expect(nodes >= d.length, 'pedigree nodes ' + nodes + ' for ' + d.length + ' rows');
});

test('editing the text hides the old preview', 'fr', async (page) => {
  await openMenu(page);
  await page.fill('#freeText', 'Il a 2 frères.');
  await page.click('#freeTextAnalyse');
  expect(await page.isVisible('#freeTextApply'), 'no apply button');
  await page.type('#freeText', ' Sa mère');
  expect(!(await page.isVisible('#freeTextApply')) && (await page.textContent('#freeTextResult')) === '', 'old preview still shown');
});

test('nothing recognised: a hint, no button', 'fr', async (page) => {
  await openMenu(page);
  await page.fill('#freeText', 'Consultation pour conseil génétique.');
  await page.click('#freeTextAnalyse');
  expect(/Rien de reconnu/.test(await page.textContent('#freeTextResult')) && !(await page.isVisible('#freeTextApply')), 'hint');
});

test('English page: labels, English keys, Ctrl+Enter', 'eng', async (page) => {
  await page.evaluate(() => $('#nuclear').click()); await page.waitForTimeout(400);
  await openMenu(page);
  expect(await page.textContent('#freeTextAnalyse') === 'Analyse', 'button: ' + await page.textContent('#freeTextAnalyse'));
  await page.fill('#freeText', 'Her mother had breast cancer at 45. She has a brother.');
  await page.press('#freeText', 'Control+Enter');
  await page.click('#freeTextApply');
  await page.waitForTimeout(500);
  const d = await data(page);
  expect(d.find(r => r.Name === 'Mother').Disease1 === 'breast_cancer' && d.some(r => r.Name === 'Brother'), JSON.stringify(d.map(r => [r.Name, r.Disease1])));
});

(async () => {
  const b = await chromium.launch(); let failed = unitFailed;
  for (const t of tests) {
    const { ctx, page, errors } = await openTool(b, url, t.lang);
    try {
      await t.fn(page);
      expect(!errors.length, 'page errors: ' + errors.join(' | '));
      console.log('PASS ' + t.name);
    } catch (e) { failed++; console.log('FAIL ' + t.name + '\n     ' + e.message.split('\n')[0]); }
    await ctx.close();
  }
  const total = units.length + tests.length;
  console.log(`${total - failed}/${total} passed`); await b.close(); process.exit(failed ? 1 : 0);
})();
