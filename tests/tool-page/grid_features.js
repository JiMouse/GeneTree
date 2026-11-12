// Tests of the table's spreadsheet features on the tool page.
// usage: node grid_features.js http://localhost:8000/GeneTree/
const { chromium, openTool } = require('./harness');
const g = require('./grid_driver');
const drv = require('./drive_new');
const url = process.argv[2];
const tests = [];
const test = (name, fn) => tests.push({ name, fn });
const expect = (cond, msg) => { if (!cond) throw new Error(msg); };
const data = (page) => page.evaluate(() => hot.getSourceData());
const active = (page) => page.evaluate(() => hot.getSelectedLast());

test('typing, Enter, Tab, arrows, Escape', async (page) => {
  await g.click(page, 0, 0); await page.keyboard.type('Anne'); await page.keyboard.press('Enter');
  expect((await data(page))[0].Name === 'Anne', 'typing + Enter did not save');
  expect(JSON.stringify(await active(page)) === '[1,0,1,0]', 'Enter did not move down: ' + JSON.stringify(await active(page)));
  await page.keyboard.press('Tab'); await page.keyboard.press('ArrowDown'); await page.keyboard.press('ArrowLeft');
  expect(JSON.stringify(await active(page)) === '[2,0,2,0]', 'Tab/arrows: ' + JSON.stringify(await active(page)));
  await page.keyboard.type('xyz'); await page.keyboard.press('Escape');
  expect((await data(page))[2].Name === 'Mère', 'Escape did not cancel the edit');
  await page.keyboard.press('F2'); await page.keyboard.press('End'); await page.keyboard.type(' B'); await page.keyboard.press('Enter');
  expect((await data(page))[2].Name === 'Mère B', 'F2 edit: ' + (await data(page))[2].Name);
});

test('one Ctrl+Z undoes an age and the year of birth it filled in; Ctrl+Y redoes both', async (page) => {
  await g.type(page, 1, 6, '60');
  let p = (await data(page))[1]; expect(p.Age === 60 && p.Yob === 1966, 'sync: ' + JSON.stringify([p.Age, p.Yob]));
  await page.keyboard.press('Control+Z');
  p = (await data(page))[1]; expect(p.Age === '' && p.Yob === '', 'after undo: ' + JSON.stringify([p.Age, p.Yob]));
  await page.keyboard.press('Control+Y');
  p = (await data(page))[1]; expect(p.Age === 60 && p.Yob === 1966, 'after redo: ' + JSON.stringify([p.Age, p.Yob]));
});

test('copy a block to Excel (Ctrl+C), with a multi-line cell', async (page) => {
  await page.evaluate(() => hot.setDataAtRowProp(1, 'comment', 'ligne 1\nligne 2'));
  await g.click(page, 0, 0); await g.click(page, 1, 4, { modifiers: ['Shift'] }); await page.keyboard.press('Control+C');
  const clip = await page.evaluate(() => navigator.clipboard.readText());
  expect(clip === 'Index\t1\t2\t3\tF\nPère\t2\t0\t0\tM', 'clipboard: ' + JSON.stringify(clip));
  await g.click(page, 1, 15); await page.keyboard.press('Control+C');
  expect(await page.evaluate(() => navigator.clipboard.readText()) === '"ligne 1\nligne 2"', 'multi-line cell not quoted');
});

test('paste from Excel (CRLF, trailing new line, quoted cell)', async (page) => {
  await g.paste(page, 1, 0, 'Jean\t20\r\n"Marie\r\nClaire"\t21\r\n');
  const d = await data(page);
  expect(d[1].Name === 'Jean' && d[1].IndivID === '20' && d[2].Name === 'Marie\nClaire' && d[2].IndivID === '21' && d.length === 3, JSON.stringify(d.map(r => [r.Name, r.IndivID])));
});

test('delete a row with its button, then undo', async (page) => {
  await page.evaluate(() => $('#extended1').click()); await page.waitForTimeout(400);
  await g.click(page, 0, 0); await g.closeCancerList(page);
  await page.evaluate(() => { $('#brother').val(1); $('#submitAddBranch').click(); }); await page.waitForTimeout(500);
  const before = (await data(page)).map(r => r.IndivID).join(',');   // row 1 is the new brother (no children)
  await drv.removeRow(page, 1);
  expect((await data(page)).length === 7, 'row not removed');
  await g.click(page, 0, 0); await g.closeCancerList(page); await page.keyboard.press('Control+Z');
  expect((await data(page)).map(r => r.IndivID).join(',') === before, 'undo did not restore the row: ' + (await data(page)).map(r => r.IndivID).join(','));
});

