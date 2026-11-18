// The pedigree of the patient page: drawn as the patient answers, beside the questionnaire.
// usage: node live.js <page url>
const { runTests } = require('./harness');
const { editField, addRelatives } = require('./drive_common');
const url = process.argv[2];

const tests = [];
const test = (name, fn, viewport) => tests.push({ name, lang: 'fr', fn, viewport });
function expect(cond, msg) { if (!cond) throw new Error(msg); }
const names = (page) => page.evaluate(() => [...document.querySelectorAll('#pedigree .ped_label')].map(t => t.textContent));
const nodeCount = (page) => page.evaluate(() => document.querySelectorAll('#pedigree .node').length);
const settle = (page) => page.waitForTimeout(700);   // the drawing follows 0.3 s after the last change
const WIDE = { width: 1440, height: 900 }, PHONE = { width: 390, height: 844 };

test('drawn at load, without any button', async (page) => {
  await settle(page);
  expect(await nodeCount(page) === 7 && await page.locator('#createPed').count() === 0, 'people drawn: ' + await nodeCount(page));
}, WIDE);

test('follows the answers: relatives, names, cancers', async (page) => {
  await addRelatives(page, 'children', [{ sex: 'F', yob: '2008' }, {}]);
  await settle(page);
  let n = await names(page);
  expect(await nodeCount(page) === 10 && n.includes('Fille 1') && n.includes('Enfant 1'), 'after the children: ' + JSON.stringify(n));
  await editField(page, 'children', 1, 'Name', 'Paul');
  await editField(page, 'children', 0, 'K1', '1');
  await editField(page, 'children', 0, 'Disease1', 'cancer_sein');
  await editField(page, 'children', 0, 'Dx1', '16');
  await settle(page);
  n = await names(page);
  expect(n.includes('Paul') && n.some(t => /sein: 16/.test(t)), 'after the edits: ' + JSON.stringify(n));
  await page.check('#children_No'); await settle(page);
  expect(await nodeCount(page) === 7, 'children still drawn after "Non": ' + await nodeCount(page));
}, WIDE);

test('no alert while typing, even when a value is wrong', async (page, answers, errors) => {
  await addRelatives(page, 'siblings', [{ yob: '3000', age: 'abc' }]);
  await settle(page);
  expect(!errors.some(e => e.startsWith('alert')), 'alerts: ' + JSON.stringify(errors));
}, WIDE);

test('the drawing is a preview: it cannot be edited', async (page) => {
  await settle(page);
  const r = await page.evaluate(() => ({ edit: opts.edit, widgets: document.querySelectorAll('#pedigree .addsibling, #pedigree .addchild, #pedigree .delete').length,
    undo: $('#pedigree_history .fa-undo').is(':visible') }));
  expect(r.edit === false && r.widgets === 0 && !r.undo, JSON.stringify(r));
}, WIDE);

test('a whole family fits in the drawing', async (page) => {
  await addRelatives(page, 'children', [{ sex: 'F' }, { sex: 'M' }]);
  await addRelatives(page, 'siblings', [{ sex: 'F' }, { sex: 'M' }, { sex: 'M' }]);
  await addRelatives(page, 'fatherSiblings', [{ sex: 'M' }, { sex: 'F' }, { sex: 'F' }]);
  await addRelatives(page, 'motherSiblings', [{ sex: 'M' }, { sex: 'F' }]);
  await settle(page);
  const out = await page.evaluate(() => {
    const box = document.querySelector('#pedigree svg').getBoundingClientRect();
    return [...document.querySelectorAll('#pedigree .node path, #pedigree .node rect, #pedigree .node circle')].map(e => e.getBoundingClientRect())
      .filter(r => r.width && (r.left < box.left || r.right > box.right || r.top < box.top || r.bottom > box.bottom)).length;
  });
  expect(await nodeCount(page) === 18 && out === 0, `${await nodeCount(page)} people, ${out} outside the drawing`);
}, WIDE);

test('wide screen: the drawing is on the right and stays in view while scrolling', async (page) => {
  const pos = await page.evaluate(() => ({ q: document.getElementById('questionnaire_col').getBoundingClientRect(), p: document.getElementById('live_pedigree').getBoundingClientRect() }));
  expect(pos.p.left >= pos.q.right - 1 && Math.abs(pos.p.top - pos.q.top) < 40, 'not beside the questionnaire: ' + JSON.stringify(pos));
  await addRelatives(page, 'siblings', [{}, {}, {}, {}]);
  await page.evaluate(() => window.scrollTo(0, 1500)); await page.waitForTimeout(300);
  const svg = await page.evaluate(() => document.querySelector('#pedigree svg').getBoundingClientRect());
  expect(svg.top >= 0 && svg.top < 300, 'drawing scrolled away: ' + JSON.stringify(svg));
  expect(!await page.isVisible('#show_pedigree'), '"Voir l\'arbre" shown on a wide screen');
}, WIDE);

test('phone: the drawing is below; "Voir l\'arbre" brings it into view, then hides', async (page) => {
  const pos = await page.evaluate(() => ({ q: document.getElementById('questionnaire_col').getBoundingClientRect().bottom, p: document.getElementById('live_pedigree').getBoundingClientRect().top }));
  expect(pos.p >= pos.q - 1, 'drawing not below: ' + JSON.stringify(pos));
  expect(await page.isVisible('#show_pedigree'), 'no "Voir l\'arbre" button');
  await page.click('#show_pedigree'); await page.waitForTimeout(1200);
  const top = await page.evaluate(() => document.getElementById('live_pedigree').getBoundingClientRect().top);
  expect(top >= 0 && top < 120 && !await page.isVisible('#show_pedigree'), 'after the click: top ' + top + ', button ' + await page.isVisible('#show_pedigree'));
}, PHONE);

test('the two files are downloaded at once, named after the patient', async (page) => {
  await page.fill('#civil_name', 'Lefèvre Hélène');
  await addRelatives(page, 'children', [{ sex: 'M', yob: '2005' }]);
  await settle(page);
  const files = [];
  page.on('download', d => files.push(d));
  await page.click('#exportPedigreejsCanRisk'); await page.waitForTimeout(800);
  const names = files.map(d => d.suggestedFilename());
  const canrisk = files.find(d => d.suggestedFilename().startsWith('canrisk'));
  const famids = canrisk ? require('fs').readFileSync(await canrisk.path(), 'utf8').split('\n').filter(l => l && !l.startsWith('#')).map(l => l.split('\t')[0]) : [];
  expect(files.length === 2 && names.includes('canrisk_Lefevre_Helene.txt') && names.some(n => /^GeneTree_data_Lefevre_Helene_.*\.json$/.test(n)),
    'downloads: ' + JSON.stringify(names));
  expect(famids.length && famids.every(f => f === 'Lefevre_Helen'), 'FamID: ' + JSON.stringify([...new Set(famids)]));
  expect(!await page.isVisible('.ui-dialog'), 'a dialog is open');
}, WIDE);

test('file names: accents and other letters', async (page) => {
  const ids = await page.evaluate(() => ['Lefèvre Hélène', "Bœuf  D'Arc", 'Groß/Ève', '  '].map(n => familyIdentifier([{ proband: true, civil_name: n }])));
  expect(JSON.stringify(ids) === JSON.stringify(['Lefevre_Helene', 'Boeuf_D_Arc', 'Gross_Eve', '']), JSON.stringify(ids));
}, WIDE);

runTests(tests, url);
