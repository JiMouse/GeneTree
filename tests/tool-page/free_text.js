// Free-text family description (js/text-family.js) and the fields it fills in.
// usage: node free_text.js <tool url>
const path = require('path');
const { chromium, openTool } = require('./harness');
const g = require('./grid_driver');
const { parseFamilyText } = require(path.join(__dirname, '../../js/text-family.js'));
const [url] = process.argv.slice(2);
const tests = [];
const test = (name, lang, fn) => tests.push({ name, lang, fn });
const expect = (cond, msg) => { if (!cond) throw new Error(msg); };
const same = (a, b) => JSON.stringify(Object.entries(a).sort()) === JSON.stringify(Object.entries(b).sort());

// 1. The analyser alone (no browser).
const cases = [
  ['il a 3 frères et soeurs', { sibling: 3 }, []],
  ['Elle a deux frères et une sœur. Elle a 3 enfants dont 2 filles.', { brother: 2, sister: 1, child: 1, daughter: 2 }, []],
  ['Son père a 2 frères et une sœur, sa mère a trois sœurs.', { uncleP: 2, auntP: 1, auntM: 3 }, []],
  ['un oncle paternel et 2 tantes maternelles', { uncleP: 1, auntM: 2 }, []],
  ['côté paternel : 2 oncles et 1 tante. Côté maternel, une tante.', { uncleP: 2, auntP: 1, auntM: 1 }, []],
  ['il a un grand frère et une petite soeur', { brother: 1, sister: 1 }, []],
  ['4 frères et sœurs, dont une sœur', { sibling: 3, sister: 1 }, []],
  ['Il a 45 ans, 2 enfants. Sa mère est décédée à 60 ans.', { child: 2 }, []],
  ['son père est décédé, il a 2 frères', { brother: 2 }, []],
  ['fils unique, pas d\'enfant', {}, []],
  ['un demi-frère paternel, 3 petits-enfants, une belle-sœur', {}, ['un demi-frère', '3 petits-enfants', 'une belle-sœur']],
  ['2 oncles', {}, ['2 oncles']],
  ['son père a 2 oncles', {}, ['2 oncles']],
  ['She has two brothers and a sister. Her father has 3 sisters.', { brother: 2, sister: 1, auntP: 3 }, []],
  ['He has 3 siblings and 2 children, including one daughter.', { sibling: 3, child: 1, daughter: 1 }, []],
];
let unitFailed = 0;
for (const [text, counts, unhandled] of cases) {
  const r = parseFamilyText(text);
  const ok = same(r.counts, counts) && JSON.stringify(r.unhandled) === JSON.stringify(unhandled);
  if (!ok) unitFailed++;
  console.log((ok ? 'PASS' : 'FAIL') + ' parse: ' + text + (ok ? '' : '\n     got ' + JSON.stringify(r)));
}

// 2. In the tool.
const openMenu = (page) => page.evaluate(() => $('#dropdownFam .dropdown-toggle').click());
const fields = (page) => page.evaluate(() => {
  const o = {};
  ['brother', 'sister', 'sibling', 'son', 'daughter', 'child', 'uncleP', 'auntP', 'uncleM', 'auntM'].forEach(k => { if ($('#' + k).val()) o[k] = +$('#' + k).val(); });
  return o;
});

test('free text fills the fields, menu stays open, nothing is added yet', 'fr', async (page) => {
  await page.evaluate(() => $('#nuclear').click()); await page.waitForTimeout(400);
  const rows = (await page.evaluate(() => hot.getSourceData())).length;
  await openMenu(page);
  await page.fill('#freeText', 'Il a 3 frères et sœurs et 2 enfants dont une fille. Son père a 2 sœurs. Un demi-frère.');
  await page.click('#freeTextAnalyse');
  const f = await fields(page);
  expect(same(f, { sibling: 3, child: 1, daughter: 1, auntP: 2 }), 'fields ' + JSON.stringify(f));
  expect(await page.isVisible('#freeText'), 'menu closed');
  const msg = await page.textContent('#freeTextResult');
  expect(/vérifiez/.test(msg) && /demi-frère/.test(msg), 'message: ' + msg);
  expect((await page.evaluate(() => hot.getSourceData())).length === rows, 'rows added before validation');
});

test('Ajouter à l\'individu: siblings and children of unknown sex added', 'fr', async (page) => {
  await page.evaluate(() => $('#nuclear').click()); await page.waitForTimeout(400);
  await g.click(page, 0, 0); await g.closeCancerList(page);
  await page.evaluate(() => { $('#freeText').val('il a 3 frères et soeurs et un enfant'); $('#freeTextAnalyse').click(); $('#submitAddBranch').click(); });
  await page.waitForTimeout(600);
  const d = await page.evaluate(() => hot.getSourceData());
  const index = d.find(r => r.IndivID == '1');
  const sibs = d.filter(r => r.IndivID != '1' && r.Sex === 'U' && r.FathID == index.FathID && r.MothID == index.MothID);
  const kids = d.filter(r => r.Sex === 'U' && (r.FathID == '1' || r.MothID == '1'));
  expect(sibs.length === 3, 'siblings: ' + JSON.stringify(sibs.map(r => r.Name)));
  expect(sibs.every(r => /^Frère\/sœur/.test(r.Name)), 'sibling names: ' + sibs.map(r => r.Name).join(','));
  expect(kids.length === 1 && /^Enfant/.test(kids[0].Name), 'child: ' + JSON.stringify(kids));
  const svg = await page.evaluate(() => document.querySelectorAll('#pedigrees svg .node').length);
  expect(svg > 0, 'pedigree not drawn');
});

test('nothing recognised: a hint, fields untouched', 'fr', async (page) => {
  await openMenu(page);
  await page.fill('#brother', '2');
  await page.fill('#freeText', 'Antécédents de cancer du sein chez la mère.');
  await page.click('#freeTextAnalyse');
  expect(await page.inputValue('#brother') === '2', 'brother field changed');
  expect(/Aucun apparenté/.test(await page.textContent('#freeTextResult')), 'no hint');
});

test('English labels and analysis', 'eng', async (page) => {
  await openMenu(page);
  expect(await page.textContent('#freeTextAnalyse') === 'Fill in the fields', 'button: ' + await page.textContent('#freeTextAnalyse'));
  await page.fill('#freeText', 'She has two brothers. Her mother has a sister.');
  await page.press('#freeText', 'Control+Enter');
  const f = await fields(page);
  expect(same(f, { brother: 2, auntM: 1 }), 'fields ' + JSON.stringify(f));
});

(async () => {
  const b = await chromium.launch(); let failed = unitFailed;
  for (const t of tests) {
    const { ctx, page, errors, alerts } = await openTool(b, url, t.lang);
    try {
      await t.fn(page, alerts);
      expect(!errors.length, 'page errors: ' + errors.join(' | '));
      console.log('PASS ' + t.name);
    } catch (e) { failed++; console.log('FAIL ' + t.name + '\n     ' + e.message.split('\n')[0]); }
    await ctx.close();
  }
  const total = cases.length + tests.length;
  console.log(`${total - failed}/${total} passed`); await b.close(); process.exit(failed ? 1 : 0);
})();
