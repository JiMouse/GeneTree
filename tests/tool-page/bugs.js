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

test('7e. CanRisk: blocked (no file) when a member with breast cancer has no age', 'fr', async (page, alerts) => {
  await template(page, 'nuclear');
  await setRows(page, { 0: index, 2: { Disease1: 'cancer_sein', Age1: '45' } });
  const dl = downloads(page);
  await page.evaluate(() => $('#save_canrisk_fromHot').click()); await page.waitForTimeout(500);
  expect(dl.length === 0 && alerts.length === 1 && /CanRisk non conforme/.test(alerts[0]) && /Mère/.test(alerts[0]), 'alerts ' + JSON.stringify(alerts));
});

test('7f. CanRisk: valid ages, unknown age at diagnosis: downloaded, written "AU"', 'fr', async (page, alerts) => {
  await template(page, 'nuclear');
  await setRows(page, { 0: index, 1: { Age: '76', Yob: '1950', Disease1: 'cancer_prostate', Age1: '' }, 2: { Disease1: 'cancer_colon' } });
  const dl = page.waitForEvent('download');
  await page.evaluate(() => $('#save_canrisk_fromHot').click());
  expect(alerts.length === 0, 'alerts ' + JSON.stringify(alerts));
  const lines = require('fs').readFileSync(await (await dl).path(), 'utf8').split('\n');
  const head = lines.find(l => l.startsWith('##FamID')).split('\t'), father = lines.find(l => l.split('\t')[3] === '2').split('\t');
  expect(father[head.indexOf('PRO')] === 'AU', 'father row: ' + father.join(' | '));
});

test('7g. same check in English', 'eng', async (page, alerts) => {
  await template(page, 'nuclear');
  await setRows(page, { 0: index, 1: { Disease1: 'pancreatic_cancer', Age1: '70' } });
  await page.evaluate(() => $('#save_canrisk_fromHot').click()); await page.waitForTimeout(500);
  expect(alerts.length === 1 && /CanRisk file not compliant/.test(alerts[0]) && /age or year of birth missing/.test(alerts[0]), 'alerts ' + JSON.stringify(alerts));
});

test('8. resetting the drawing does not grey out the personal information fields', 'fr', async (page) => {
  await template(page, 'extended1');
  await page.evaluate(() => $('#pedigrees .fa-refresh').first().click()); await page.waitForTimeout(300);
  await g.dialogButton(page, 0); await page.waitForTimeout(500);
  const disabled = await page.evaluate(() => $('#supp_info fieldset').map(function () { return this.disabled; }).get());
  expect(disabled.length && disabled.every(d => !d), 'disabled fieldsets: ' + JSON.stringify(disabled));
});

test('8b. "Informations" after a table reset while a removed row was selected: no crash, index shown', 'fr', async (page) => {
  await template(page, 'extended1');
  await g.click(page, 6, 0); await g.closeCancerList(page);
  await page.evaluate(() => $('#reset').click()); await g.dialogButton(page, 0); await page.waitForTimeout(500);
  await page.evaluate(() => $('#supp_edit_info').click()); await page.waitForTimeout(400);
  const name = await page.evaluate(() => $('#form_id_name').val());
  expect(name === 'Index', 'name field: ' + name);
});

test('9. CanRisk: no dialog, file named after the index case ("Nom Prénom")', 'fr', async (page, alerts) => {
  await template(page, 'nuclear');
  await setRows(page, { 0: { ...index, civil_name: 'Martin Paul' } });
  const dl = page.waitForEvent('download');
  await page.evaluate(() => $('#save_canrisk_fromHot').click());
  const d = await dl, text = require('fs').readFileSync(await d.path(), 'utf8');
  const visible = await page.evaluate(() => $('.ui-dialog:visible').length);
  expect(d.suggestedFilename() === 'canrisk_Martin_Paul.txt' && /\nMartin_Paul\t/.test(text) && visible === 0,
    d.suggestedFilename() + ', dialogs ' + visible + ', FamID lines: ' + text.split('\n').filter(l => !l.startsWith('#')).map(l => l.split('\t')[0]).join(','));
});

test('9b. CanRisk without a name: canrisk.txt', 'fr', async (page) => {
  await template(page, 'nuclear');
  await setRows(page, { 0: index });
  const dl = page.waitForEvent('download');
  await page.evaluate(() => $('#save_canrisk_fromHot').click());
  expect((await dl).suggestedFilename() === 'canrisk.txt', (await dl).suggestedFilename());
});