test('drag a row; the index (first row) cannot be displaced', async (page, alerts) => {
  await page.evaluate(() => $('#extended1').click()); await page.waitForTimeout(400);
  await drv.moveRow(page, 2, 5);
  expect(JSON.stringify((await data(page)).map(r => r.IndivID)) === '["1","2","4","5","3","6","7"]', 'order: ' + JSON.stringify((await data(page)).map(r => r.IndivID)));
  await drv.moveRow(page, 3, 0);
  expect(JSON.stringify((await data(page)).map(r => r.IndivID)) === '["1","2","4","5","3","6","7"]' && alerts.length === 1, 'moving above the index was not refused');
});

test('tick box with the mouse and with Space', async (page) => {
  await g.check(page, 1, 5); expect((await data(page))[1].Deceased === '1', 'click');
  const b = await g.cellBox(page, 2, 5);                // click the cell beside the box, then Space
  await page.mouse.click(b.x - 15, b.y); await page.waitForTimeout(150);
  await page.keyboard.press('Space'); expect((await data(page))[2].Deceased === '1', 'Space');
  await page.keyboard.press('Space'); expect((await data(page))[2].Deceased === '0', 'Space again');
});

test('a single click opens the Sexe / Option list; click, arrows + Enter, or typing choose a value', async (page) => {
  const listShown = () => page.evaluate(() => { const l = document.querySelector('.dg-dropdown'); return l && l.style.display !== 'none' ? [...l.children].map(o => o.textContent) : null; });
  await g.click(page, 1, 8); await page.waitForTimeout(150);
  expect(JSON.stringify(await listShown()) === JSON.stringify(['FCS', 'IMG', 'Grossesse', 'JumMZ', 'JumDZ', 'Adopté']), 'Option list: ' + JSON.stringify(await listShown()));
  await page.locator('.dg-dropdown .dg-option', { hasText: 'Adopté' }).click(); await page.waitForTimeout(150);
  expect((await data(page))[1].Option === 'Adopté' && !(await listShown()), 'click on a value: ' + (await data(page))[1].Option);
  await g.click(page, 2, 4);                                     // Sexe of the mother: F
  expect(JSON.stringify(await listShown()) === '["M","F","U"]', 'Sexe list: ' + JSON.stringify(await listShown()));
  await page.keyboard.press('ArrowDown'); await page.keyboard.press('Enter');
  expect((await data(page))[2].Sex === 'U', 'ArrowDown + Enter: ' + (await data(page))[2].Sex);
  await g.click(page, 2, 4); await page.keyboard.type('f'); await page.keyboard.press('Enter');
  expect((await data(page))[2].Sex === 'F', 'typing: ' + (await data(page))[2].Sex);
  await g.click(page, 1, 4); await page.keyboard.press('Escape');
  expect((await data(page))[1].Sex === 'M' && !(await listShown()), 'Escape');
});

test('"Grossesse" on someone who has children: clear message, previous drawing kept', async (page, alerts) => {
  await page.evaluate(() => $('#loadFromHot').click()); await page.waitForTimeout(500);
  const before = await page.evaluate(() => document.querySelectorAll('#pedigree svg .node').length);
  await page.evaluate(() => { hot.setDataAtRowProp(1, 'Option', 'Grossesse'); $('#loadFromHot').click(); }); await page.waitForTimeout(500);
  const after = await page.evaluate(() => document.querySelectorAll('#pedigree svg .node').length);
  expect(alerts.length === 1 && /Père est marqué\(e\) « Grossesse »/.test(alerts[0]), 'alert: ' + JSON.stringify(alerts));
  expect(before > 0 && after === before, `drawing: ${before} people before, ${after} after`);
});

test('year of diagnosis without year of birth: cell turns red', async (page) => {
  await g.type(page, 2, 10, '2000');
  const cls = await page.evaluate(() => hot.getCell(2, 10).className);
  expect(/\bred\b/.test(cls), 'class: ' + cls);
});

(async () => {
  const b = await chromium.launch(); let failed = 0;
  for (const t of tests) {
    const { ctx, page, errors, alerts } = await openTool(b, url, 'fr');
    const ext = []; page.on('request', r => { if (!/^(http:\/\/localhost|data:|blob:)/.test(r.url())) ext.push(r.url()); });
    try {
      await t.fn(page, alerts);
      expect(!errors.length, 'page errors: ' + errors.join(' | '));
      expect(!ext.length, 'external requests: ' + ext.join(' '));
      expect(await page.evaluate(() => typeof Handsontable) === 'undefined', 'Handsontable is loaded');
      console.log('PASS ' + t.name);
    } catch (e) { failed++; console.log('FAIL ' + t.name + '\n     ' + e.message.split('\n')[0]); }
    await ctx.close();
  }
  console.log(`${tests.length - failed}/${tests.length} passed`); await b.close(); process.exit(failed ? 1 : 0);
})();
