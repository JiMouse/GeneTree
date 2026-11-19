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
function plan(text, l = fr, rows = l.D) { return planFamilyText(rows, parseFamilyText(text), { L: l.L, cancerKeys: l.K, year: 2026 }); }
// "+Sœur: cancer sein (45 ans), décédé(e) / ~Mère: …" ; unhandled after " ! "
function summary(p) {
  const lines = p.lines.map(l => (l.isNew ? '+' : '~') + l.name + (l.details.length ? ': ' + l.details.join(', ') : '')).join(' / ');
  return lines + (p.unhandled.length ? ' ! ' + p.unhandled.map(u => u.text + ' [' + u.reason + ']').join(' | ') : '');
}
const row = (p, name) => p.rows.find(r => r.Name === name);

const units = [];
const unit = (name, fn) => units.push({ name, fn });
const same = (text, expected, l) => unit(text, () => { const s = summary(plan(text, l)); expect(s === expected, '\n       got      ' + s + '\n       expected ' + expected); });

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
