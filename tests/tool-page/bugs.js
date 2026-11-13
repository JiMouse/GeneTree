// One test per fixed bug of the tool.
// usage: node bugs.js <tool url>
const path = require('path');
const { chromium, openTool } = require('./harness');
const g = require('./grid_driver');
const [url] = process.argv.slice(2);
const drv = require('./drive_new');
const tests = [];
const test = (name, lang, fn) => tests.push({ name, lang, fn });
const expect = (cond, msg) => { if (!cond) throw new Error(msg); };
const data = (page) => page.evaluate(() => hot.getSourceData());
const ids = async (page) => (await data(page)).map(r => r.IndivID).join(',');
const template = async (page, id) => { await page.evaluate(i => $('#' + i).click(), id); await page.waitForTimeout(400); };
const branch = async (page, row, fam) => {
  await g.click(page, row, 0); await g.closeCancerList(page);
  await page.evaluate(f => { for (const [k, v] of Object.entries(f)) $('#' + k).val(v); $('#submitAddBranch').click(); }, fam); await page.waitForTimeout(500);
};
const dialogText = (page) => page.evaluate(() => $('.ui-dialog:visible .ui-dialog-content').text());

test('1. summary text: no "undefined" for a person of unknown sex ("Grossesse")', 'fr', async (page) => {
  await template(page, 'nuclear');
  await page.evaluate(() => { hot.setDataAtRowProp(0, 'Option', 'Grossesse'); hot.setDataAtRowProp(0, 'Yob', 1981); });
  await page.waitForTimeout(300);
  await page.evaluate(() => $('#loadStory').click());
  const story = await page.evaluate(() => document.getElementById('story').innerHTML);
  expect(!/undefined/.test(story) && /^La personne/.test(story), 'story: ' + story.slice(0, 120));
});

test('1b. same in English', 'eng', async (page) => {
  await template(page, 'nuclear');
  await page.evaluate(() => { hot.setDataAtRowProp(0, 'Option', 'pregnancy'); hot.setDataAtRowProp(0, 'Yob', 1981); });
  await page.waitForTimeout(300);
  await page.evaluate(() => $('#loadStory').click());
  const story = await page.evaluate(() => document.getElementById('story').innerHTML);
  expect(!/undefined/.test(story), 'story: ' + story.slice(0, 120));
});

test('2. sex change: partner and children updated, listed; Continue', 'fr', async (page) => {
  await template(page, 'extended1');
  await g.type(page, 1, 4, 'F');                                   // father -> F
  const msg = await dialogText(page);
  expect(/Mère/.test(msg) && /Index/.test(msg), 'dialog: ' + msg);
  await g.dialogButton(page, 0);
  const d = await data(page);
  expect(d[1].Sex === 'F' && d[2].Sex === 'M' && d[0].FathID === '3' && d[0].MothID === '2', JSON.stringify(d.slice(0, 3).map(r => [r.Sex, r.FathID, r.MothID])));
});

test('2b. sex change cancelled: previous sex restored, nothing else changed', 'fr', async (page) => {
  await template(page, 'extended1');
  const before = JSON.stringify(await data(page));
  await g.type(page, 1, 4, 'F'); await g.dialogButton(page, 1);
  expect(JSON.stringify(await data(page)) === before, 'table changed: ' + JSON.stringify((await data(page)).slice(0, 3).map(r => [r.Sex, r.FathID, r.MothID])));
});

test('2c. sex change when the partner already has the other sex: children still fixed', 'fr', async (page) => {
  await template(page, 'extended1');
  await page.evaluate(() => hot.setDataAtRowProp(2, 'Sex', 'M', 'test'));      // mother wrongly M (no hook)
  await g.type(page, 1, 4, 'F');                                                // father -> F
  await g.dialogButton(page, 0);
  const d = await data(page);
  expect(d[0].FathID === '3' && d[0].MothID === '2', 'index parents: ' + JSON.stringify([d[0].FathID, d[0].MothID]));
});

test('3. deleting a row updates the copy saved in the session', 'fr', async (page) => {
  await template(page, 'extended1');
  await branch(page, 0, { brother: 1 });
  const n = (await data(page)).length;
  await drv.removeRow(page, 1);
  const saved = await page.evaluate(() => JSON.parse(sessionStorage.getItem('hotData')).length);
  expect((await data(page)).length === n - 1 && saved === n - 1, `table ${(await data(page)).length}, session ${saved}, expected ${n - 1}`);
});

