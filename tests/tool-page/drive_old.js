// Actions that need Handsontable's own widgets (tool-handsontable.html): context menu and row dragging.
const g = require('./grid_driver');
async function removeRow(page, r) {
  const b = await g.cellBox(page, r, 0);
  await page.mouse.click(b.x, b.y, { button: 'right' }); await page.waitForTimeout(300);
  await page.locator('.htContextMenu td', { hasText: 'Remove row' }).first().click(); await page.waitForTimeout(400);
}
// what Handsontable does when a dragged row header is dropped at position dropIndex
async function moveRow(page, from, dropIndex) {
  await page.evaluate(([f, d]) => hot.getPlugin('manualRowMove').dragRows([f], d), [from, dropIndex]); await page.waitForTimeout(400);
}
module.exports = { removeRow, moveRow };
