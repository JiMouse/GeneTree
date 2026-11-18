// The questionnaire of the patient page: cards without the step-by-step dialog,
// yes / no questions, a single "age or year of diagnosis" field, warnings, comment.
// usage: node questionnaire.js <page url>
const { runTests, pedigree } = require('./harness');
const { openPanel, editField, addRelatives, fillIndexFields, fillCard } = require('./drive_common');
const url = process.argv[2];

const rows = (page, hot) => page.evaluate(h => window[h].getSourceData(), hot);
const visible = (page, sel) => page.locator(sel).isVisible();
const message = (page, table, row, prop) => page.evaluate(([t, r, p]) => {
  const m = document.querySelector(`${t} [data-row="${r}"] [data-prop="${p}"] .pt-msg`); return m && m.style.display !== 'none' ? m.textContent : '';
}, [table, row, prop]);
const tests = [];
const test = (name, lang, fn) => tests.push({ name, lang, fn });
function expect(cond, msg) { if (!cond) throw new Error(msg); }

test('the number of children shows the cards at once, named "Enfant 1", "Enfant 2" (no dialog)', 'fr', async (page) => {
  await addRelatives(page, 'children', [{}, {}]);
  const names = (await rows(page, 'hotChildren')).map(r => r.Name);
  const dialogs = await page.locator('.ui-dialog:visible').count();
  expect(JSON.stringify(names) === '["Enfant 1","Enfant 2"]' && dialogs === 0, JSON.stringify(names) + ', open dialogs: ' + dialogs);
});

test('a default name follows the sex; a name typed by the patient is kept', 'fr', async (page) => {
  await addRelatives(page, 'children', [{ sex: 'F' }, {}]);
  await editField(page, 'children', 1, 'Name', 'Paul');
  await editField(page, 'children', 1, 'Sex', 'M');
  await editField(page, 'children', 0, 'Sex', 'M');
  const names = (await rows(page, 'hotChildren')).map(r => r.Name);
  expect(JSON.stringify(names) === '["Fils 1","Paul"]', JSON.stringify(names));
});

test('default names are numbered per sex: Sœur 1, Frère 1, Sœur 2', 'fr', async (page) => {
  await addRelatives(page, 'siblings', [{ sex: 'F' }, { sex: 'M' }, {}, {}]);
  let names = (await rows(page, 'hotSiblings')).map(r => r.Name);
  expect(JSON.stringify(names) === '["Sœur 1","Frère 1","Frère/Sœur 1","Frère/Sœur 2"]', 'first: ' + JSON.stringify(names));
  await editField(page, 'siblings', 2, 'Sex', 'F');
  await editField(page, 'siblings', 0, 'Name', 'Marie');
  await editField(page, 'siblings', 3, 'Sex', 'F');
  names = (await rows(page, 'hotSiblings')).map(r => r.Name);
  expect(JSON.stringify(names) === '["Marie","Frère 1","Sœur 2","Sœur 3"]', 'then: ' + JSON.stringify(names));
  await editField(page, 'siblings', 2, 'Sex', 'M');
  names = (await rows(page, 'hotSiblings')).map(r => r.Name);
  expect(JSON.stringify(names) === '["Marie","Frère 1","Frère 2","Sœur 2"]', 'after a change of sex: ' + JSON.stringify(names));
});

test('fewer relatives: empty cards removed; filled cards only after confirmation', 'fr', async (page, answers) => {
  await addRelatives(page, 'siblings', [{}, {}, { yob: '1990' }]);
  await page.fill('#siblings_input', '2'); await page.keyboard.press('Tab'); await page.waitForTimeout(200);
  expect((await rows(page, 'hotSiblings')).length === 3 && await page.inputValue('#siblings_input') === '3', 'filled card removed without confirmation');
  answers.confirm = true;
  await page.fill('#siblings_input', '1'); await page.keyboard.press('Tab'); await page.waitForTimeout(200);
  expect((await rows(page, 'hotSiblings')).length === 1, 'cards not removed after confirmation');
  answers.confirm = false;
  await page.fill('#siblings_input', '2'); await page.keyboard.press('Tab'); await page.waitForTimeout(200);
  await page.fill('#siblings_input', '1'); await page.keyboard.press('Tab'); await page.waitForTimeout(200);
  expect((await rows(page, 'hotSiblings')).length === 1, 'empty card not removed');
});