test('4. the index case and his/her ancestors cannot be deleted', 'fr', async (page, alerts) => {
  await template(page, 'extended1');
  const before = await ids(page);
  await drv.removeRow(page, 1);                                    // father
  await drv.removeRow(page, 5);                                    // maternal grandfather
  await drv.removeRow(page, 0);                                    // index
  expect(await ids(page) === before && alerts.length === 3 && /ne peut pas être supprimé/.test(alerts[0]), 'ids ' + (await ids(page)) + ' alerts ' + JSON.stringify(alerts));
});

test('4b. deleting a partner with children: the list is shown; Cancel deletes nobody', 'fr', async (page) => {
  await template(page, 'extended1');
  await branch(page, 0, { son: 1 });                               // index gets a partner and a son
  const before = await ids(page), d = await data(page);
  const partner = d.findIndex(r => String(r.FathID) === '0' && String(r.MothID) === '0' && r.Sex === 'M' && d.some(c => c.FathID === r.IndivID));
  await drv.removeRow(page, partner);
  const msg = await dialogText(page);
  await g.dialogButton(page, 1);
  expect(/Seront aussi supprimés/.test(msg) && await ids(page) === before, 'dialog "' + msg + '", ids ' + (await ids(page)));
});

test('4c. same, Continue: partner and son deleted, index and parents kept', 'fr', async (page) => {
  await template(page, 'extended1');
  await branch(page, 0, { son: 1 });
  const d = await data(page);
  const partner = d.findIndex(r => String(r.FathID) === '0' && String(r.MothID) === '0' && r.Sex === 'M' && d.some(c => c.FathID === r.IndivID));
  const son = d.findIndex(r => r.FathID === d[partner].IndivID);
  await drv.removeRow(page, partner); await g.dialogButton(page, 0);
  const after = (await data(page)).map(r => r.IndivID);
  expect(!after.includes(d[partner].IndivID) && !after.includes(d[son].IndivID) && ['1', '2', '3', '4', '5', '6', '7'].every(i => after.includes(i)), 'ids ' + after.join(','));
});

test('5. rows pasted from Excel get the family number, affected, alive', 'fr', async (page) => {
  await template(page, 'extended1');
  await g.paste(page, 6, 0, 'Grand-Mère mat\t7\t0\t0\tF\t0\nOncle\t8\t6\t7\tM');
  const d = await data(page);
  expect(d[7].FamID === '1' && d[7].Affected === '1' && d[7].Deceased === '0', JSON.stringify(d[7]));
  await page.evaluate(() => $('#loadFromHot').click()); await page.waitForTimeout(400);
});

test('6. TSV export header: "Décès"', 'fr', async (page) => {
  const dl = page.waitForEvent('download');
  await page.evaluate(() => $('#export_file').click());
  const text = require('fs').readFileSync(await (await dl).path(), 'utf8');
  expect(text.startsWith('"Nom"\t"Id."\t"Père"\t"Mère"\t"Sexe"\t"Décès"'), text.slice(0, 80));
});

// BOADICEA / CanRisk downloads: blocked while a member with a cancer used by CanRisk
// (breast, ovary, prostate, pancreas) has no valid age; other cancers are not checked.
const setRows = (page, rows) => page.evaluate(r => {
  for (const [row, values] of Object.entries(r)) for (const [k, v] of Object.entries(values)) hot.setDataAtRowProp(Number(row), k, v, 'test');
}, rows);
const index = { Age: '46', Yob: '1980' };
const downloads = (page) => { const d = []; page.on('download', x => d.push(x)); return d; };
const canriskOpen = (page) => page.evaluate(() => $('#save-canrisk-dialog').is(':visible'));

test('7. BOADICEA: blocked when a member with prostate cancer has no age', 'fr', async (page, alerts) => {
  await template(page, 'nuclear');
  await setRows(page, { 0: index, 1: { Disease1: 'cancer_prostate', Age1: '60' } });
  const dl = downloads(page);
  await page.evaluate(() => $('#exportBOADICEA').click()); await page.waitForTimeout(500);
  expect(dl.length === 0 && alerts.length === 1 && /BOADICEA non conforme/.test(alerts[0]) && /âge valide/.test(alerts[0])
    && /Père : âge ou année de naissance manquant/.test(alerts[0]), 'downloads ' + dl.length + ', alerts ' + JSON.stringify(alerts));
});

