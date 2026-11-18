// One test per fixed bug of the patient page.
// usage: node bugs.js <page url>
const { runTests, pedigree } = require('./harness');
const { openPanel, editField, addRelatives } = require('./drive_common');
const url = process.argv[2];

const rows = (page, hot) => page.evaluate(h => window[h].getSourceData(), hot);
const tests = [];
const test = (name, lang, fn) => tests.push({ name, lang, fn });
function expect(cond, msg) { if (!cond) throw new Error(msg); }

test('1. a new group of relatives starts empty (no carry-over from the previous one)', 'fr', async (page) => {
  await addRelatives(page, 'fatherSiblings', [{ sex: 'F', yob: '1950', d1: 'cancer_ovaire', a1: '60', d2: 'cancer_sein', a2: '65', comment: 'tante' }]);
  await addRelatives(page, 'motherSiblings', [{ sex: 'M', yob: '1948' }]);
  const uncle = (await rows(page, 'hotMotherSiblings'))[0];
  expect(!uncle.Disease1 && !uncle.Disease2 && !uncle.comment && uncle.K1 === '0', 'uncle inherited: ' + JSON.stringify(uncle));
});

test('1b. a cancer answered "no" after being filled in is not sent', 'fr', async (page) => {
  await addRelatives(page, 'children', [{ sex: 'F', yob: '1995', d1: 'cancer_sein', a1: '25' }]);
  await editField(page, 'children', 0, 'K1', '0');
  const child = (await pedigree(page)).find(r => r.Name === 'Fille 1');
  expect(child && !child.Disease1 && !child.Age1, 'hidden cancer sent: ' + JSON.stringify(child));
});

test('2. year of diagnosis gives the right age', 'fr', async (page) => {
  await openPanel(page, 'parents');
  await editField(page, 'parents', 1, 'Yob', '1954');
  await editField(page, 'parents', 1, 'K1', '1');
  await editField(page, 'parents', 1, 'Disease1', 'cancer_ovaire');
  await editField(page, 'parents', 1, 'Dx1', '2015');
  const m = (await pedigree(page)).find(r => r.IndivID === '3');
  expect(m.Age1 === 61 && m.Year1 === 2015, 'mother: ' + JSON.stringify(m));
});

test('2b. age at diagnosis gives the year of diagnosis', 'fr', async (page) => {
  await addRelatives(page, 'children', [{ sex: 'M', yob: '2000', d1: 'cancer_colon', a1: '24' }]);
  const c = (await pedigree(page)).find(r => r.Name === 'Fils 1');
  expect(c.Age1 === 24 && c.Year1 === 2024, 'child: ' + JSON.stringify(c));
});

test('3. clearing an age keeps the year of birth', 'fr', async (page) => {
  await openPanel(page, 'parents');
  await editField(page, 'parents', 0, 'Age', '60');
  await editField(page, 'parents', 0, 'Age', '');
  const f = (await rows(page, 'hotParents'))[0];
  expect(f.Yob === 1966 && (f.Age === null || f.Age === ''), 'father: ' + JSON.stringify(f));
});

test('4. text in an age field does not erase the year of birth, and is flagged', 'fr', async (page) => {
  await openPanel(page, 'parents');
  await editField(page, 'parents', 1, 'Yob', '1950');
  await editField(page, 'parents', 1, 'Age', 'environ 76');
  const m = (await rows(page, 'hotParents'))[1];
  expect(m.Yob === 1950, 'mother: ' + JSON.stringify(m));
  expect(await page.locator('#hotParents [id$="-r1-Age"]').evaluate(e => e.classList.contains('pt-invalid')), 'age field not marked invalid');
});

test('5. clicking the words "Homme", "Femme" and "Oui" selects the right button', 'fr', async (page) => {
  await page.locator('label[for="index_id_sex_0"]').click();
  expect(await page.isChecked('#index_id_sex_0'), 'clicking "Homme" does not select the patient as a man');
  await addRelatives(page, 'children', [{}]);
  await page.locator('#hotChildren [data-prop=Sex] label', { hasText: 'Femme' }).click();
  await page.locator('#hotChildren [data-prop=K1] label', { hasText: 'Oui' }).click();
  const c = (await rows(page, 'hotChildren'))[0];
  expect(c.Sex === 'F' && c.K1 === '1', 'clicking the words gave ' + JSON.stringify([c.Sex, c.K1]));
});

test('6. relatives get readable names', 'fr', async (page) => {
  await addRelatives(page, 'siblings', [{ sex: 'M', yob: '1970' }, { sex: 'F', yob: '1972' }]);
  await addRelatives(page, 'fatherSiblings', [{ sex: 'F', yob: '1945' }]);
  const names = [...(await rows(page, 'hotSiblings')), ...(await rows(page, 'hotFatherSiblings'))].map(r => r.Name);
  expect(JSON.stringify(names) === JSON.stringify(['Frère 1', 'Sœur 1', 'Tante paternelle 1']), 'names: ' + JSON.stringify(names));
});

test('6b. names and questions in English', 'eng', async (page) => {
  await addRelatives(page, 'children', [{}]);
  const before = (await rows(page, 'hotChildren'))[0].Name;
  await editField(page, 'children', 0, 'Sex', 'M');
  const q = await page.locator('#hotChildren [data-prop=K1] .pt-label').innerText();
  expect(before === 'Child 1' && (await rows(page, 'hotChildren'))[0].Name === 'Son 1' && q === 'Has this child had cancer?', JSON.stringify([before, q]));
});

test('7. English page: no French yes/no, download button text', 'eng', async (page) => {
  const t = await page.evaluate(() => ({ yes: $('label[for=cancer_Yes]').text().trim(), no: $('label[for=siblings_No]').text().trim(), q: $('#ui_cancer').text(), dl: $('#ui_dl').text() }));
  expect(t.yes === 'Yes' && t.no === 'No' && t.q === 'Have you ever had cancer?' && t.dl === 'Download the file to send to your doctor', JSON.stringify(t));
});

test('8. deceased relative: the age is the age at death, the year of birth is not recalculated', 'fr', async (page) => {
  await addRelatives(page, 'siblings', [{ sex: 'M', dead: true, yob: '1950', age: '60' }]);
  const s = (await rows(page, 'hotSiblings'))[0];
  const label = await page.locator('#hotSiblings [data-prop=Age] .pt-label').innerText();
  expect(s.Yob === 1950 && s.Age === 60 && label === 'Âge au décès', JSON.stringify([s.Yob, s.Age, label]));
});

runTests(tests, url);