test('cancer question: the site and the "age or year" field appear on a yes only', 'fr', async (page) => {
  await addRelatives(page, 'siblings', [{ sex: 'F' }]);
  const box = '#hotSiblings [data-row="0"]';
  const q = await page.locator(`${box} [data-prop=K1] .pt-label`).innerText();
  expect(q === 'Cette sœur a-t-elle eu un cancer ?', 'question: ' + q);
  expect(!await visible(page, `${box} [data-prop=Disease1]`) && !await visible(page, `${box} [data-prop=Dx1]`), 'fields shown before the yes');
  await editField(page, 'siblings', 0, 'K1', '1');
  const label = await page.locator(`${box} [data-prop=Dx1] .pt-label`).innerText();
  expect(await visible(page, `${box} [data-prop=Disease1]`) && label === 'Âge ou année du diagnostic', 'after yes: ' + label);
  expect(!await visible(page, `${box} [data-prop=Disease2]`) && await page.locator(`${box} [data-prop=K2] .pt-label`).innerText() === 'A-t-elle eu un autre cancer ?', 'second question');
});

test('parents and grandparents: "Votre père a-t-il eu un cancer ?"...', 'fr', async (page) => {
  const qs = await page.evaluate(() => ['#hotParents', '#hotGpp', '#hotGpm'].flatMap(t => [0, 1].map(r => document.querySelector(`${t} [data-row="${r}"] [data-prop=K1] .pt-label`).textContent)));
  expect(JSON.stringify(qs) === JSON.stringify(['Votre père a-t-il eu un cancer ?', 'Votre mère a-t-elle eu un cancer ?',
    'Votre grand-père paternel a-t-il eu un cancer ?', 'Votre grand-mère paternelle a-t-elle eu un cancer ?',
    'Votre grand-père maternel a-t-il eu un cancer ?', 'Votre grand-mère maternelle a-t-elle eu un cancer ?']), JSON.stringify(qs));
  const sexShown = await page.evaluate(() => [...document.querySelectorAll('#hotParents [data-prop=Sex], #hotGpp [data-prop=Sex]')].some(e => e.style.display !== 'none'));
  expect(!sexShown, 'the sex of parents and grandparents is asked');
});

test('uncles and aunts: same card as brothers and sisters, second cancer sent', 'fr', async (page) => {
  await addRelatives(page, 'motherSiblings', [{ sex: 'M', yob: '1950', d1: 'cancer_colon', a1: '2010', d2: 'cancer_prostate', a2: '70' }]);
  expect(await page.locator('#hotMotherSiblings [data-prop=K1] .pt-label').innerText() === 'Cet oncle a-t-il eu un cancer ?', 'question');
  const u = (await pedigree(page)).find(r => r.Name === 'Oncle maternel 1');
  expect(u.FathID === '6' && u.MothID === '7' && u.Disease1 === 'cancer_colon' && u.Age1 === 60 && u.Year1 === 2010 && u.Disease2 === 'cancer_prostate' && u.Age2 === 70,
    JSON.stringify(u));
  expect(!('K1' in u) && !('Dx1' in u) && !('NameAuto' in u), 'questionnaire fields sent: ' + JSON.stringify(u));
});

test('age and year of birth are calculated from each other', 'fr', async (page) => {
  await addRelatives(page, 'children', [{ age: '20' }, { yob: '2010' }]);
  const r = await rows(page, 'hotChildren');
  expect(r[0].Yob === 2006 && r[1].Age === 16, JSON.stringify(r.map(x => [x.Age, x.Yob])));
});

