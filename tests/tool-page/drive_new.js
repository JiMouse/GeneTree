// Actions on the table's own widgets: the row delete button and the drag handle.
async function removeRow(page, r) {
  const head = page.locator('#dataTable tbody tr').nth(r).locator('th.dg-rowhead');
  await head.hover(); await head.locator('.dg-del').click(); await page.waitForTimeout(400);
}
// drag row `from` by its handle and drop it before row `dropIndex` (0..number of rows)
async function moveRow(page, from, dropIndex) {
  const box = await page.evaluate(([f, d]) => {
    const rows = document.querySelectorAll('#dataTable tbody tr'), h = rows[f].querySelector('.dg-handle').getBoundingClientRect();
    rows[Math.min(d, rows.length - 1)].scrollIntoView({ block: 'nearest' });
    const t = rows[Math.min(d, rows.length - 1)].getBoundingClientRect();
    return { x: h.x + h.width / 2, y: h.y + h.height / 2, ty: d < rows.length ? t.top + 4 : t.bottom - 4 };
  }, [from, dropIndex]);
  await page.mouse.move(box.x, box.y); await page.mouse.down();
  await page.mouse.move(box.x, (box.y + box.ty) / 2, { steps: 4 }); await page.mouse.move(box.x, box.ty, { steps: 4 });
  await page.mouse.up(); await page.waitForTimeout(400);
}
module.exports = { removeRow, moveRow };
