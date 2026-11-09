// Drives the NEW patient page (PersonTable cards) like a patient: click a field, type, move on.
const { openPanel, pickCancer, fillIndexFields, addRelatives } = require('./drive_common');
const BOX = { cancer: '#hotCancer', parents: '#hotParents', gpp: '#hotGpp', gpm: '#hotGpm', children: '#hotChildren', siblings: '#hotSiblings', fatherSiblings: '#hotFatherSiblings', motherSiblings: '#hotMotherSiblings' };

async function editField(page, table, row, prop, value) {
  const field = page.locator(`${BOX[table]} [data-row="${row}"] [id$="-r${row}-${prop}"]`);
  await field.scrollIntoViewIfNeeded();
  if (prop === 'Disease1' || prop === 'Cancer') { await field.click(); await pickCancer(page, value); return; }
  if (prop === 'Deceased') { await field.click(); await page.waitForTimeout(150); return; }
  await field.click(); await field.fill(value); await page.keyboard.press('Tab'); await page.waitForTimeout(150);
}

async function run(page, sc) {
  await fillIndexFields(page, sc);
  if (sc.index.cancers.length) {
    await openPanel(page, 'cancer');
    await page.check('#cancer_Yes'); await page.waitForTimeout(300);
    for (let i = 0; i < sc.index.cancers.length; i++) {
      const c = sc.index.cancers[i];
      await editField(page, 'cancer', i, 'Cancer', c.cancer);
      if (c.age) await editField(page, 'cancer', i, 'Age', c.age);
      if (c.year) await editField(page, 'cancer', i, 'Year', c.year);
    }
  }
  for (const g of ['children', 'siblings', 'fatherSiblings', 'motherSiblings']) await addRelatives(page, g, sc[g]);
  for (const [table, row, prop, value] of sc.edits) { await openPanel(page, table); await editField(page, table, row, prop, value); }
}
module.exports = { run, editCell: editField };