test('year of birth checks: range, children after the patient, parents before', 'fr', async (page) => {
  await page.click('#dbirth'); await page.keyboard.type('15031980'); await page.keyboard.press('Tab');
  await addRelatives(page, 'children', [{ yob: '3000' }, { yob: '1985' }, { yob: '2005' }]);
  const r = await rows(page, 'hotChildren');
  expect(r[0].Age == null, '3000 gave an age: ' + r[0].Age);
  const m = [await message(page, '#hotChildren', 0, 'Yob'), await message(page, '#hotChildren', 1, 'Yob'), await message(page, '#hotChildren', 2, 'Yob')];
  expect(/entre 1900 et 2026/.test(m[0]) && /au moins 12 ans après vous/.test(m[1]) && m[2] === '', JSON.stringify(m));
  await openPanel(page, 'parents');
  await editField(page, 'parents', 0, 'Yob', '1975');
  expect(/au moins 12 ans avant vous/.test(await message(page, '#hotParents', 0, 'Yob')), 'parent too young not flagged');
  await editField(page, 'parents', 0, 'Yob', '1950');
  await openPanel(page, 'gpp');
  await editField(page, 'gpp', 0, 'Yob', '1945');
  expect(/avant votre parent/.test(await message(page, '#hotGpp', 0, 'Yob')), 'grandparent too young not flagged');
  await editField(page, 'gpp', 0, 'Age', '130');
  expect(/entre 0 et 120/.test(await message(page, '#hotGpp', 0, 'Age')), 'age 130 not flagged');
});

