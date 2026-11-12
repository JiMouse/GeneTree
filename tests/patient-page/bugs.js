// One test per fixed bug of the patient page.
// usage: node bugs.js <page url>
const path = require('path');
const { chromium, openPage } = require('./harness');
const { openPanel, pickCancer, addRelatives } = require('./drive_common');
const [url] = process.argv.slice(2);
const { editCell } = require('./drive_new');
const isNew = url.includes('patient.html');

const rows = (page, hot) => page.evaluate(h => window[h].getSourceData(), hot);
const tests = [];
const test = (name, lang, fn) => tests.push({ name, lang, fn });
function expect(cond, msg) { if (!cond) throw new Error(msg); }

test('1. relative dialog is emptied between groups (no carry-over)', 'fr', async (page) => {
  await addRelatives(page, 'fatherSiblings', [{ sex: 'F', yob: '1950', d1: 'cancer_ovaire', a1: '60', d2: 'cancer_sein', a2: '65', comment: 'tante' }]);
  // open the next group and look at the dialog before typing anything
  await openPanel(page, 'motherSiblings');
  await page.check('#motherSiblings_Yes'); await page.fill('#motherSiblings_input', '1'); await page.locator('#motherSiblings_input').blur();
  await page.locator('.ui-dialog:has(#defineInd)').waitFor({ state: 'visible' }); await page.waitForTimeout(550);
  const shown = await page.evaluate(() => ({ d1: $('#IndDisease1Input').val(), d2: $('#IndDisease2Input').val(), c: $('#IndCommentInput').val(), yob: $('#yobIndInput').val(), cancer: $('input[name=diseaseStatus]:checked').val() }));
  expect(!shown.d1 && !shown.d2 && !shown.c && !shown.yob && shown.cancer === '0', 'dialog not empty: ' + JSON.stringify(shown));
  await page.check('#defineInd input[name=sex][value=M]'); await page.fill('#yobIndInput', '1948');
  await page.locator('.ui-dialog:has(#defineInd) .ui-dialog-buttonpane button').first().click(); await page.waitForTimeout(500);
  const uncle = (await rows(page, 'hotMotherSiblings'))[0];
  expect(!uncle.Disease1 && !uncle.Disease2 && !uncle.comment, 'uncle inherited: ' + JSON.stringify(uncle));
});

test('1b. a cancer answered "no" after being filled in is not saved', 'fr', async (page) => {
  await openPanel(page, 'children');
  await page.check('#children_Yes'); await page.fill('#children_input', '1'); await page.locator('#children_input').blur();
  await page.locator('.ui-dialog:has(#defineInd)').waitFor({ state: 'visible' }); await page.waitForTimeout(550);
  await page.check('#defineInd input[name=sex][value=F]'); await page.fill('#yobIndInput', '1995');
  await page.check('#defineInd input[name=diseaseStatus][value="1"]'); await page.click('#IndDisease1Input'); await pickCancer(page, 'cancer_sein');
  await page.fill('#IndDisease1Age', '25');
  await page.check('#defineInd input[name=diseaseStatus][value="0"]');
  await page.locator('.ui-dialog:has(#defineInd) .ui-dialog-buttonpane button').first().click(); await page.waitForTimeout(500);
  const child = (await rows(page, 'hotChildren'))[0];
  expect(!child.Disease1 && !child.Age1, 'hidden cancer saved: ' + JSON.stringify(child));
});

test('2. year of diagnosis typed in the table gives the right age', 'fr', async (page) => {
  await openPanel(page, 'parents');
  await editCell(page, 'parents', 1, 'Yob', '1954');
  await editCell(page, 'parents', 1, 'Disease1', 'cancer_ovaire');
  await editCell(page, 'parents', 1, 'Year1', '2015');
  const m = (await rows(page, 'hotParents'))[1];
  expect(m.Age1 === 61 && m.Year1 === 2015, 'mother: ' + JSON.stringify(m));
});

test('2b. year of diagnosis typed in the dialog is converted to an age', 'fr', async (page) => {
  await addRelatives(page, 'children', [{ sex: 'F', yob: '1990', d1: 'cancer_sein', a1: '2020' }]);
  const c = (await rows(page, 'hotChildren'))[0];
  expect(c.Age1 === '30' && c.Year1 === 2020, 'child: ' + JSON.stringify(c));
});

test('2c. age at diagnosis for a relative added by the dialog (year of birth stored as text)', 'fr', async (page) => {
  await addRelatives(page, 'children', [{ sex: 'M', yob: '2000' }]);
  await openPanel(page, 'children');
  await editCell(page, 'children', 0, 'Disease1', 'cancer_colon');
  await editCell(page, 'children', 0, 'Age1', '24');
  const c = (await rows(page, 'hotChildren'))[0];
  expect(c.Age1 === 24 && c.Year1 === 2024, 'child: ' + JSON.stringify(c));
});

test('3. clearing an age keeps the year of birth', 'fr', async (page) => {
  await openPanel(page, 'parents');
  await editCell(page, 'parents', 0, 'Age', '60');
  await editCell(page, 'parents', 0, 'Age', '');
  const f = (await rows(page, 'hotParents'))[0];
  expect(f.Yob === 1966 && (f.Age === null || f.Age === ''), 'father: ' + JSON.stringify(f));
});