// a disease could not be removed: clicking a disease cell always opens the list of cancers
const colOf = (page, prop) => page.evaluate(p => hot._colIndex(p), prop);

test('10. disease list: "Supprimer la maladie" empties the disease and its age, one Ctrl+Z restores both', 'fr', async (page) => {
  await template(page, 'nuclear');
  await setRows(page, { 0: { Disease1: 'cancer_sein', Age1: '40', Disease2: 'cancer_colon', Age2: '50' } });
  await g.click(page, 0, await colOf(page, 'Disease2'));
  await page.locator('#cancerList #removeDisease').waitFor({ state: 'visible' });
  expect(/Supprimer la maladie/.test(await page.locator('#removeDisease').innerText()), 'button text');
  await page.locator('#removeDisease').click(); await page.waitForTimeout(300);
  let d = (await data(page))[0];
  const open = await page.evaluate(() => $('#cancerList').dialog('isOpen'));
  expect(!d.Disease2 && !d.Age2 && d.Disease1 === 'cancer_sein' && String(d.Age1) === '40' && !open, JSON.stringify([d.Disease1, d.Age1, d.Disease2, d.Age2, open]));
  await page.keyboard.press('Control+Z'); await page.waitForTimeout(300);
  d = (await data(page))[0];
  expect(d.Disease2 === 'cancer_colon' && String(d.Age2) === '50', 'after undo: ' + JSON.stringify([d.Disease2, d.Age2]));
});

test('10b. disease list: no "Supprimer la maladie" on an empty disease cell; button in English and in HPO mode', 'eng', async (page) => {
  await template(page, 'nuclear');
  await g.click(page, 0, await colOf(page, 'Disease3'));
  await page.locator('#cancerList').waitFor({ state: 'visible' });
  expect(await page.locator('#removeDisease').count() === 0, 'button shown on an empty cell');
  await g.closeCancerList(page);
  await setRows(page, { 1: { Disease1: 'Abnormality of the eye', Age1: '' } });
  await page.evaluate(() => { const c = document.getElementById('myCheckHPO'); if (!c.checked) c.click(); });
  await page.waitForTimeout(300);
  await g.click(page, 1, await colOf(page, 'Disease1'));
  await page.locator('#cancerList #removeDisease').waitFor({ state: 'visible' });
  expect(/Remove the disease/.test(await page.locator('#removeDisease').innerText()), 'button text');
  await page.locator('#removeDisease').click(); await page.waitForTimeout(300);
  expect(!(await data(page))[1].Disease1, 'HPO disease not removed');
});

// "Nom Prénom" of "Ajouter des informations à un individu" also fills the Name column,
// but only while the name is still the default one ("Index", "Père", "Oncle pat2"...)
const infoSave = async (page, row, civil, name) => {
  await g.click(page, row, 0); await g.closeCancerList(page);
  await page.evaluate(() => $('#supp_edit_info').click()); await page.waitForTimeout(400);
  await page.evaluate(([c, n]) => { $('#civil_name').val(c); if (n != null) $('#form_id_name').val(n); }, [civil, name]);
  await page.locator('.ui-dialog:visible .ui-dialog-buttonpane button', { hasText: 'Sauvegarder' }).click(); await page.waitForTimeout(500);
};

test('11. Informations: "Nom Prénom" filled, default name "Index": the name becomes "DUPONT Marie"', 'fr', async (page) => {
  await template(page, 'nuclear');
  await infoSave(page, 0, 'DUPONT Marie');
  const d = (await data(page))[0];
  await page.evaluate(() => $('#loadFromHot').click()); await page.waitForTimeout(500);
  const drawn = await page.evaluate(() => $('#pedigree').text());
  expect(d.Name === 'DUPONT Marie' && d.civil_name === 'DUPONT Marie' && d.proband, JSON.stringify([d.Name, d.civil_name, d.proband]));
  expect((drawn.match(/DUPONT Marie/g) || []).length === 1, 'on the drawing: ' + (drawn.match(/DUPONT Marie/g) || []).length + ' times');
});

