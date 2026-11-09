// Drives the CURRENT patient page (Handsontable grids) like a patient: mouse clicks in cells, then typing.
const { openPanel, pickCancer, fillIndexFields, addRelatives } = require('./drive_common');
const HOT = { cancer: 'hotCancer', parents: 'hotParents', gpp: 'hotGpp', gpm: 'hotGpm', children: 'hotChildren', siblings: 'hotSiblings', fatherSiblings: 'hotFatherSiblings', motherSiblings: 'hotMotherSiblings' };
const COLS = ['Name', 'Sex', 'Deceased', 'Age', 'Yob', 'Disease1', 'Age1', 'Year1', 'comment'];
const CANCER_COLS = ['Cancer', 'Age', 'Year'];

async function editCell(page, table, row, prop, value) {
  const hot = HOT[table], cols = table === 'cancer' ? CANCER_COLS : COLS, col = cols.indexOf(prop);
  // click the cell with the mouse, as a patient does
  const box = await page.evaluate(([h, r, c]) => {
    const td = window[h].getCell(r, c); td.scrollIntoView({ block: 'center' });
    const target = td.querySelector('input.htCheckboxRendererInput') || td;
    const b = target.getBoundingClientRect(); return { x: b.x + b.width / 2, y: b.y + b.height / 2 };
  }, [hot, row, col]);
  await page.mouse.click(box.x, box.y);
  await page.waitForTimeout(200);
  if (prop === 'Disease1' || prop === 'Cancer') { await pickCancer(page, value); return; }
  if (prop === 'Deceased') { await page.waitForTimeout(150); return; }
  if (value === '') { await page.keyboard.press('Delete'); await page.waitForTimeout(250); return; }
  await page.keyboard.type(value); await page.keyboard.press('Enter'); await page.waitForTimeout(350);
}

async function run(page, sc) {
  await fillIndexFields(page, sc);
  if (sc.index.cancers.length) {
    await openPanel(page, 'cancer');
    await page.check('#cancer_Yes'); await page.waitForTimeout(400);
    for (let i = 0; i < sc.index.cancers.length; i++) {
      const c = sc.index.cancers[i];
      await editCell(page, 'cancer', i, 'Cancer', c.cancer);
      if (c.age) await editCell(page, 'cancer', i, 'Age', c.age);
      if (c.year) await editCell(page, 'cancer', i, 'Year', c.year);
    }
  }
  for (const g of ['children', 'siblings', 'fatherSiblings', 'motherSiblings']) await addRelatives(page, g, sc[g]);
  for (const [table, row, prop, value] of sc.edits) { await openPanel(page, table); await editCell(page, table, row, prop, value); }
}
module.exports = { run, editCell };