test('4. text in an age field does not erase the year of birth', 'fr', async (page) => {
  await openPanel(page, 'parents');
  await editCell(page, 'parents', 1, 'Yob', '1950');
  await editCell(page, 'parents', 1, 'Age', 'environ 76');
  const m = (await rows(page, 'hotParents'))[1];
  expect(m.Yob === 1950, 'mother: ' + JSON.stringify(m));
  if (isNew) expect(await page.locator('#hotParents [id$="-r1-Age"]').evaluate(e => e.classList.contains('pt-invalid')), 'age field not marked invalid');
});

test('5. clicking the words "Homme" and "Oui" selects the right button', 'fr', async (page) => {
  await page.locator('label[for="index_id_sex_0"]').click();
  expect(await page.isChecked('#index_id_sex_0'), 'clicking "Homme" does not select the patient as a man');
  await openPanel(page, 'children');
  await page.check('#children_Yes'); await page.fill('#children_input', '1'); await page.locator('#children_input').blur();
  await page.locator('.ui-dialog:has(#defineInd)').waitFor({ state: 'visible' }); await page.waitForTimeout(550);
  await page.check('#defineInd input[name=sex][value=F]');
  await page.locator('#deadInd label', { hasText: 'Oui' }).click();
  const st = await page.evaluate(() => ({ dead: $('input[name=deadStatus]:checked').val(), sex: $('input[name=sex]:checked').val() }));
  expect(st.dead === '1' && st.sex === 'F', 'clicking "Oui" (deceased) gave ' + JSON.stringify(st));
});

test('6. relatives get readable names', 'fr', async (page) => {
  await addRelatives(page, 'siblings', [{ sex: 'M', yob: '1970' }, { sex: 'F', yob: '1972' }]);
  await addRelatives(page, 'fatherSiblings', [{ sex: 'F', yob: '1945' }]);
  const names = [...(await rows(page, 'hotSiblings')), ...(await rows(page, 'hotFatherSiblings'))].map(r => r.Name);
  expect(JSON.stringify(names) === JSON.stringify(['Frère 1', 'Sœur 2', 'Tante paternelle 1']), 'names: ' + JSON.stringify(names));
});

test('6b. names, dialog title and button in English', 'eng', async (page) => {
  await openPanel(page, 'children');
  await page.check('#children_Yes'); await page.fill('#children_input', '1'); await page.locator('#children_input').blur();
  const dlg = page.locator('.ui-dialog:has(#defineInd)'); await dlg.waitFor({ state: 'visible' }); await page.waitForTimeout(550);
  const title = await dlg.locator('.ui-dialog-title').innerText(), button = await dlg.locator('.ui-dialog-buttonpane button').first().innerText();
  expect(title === 'Child 1' && button === 'Save', `title "${title}", button "${button}"`);
  await page.check('#defineInd input[name=sex][value=M]'); await page.fill('#yobIndInput', '2001');
  await dlg.locator('.ui-dialog-buttonpane button').first().click(); await page.waitForTimeout(500);
  expect((await rows(page, 'hotChildren'))[0].Name === 'Son 1', 'name: ' + (await rows(page, 'hotChildren'))[0].Name);
});

test('7. English page: no French yes/no, typo fixed, download button text', 'eng', async (page) => {
  const t = await page.evaluate(() => ({ yes: $('label[for=cancer_Yes]').text().trim(), no: $('label[for=siblings_No]').text().trim(), q: $('#ui_cancer').text(), dl: $('#ui_dl').text(), c2: $('#ui_ind_cancer2').text() }));
  expect(t.yes === 'Yes' && t.no === 'No' && t.q === 'Have you ever had cancer?' && t.dl === 'Download the two files to send to your doctor' && t.c2 === 'Second cancer', JSON.stringify(t));
});

test('8. deceased relative with an age instead of a year of birth: dialog stays open', 'fr', async (page) => {
  await openPanel(page, 'siblings');
  await page.check('#siblings_Yes'); await page.fill('#siblings_input', '1'); await page.locator('#siblings_input').blur();
  const dlg = page.locator('.ui-dialog:has(#defineInd)'); await dlg.waitFor({ state: 'visible' }); await page.waitForTimeout(550);
  await page.check('#defineInd input[name=sex][value=M]'); await page.fill('#yobIndInput', '60');
  await page.check('#defineInd input[name=deadStatus][value="1"]'); await page.fill('#deathyIndInput', '2010');
  await dlg.locator('.ui-dialog-buttonpane button').first().click(); await page.waitForTimeout(500);
  expect(await dlg.isVisible() && (await rows(page, 'hotSiblings')).length === 0, 'relative saved with an age as year of birth');
  await page.fill('#yobIndInput', '1950');
  await dlg.locator('.ui-dialog-buttonpane button').first().click(); await page.waitForTimeout(500);
  const s = (await rows(page, 'hotSiblings'))[0];
  expect(s && s.Yob === '1950' && s.Age === 60, 'after correction: ' + JSON.stringify(s));
});

(async () => {
  const b = await chromium.launch(); let failed = 0;
  for (const t of tests) {
    const { ctx, page, errors } = await openPage(b, url, t.lang);
    const alerts = errors.filter(e => e.startsWith('alert'));
    try { await t.fn(page); const errs = errors.filter(e => !e.startsWith('alert')); if (errs.length) throw new Error('page errors: ' + errs.join(' | ')); console.log('PASS ' + t.name); }
    catch (e) { failed++; console.log('FAIL ' + t.name + '\n     ' + e.message.split('\n')[0]); }
    await ctx.close();
  }
  console.log(`${tests.length - failed}/${tests.length} passed`); await b.close(); process.exit(failed ? 1 : 0);
})();