test('diagnosis checks: before birth, in the future, above the age', 'fr', async (page) => {
  await addRelatives(page, 'siblings', [{ yob: '1990', d1: 'cancer_sein', a1: '1985' }, { yob: '1990', d1: 'cancer_sein', a1: '2030' }, { yob: '1990', d1: 'cancer_sein', a1: '50' }, { yob: '1990', d1: 'cancer_sein', a1: '30' }]);
  const m = [];
  for (let i = 0; i < 4; i++) m.push(await message(page, '#hotSiblings', i, 'Dx1'));
  expect(/précéder la naissance/.test(m[0]) && /dans le futur/.test(m[1]) && /dépasse l'âge/.test(m[2]) && m[3] === '', JSON.stringify(m));
});

test('date of birth: an impossible or incomplete date is flagged', 'fr', async (page) => {
  await page.click('#dbirth'); await page.keyboard.type('31021980'); await page.keyboard.press('Tab');
  expect(await page.isVisible('#dbirth_msg'), 'no message for 31/02/1980 (' + await page.inputValue('#dbirth') + ')');
  await page.click('#dbirth'); await page.keyboard.press('Control+A'); await page.keyboard.press('Delete');
  await page.keyboard.type('28021980'); await page.keyboard.press('Tab');
  expect(await page.inputValue('#dbirth') === '28/02/1980', 'typed: ' + await page.inputValue('#dbirth'));
  expect(!await page.isVisible('#dbirth_msg'), 'message for a valid date');
});

test('patient\'s cancers: "another cancer?" adds and removes a block; year converted with the date of birth', 'fr', async (page, answers) => {
  await page.click('#dbirth'); await page.keyboard.type('15031980'); await page.keyboard.press('Tab');
  await page.check('#cancer_Yes');
  await editField(page, 'cancer', 0, 'Cancer', 'cancer_sein');
  await editField(page, 'cancer', 0, 'Dx', '2015');
  expect((await rows(page, 'hotCancer')).length === 1, 'a spare block is shown');
  await editField(page, 'cancer', 0, 'More', '1');
  await editField(page, 'cancer', 1, 'Cancer', 'cancer_ovaire');
  await editField(page, 'cancer', 1, 'Dx', '44');
  let p = (await pedigree(page))[0];
  expect(p.Disease1 === 'cancer_sein' && p.Age1 === 35 && p.Disease2 === 'cancer_ovaire' && p.Age2 === 44, JSON.stringify(p));
  await editField(page, 'cancer', 0, 'More', '0');                 // cancelled: the second cancer is kept
  expect((await rows(page, 'hotCancer')).length === 2 && (await rows(page, 'hotCancer'))[0].More === '1', 'second cancer removed without confirmation');
  answers.confirm = true;
  await editField(page, 'cancer', 0, 'More', '0');
  p = (await pedigree(page))[0];
  expect((await rows(page, 'hotCancer')).length === 1 && !p.Disease2, 'second cancer still there');
});

test('a group answered "no" after filling it in is not sent', 'fr', async (page) => {
  await addRelatives(page, 'siblings', [{ sex: 'M', yob: '1970' }]);
  await page.check('#siblings_No');
  expect(!(await pedigree(page)).some(r => r.Name === 'Frère 1'), 'brother sent');
});

test('the comment is the last section of the questionnaire, and is sent', 'fr', async (page) => {
  const last = await page.evaluate(() => { const p = [...document.querySelectorAll('#accordion > .panel')]; return p[p.length - 1].contains(document.getElementById('form_id_comment')); });
  const inHistory = await page.evaluate(() => document.getElementById('collapse1').contains(document.getElementById('form_id_comment')));
  expect(last && !inHistory, 'comment not at the end');
  await fillIndexFields(page, { index: { name: 'Anne', sex: 'F', comment: 'rien' } });
  expect((await pedigree(page))[0].comment === 'rien', 'comment not sent');
});

test('a whole family: what is sent to the pedigree', 'fr', async (page) => {
  await fillIndexFields(page, { index: { name: 'Anne Dupont', dbirth: '15/03/1980', sex: 'F', comment: 'note' } });
  await openPanel(page, 'cancer'); await page.check('#cancer_Yes');
  await editField(page, 'cancer', 0, 'Cancer', 'cancer_sein'); await editField(page, 'cancer', 0, 'Dx', '42');
  await addRelatives(page, 'children', [{ sex: 'M', yob: '2008' }]);
  await addRelatives(page, 'siblings', [{ sex: 'F', yob: '1978', d1: 'cancer_ovaire', a1: '45' }]);
  await openPanel(page, 'parents');
  await fillCard(page, 'parents', 1, { dead: true, yob: '1950', age: '62', d1: 'cancer_sein', a1: '1995' });
  await addRelatives(page, 'fatherSiblings', [{ sex: 'M', age: '70' }]);
  const ped = await pedigree(page);
  const brief = ped.map(r => [r.IndivID, r.Name, r.FathID, r.MothID, r.Sex, r.Deceased, r.Yob, r.Age, r.Disease1 || '', r.Age1 == null ? '' : r.Age1].join('|'));
  const expected = [
    '1|Index|2|3|F|0|1980|46|cancer_sein|42',
    '2|Père|4|5|M|0|||| ',
    '3|Mère|6|7|F|1|1950|62|cancer_sein|45',
    '4|Grand-père paternel|0|0|M|0||||', '5|Grand-mère paternelle|0|0|F|0||||',
    '6|Grand-père maternel|0|0|M|0||||', '7|Grand-mère maternelle|0|0|F|0||||',
    '8|Conjoint|0|0|M|0||||',
    '9|Fils 1|8|1|M|0|2008|18||',
    '10|Sœur 1|2|3|F|0|1978|48|cancer_ovaire|45',
    '11|Oncle paternel 1|4|5|M|0|1956|70||'].map(s => s.trim());
  const got = brief.map(s => s.trim());
  expect(JSON.stringify(got) === JSON.stringify(expected), '\n' + got.join('\n'));
});

test('language switch: default names and questions follow, typed names are kept', 'fr', async (page) => {
  await addRelatives(page, 'children', [{ sex: 'F' }, {}]);
  await editField(page, 'children', 1, 'Name', 'Paul');
  await page.evaluate(() => $('#LangSetterEng').click()); await page.waitForTimeout(1500);
  const names = (await rows(page, 'hotChildren')).map(r => r.Name);
  const q = await page.locator('#hotChildren [data-row="0"] [data-prop=K1] .pt-label').innerText();
  expect(JSON.stringify(names) === '["Daughter 1","Paul"]' && q === 'Has this child had cancer?', JSON.stringify([names, q]));
});

runTests(tests, url);