test('7b. BOADICEA: a cancer not used by CanRisk (colon) without age does not block', 'fr', async (page, alerts) => {
  await template(page, 'nuclear');
  await setRows(page, { 0: index, 1: { Disease1: 'cancer_colon', Age1: '60' } });
  const dl = page.waitForEvent('download', { timeout: 3000 });
  await page.evaluate(() => $('#exportBOADICEA').click());
  await dl;
  expect(alerts.length === 0, 'alerts ' + JSON.stringify(alerts));
});

test('7c. BOADICEA: blocked when the age at diagnosis is above the age', 'fr', async (page, alerts) => {
  await template(page, 'nuclear');
  await setRows(page, { 0: index, 2: { Age: '50', Yob: '1976', Disease1: 'cancer_ovaire', Age1: '62' } });
  await page.evaluate(() => $('#exportBOADICEA').click()); await page.waitForTimeout(500);
  expect(alerts.length === 1 && /Mère : âge au diagnostic du cancer de l'ovaire \(62\)/.test(alerts[0]), 'alerts ' + JSON.stringify(alerts));
});

test('7d. BOADICEA: blocked when age and year of birth do not agree', 'fr', async (page, alerts) => {
  await template(page, 'nuclear');
  await setRows(page, { 0: index, 2: { Age: '50', Yob: '1960', Disease1: 'cancer_sein', Age1: '45' } });
  await page.evaluate(() => $('#exportBOADICEA').click()); await page.waitForTimeout(500);
  expect(alerts.length === 1 && /Mère : l'âge \(50 ans\) et l'année de naissance \(1960\) ne concordent pas/.test(alerts[0]), 'alerts ' + JSON.stringify(alerts));
});

test('7e. CanRisk: blocked (dialog not opened) when a member with breast cancer has no age', 'fr', async (page, alerts) => {
  await template(page, 'nuclear');
  await setRows(page, { 0: index, 2: { Disease1: 'cancer_sein', Age1: '45' } });
  await page.evaluate(() => $('#save_canrisk_fromHot').click()); await page.waitForTimeout(500);
  expect(!(await canriskOpen(page)) && alerts.length === 1 && /CanRisk non conforme/.test(alerts[0]) && /Mère/.test(alerts[0]), 'alerts ' + JSON.stringify(alerts));
});

test('7f. CanRisk: valid ages, unknown age at diagnosis: downloaded, written "AU"', 'fr', async (page, alerts) => {
  await template(page, 'nuclear');
  await setRows(page, { 0: index, 1: { Age: '76', Yob: '1950', Disease1: 'cancer_prostate', Age1: '' }, 2: { Disease1: 'cancer_colon' } });
  await page.evaluate(() => $('#save_canrisk_fromHot').click()); await page.waitForTimeout(500);
  expect(await canriskOpen(page) && alerts.length === 0, 'dialog not opened, alerts ' + JSON.stringify(alerts));
  const dl = page.waitForEvent('download');
  await page.evaluate(() => $('#cr_file_save').click());
  const lines = require('fs').readFileSync(await (await dl).path(), 'utf8').split('\n');
  const head = lines.find(l => l.startsWith('##FamID')).split('\t'), father = lines.find(l => l.split('\t')[3] === '2').split('\t');
  expect(father[head.indexOf('PRO')] === 'AU', 'father row: ' + father.join(' | '));
});

test('7g. same check in English', 'eng', async (page, alerts) => {
  await template(page, 'nuclear');
  await setRows(page, { 0: index, 1: { Disease1: 'pancreatic_cancer', Age1: '70' } });
  await page.evaluate(() => $('#save_canrisk_fromHot').click()); await page.waitForTimeout(500);
  expect(!(await canriskOpen(page)) && alerts.length === 1 && /CanRisk file not compliant/.test(alerts[0]) && /age or year of birth missing/.test(alerts[0]), 'alerts ' + JSON.stringify(alerts));
});

(async () => {
  const b = await chromium.launch(); let failed = 0;
  for (const t of tests) {
    const { ctx, page, errors, alerts } = await openTool(b, url, t.lang);
    try {
      await t.fn(page, alerts);
      expect(!errors.length, 'page errors: ' + errors.join(' | '));
      console.log('PASS ' + t.name);
    } catch (e) { failed++; console.log('FAIL ' + t.name + '\n     ' + e.message.split('\n')[0]); }
    await ctx.close();
  }
  console.log(`${tests.length - failed}/${tests.length} passed`); await b.close(); process.exit(failed ? 1 : 0);
})();