test('11b. same with a numbered default name ("Oncle pat2") and the Id. of a person drawn without a name', 'fr', async (page) => {
  await template(page, 'nuclear');
  await setRows(page, { 1: { Name: 'Oncle pat2' }, 2: { Name: String((await data(page))[2].IndivID) } });
  await infoSave(page, 1, 'Martin Paul');
  await infoSave(page, 2, 'Durand Anne');
  const d = await data(page);
  expect(d[1].Name === 'Martin Paul' && d[2].Name === 'Durand Anne', JSON.stringify([d[1].Name, d[2].Name]));
});

test('11c. a name typed by the user is kept; an empty "Nom Prénom" changes nothing', 'fr', async (page) => {
  await template(page, 'nuclear');
  await infoSave(page, 0, 'DUPONT Marie', 'Véro');
  await infoSave(page, 1, '');
  const d = await data(page);
  expect(d[0].Name === 'Véro' && d[0].civil_name === 'DUPONT Marie' && d[1].Name === 'Père', JSON.stringify([d[0].Name, d[0].civil_name, d[1].Name]));
});

// summary text of a deceased relative: "Sa grand-mère paternelle est décédée à 49 ans",
// not "était (décédée à 49 ans)"; a death without an age is written too
const courrier = require('./fixtures/courrier-oncogenetique.json');
const story = async (page, rows) => {
  await page.evaluate(r => hot.loadData(JSON.parse(JSON.stringify(r))), rows); await page.waitForTimeout(300);
  await page.evaluate(() => $('#loadStory').click()); await page.waitForTimeout(300);
  return page.evaluate(() => document.getElementById('story').innerHTML.replace(/<br>/g, '\n'));
};

