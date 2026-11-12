// Mouse/keyboard actions on the tool's table that are the same on both pages
// (Handsontable on tool-handsontable.html, DataGrid on index.html): both expose hot.getCell(row, col).
async function cellBox(page, r, c, selector) {
  return page.evaluate(([r, c, sel]) => {
    if (!hot.getCell(r, c)) hot.scrollViewportTo({ row: r, col: c }); // Handsontable draws only the visible rows
    const td = hot.getCell(r, c);
    td.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    const el = (sel && td.querySelector(sel)) || td;
    const b = el.getBoundingClientRect();
    return { x: b.x + b.width / 2, y: b.y + b.height / 2 };
  }, [r, c, selector || null]);
}
async function click(page, r, c, opts = {}) {
  const b = await cellBox(page, r, c);
  const mods = opts.modifiers || []; // mouse.click ignores modifiers: hold the keys instead
  for (const m of mods) await page.keyboard.down(m);
  await page.mouse.click(b.x, b.y, { button: opts.button || 'left' });
  for (const m of mods) await page.keyboard.up(m);
  await page.waitForTimeout(150);
}
async function type(page, r, c, text) {
  await click(page, r, c); await page.keyboard.type(text); await page.keyboard.press('Enter'); await page.waitForTimeout(250);
}
async function check(page, r, c) {
  const b = await cellBox(page, r, c, 'input[type=checkbox]'); await page.mouse.click(b.x, b.y); await page.waitForTimeout(250);
}
async function disease(page, r, c, key) {
  await click(page, r, c);
  await page.locator('#cancerList').waitFor({ state: 'visible' });
  const v = await page.evaluate(([v]) => {
    const FR = ['cancer_sein', 'cancer_sein2', 'cancer_ovaire', 'cancer_prostate', 'cancer_pancréas', 'cancer_colon', 'cancer_estomac', 'cancer_poumon', 'cancer_utérus', 'cancer_rein', 'cancer_foie', 'mélanome', 'cancer_orl', 'polypes'];
    return FR.includes(v) ? onco_full()[FR.indexOf(v)] : v;
  }, [key]);
  await page.locator(`#cancerList input[value="${v}"]`).click(); await page.waitForTimeout(250);
}
async function hpo(page, r, c, n) {
  await click(page, r, c);
  await page.locator('#cancerList').waitFor({ state: 'visible' });
  await page.locator('#cancerList a[name=cancerListradio]').nth(n).click(); await page.waitForTimeout(250);
}
async function paste(page, r, c, text) {
  await page.evaluate(t => navigator.clipboard.writeText(t), text);
  await click(page, r, c); await page.keyboard.press('Control+V'); await page.waitForTimeout(400);
  await closeCancerList(page);
}
// selecting a disease cell opens the cancer list; close it when it was not the point of the step
async function closeCancerList(page) {
  await page.evaluate(() => { try { if ($('#cancerList').dialog('isOpen')) $('#cancerList').dialog('close'); } catch (e) {} });
  await page.waitForTimeout(100);
}
async function rangeDelete(page, r1, c1, r2, c2) {
  await click(page, r1, c1); await click(page, r2, c2, { modifiers: ['Shift'] });
  await closeCancerList(page); await page.keyboard.press('Delete'); await page.waitForTimeout(250);
}
async function dialogButton(page, n) {
  await page.waitForTimeout(300);
  await page.locator('.ui-dialog:visible .ui-dialog-buttonpane button').nth(n).click(); await page.waitForTimeout(300);
}
module.exports = { cellBox, closeCancerList, click, type, check, disease, hpo, paste, rangeDelete, dialogButton };