test('12. text: deceased relatives ("est décédée à 49 ans", "Son père est décédé.", "un frère (décédé)"), "d\'une tumeur"', 'fr', async (page) => {
  const s = await story(page, courrier);
  for (const want of ['Sa grand-mère paternelle est décédée à 49 ans. Elle était suivie pour un cancer de l\'estomac.',
                      'Son père est décédé. Il était suivi pour un lymphome.',
                      'un frère (décédé) suivi pour un cancer de l\'estomac',
                      'Sa mère est suivie pour un cancer du côlon et d\'une tumeur cérébrale.'])
    expect(s.includes(want), 'missing: ' + want + '\n' + s);
  expect(!/était \(|\(\s*\)|undefined/.test(s), s);
});

test('12b. text: deceased relative with a year of birth or a "Nom Prénom"; living relatives unchanged', 'fr', async (page) => {
  const rows = JSON.parse(JSON.stringify(courrier));
  Object.assign(rows[4], { Deceased: '1', Yob: '1930', Age: '80' });
  Object.assign(rows[1], { civil_name: 'DUPONT Jean' });
  Object.assign(rows[2], { Yob: '1935', Age: '91' });
  const s = await story(page, rows);
  for (const want of ['Son grand-père paternel, né en 1930, est décédé à 80 ans. Il ne présentait pas de pathologie cancéreuse.',
                      'Son père, Monsieur DUPONT Jean, est décédé.',
                      'Sa mère est née en 1935 (91 ans). Elle est suivie pour un cancer du côlon'])
    expect(s.includes(want), 'missing: ' + want + '\n' + s);
});

test('12c. same in English: "Her paternal grandmother died at the age of 49.", "Her father died."', 'eng', async (page) => {
  const s = await story(page, courrier);
  for (const want of ['Her paternal grandmother died at the age of 49.', 'Her father died.', 'a brother (deceased)'])
    expect(s.includes(want), 'missing: ' + want + '\n' + s);
});

// the same disease twice with two ages (two melanomas at 56 and 62): both kept on the
// drawing ("mélanome: 56, 62"), in the text and back in the table
const labels = (page) => page.evaluate(() => $('#pedigree .indi_details').map((i, e) => e.textContent).get().filter(x => x));
const draw = async (page, rows) => {
  if (rows) await page.evaluate(r => hot.loadData(JSON.parse(JSON.stringify(r))), rows);
  await page.evaluate(() => $('#loadFromHot').click()); await page.waitForTimeout(600);
};

test('13. same disease twice: "mélanome: 56, 62" on the drawing, "deux mélanomes diagnostiqués en 2016 et 2022 à l\'âge de 56 et 62 ans"', 'fr', async (page) => {
  await draw(page, courrier);
  const l = await labels(page);
  expect(l.includes('mélanome: 56, 62'), 'labels: ' + l.join(' | '));
  const s = await story(page, courrier);
  expect(s.includes("dans le cadre de deux mélanomes diagnostiqués en 2016 et 2022 à l'âge de 56 et 62 ans et d'un carcinome basocellulaire de l'épaule."), s.split('\n')[0]);
});

test('13b. same disease twice: edited on the drawing then loaded back, two lines in the table; removed from the table, gone from the drawing', 'fr', async (page) => {
  await draw(page, courrier);
  // person editor of the index case: the ages are a text field, saved as they are
  await page.evaluate(() => d3.selectAll('#pedigree .settings').filter(d => d.data.proband).dispatch('click'));
  await page.locator('#node_properties').waitFor({ state: 'visible' });
  const field = await page.evaluate(() => { const f = document.getElementById('id_mélanome_diagnosis_age_0'); return [f.type, f.value]; });
  expect(field[0] === 'text' && field[1] === '56, 62', 'editor field: ' + field);
  await page.evaluate(() => { $('#id_age').val('65').change(); $('#node_properties').dialog('close'); }); await page.waitForTimeout(400);
  await page.evaluate(() => $('#loadFromPedigree').click()); await page.waitForTimeout(400);
  let d = (await data(page))[0];
  expect(d.Disease1 === 'mélanome' && String(d.Age1) === '56' && d.Disease2 === 'mélanome' && String(d.Age2) === '62' && /basocellulaire/.test(d.Disease3),
    JSON.stringify([d.Disease1, d.Age1, d.Disease2, d.Age2, d.Disease3]));
  expect(!Object.keys(d).some(k => /_diagnosis_age$/.test(k)), 'diagnosis keys kept in the table: ' + Object.keys(d).join(','));
  await page.evaluate(() => { hot.setDataAtRowProp(0, 'Disease2', '', 'test'); hot.setDataAtRowProp(0, 'Age2', '', 'test'); });
  await draw(page);
  const l = await labels(page);
  expect(l.includes('mélanome: 56') && !l.some(x => /62/.test(x)), 'labels: ' + l.join(' | '));
});

test('13e. a file saved by an earlier version (hidden copies of the diseases): each disease drawn once, a removed one not drawn; a fourth disease kept', 'fr', async (page) => {
  await template(page, 'nuclear');
  await setRows(page, { 0: { ...index, Disease1: 'cancer_colon', Age1: '50', cancer_colon_diagnosis_age: '50', cancer_sein_diagnosis_age: '40' },
                        1: { Disease1: 'cancer_colon', Disease2: 'mélanome', Disease3: 'cancer_rein', Age3: '70', cancer_prostate_diagnosis_age: '65' } });
  await draw(page);
  const l = await labels(page);
  expect(l.filter(x => /colon/.test(x)).sort().join('|') === 'ca. colon: |ca. colon: 50' && !l.some(x => /sein/.test(x)) && l.includes('ca. prostate: 65'), 'labels: ' + l.join(' | '));
  await page.evaluate(() => $('#loadFromPedigree').click()); await page.waitForTimeout(400);
  const p = (await data(page))[1];
  expect(p.cancer_prostate_diagnosis_age === '65' && p.Disease3 === 'cancer_rein', 'father: ' + JSON.stringify(p));
});

test('13c. same cancer twice, one age unknown: "56, ?"; CanRisk gets the first age', 'fr', async (page) => {
  await template(page, 'nuclear');
  await setRows(page, { 0: { ...index, Disease1: 'cancer_ovaire', Age1: '44', Disease2: 'cancer_ovaire', Age2: '' } });
  await draw(page);
  const l = await labels(page);
  expect(l.some(x => /ovaire: 44, \?/.test(x)), 'labels: ' + l.join(' | '));
  const s = await story(page, await data(page));
  expect(s.includes("dans le cadre de deux cancers de l'ovaire diagnostiqués à l'âge de 44 ans et à un âge inconnu."), s.split('\n')[0]);
  const dl = page.waitForEvent('download');
  await page.evaluate(() => $('#save_canrisk_fromHot').click());
  const text = require('fs').readFileSync(await (await dl).path(), 'utf8');
  const line = text.split('\n').find(x => x.split('\t')[2] === '1') || '';
  expect(line.includes('\t44\t') && !/44, /.test(text), 'CanRisk index line: ' + line);
});

test('13d. same in English: "2 mélanomes diagnosed at the age of 56 and 62"', 'eng', async (page) => {
  const s = await story(page, courrier);
  expect(s.includes('2 mélanomes diagnosed at the age of 56 and 62 year old'), s.split('\n')[0]);
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
