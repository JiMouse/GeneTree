// usage: node run_suite.js <tool url> <drive_old.js|drive_new.js> <output dir> [only-id]
const fs = require('fs'), path = require('path');
const { chromium, openTool, exportAll } = require('./harness');
const g = require('./grid_driver');
const scenarios = require('./scenarios'), families = require('./random_families')();
const [url, driverPath, outDir, only] = process.argv.slice(2);
const drv = require(path.resolve(driverPath));
fs.mkdirSync(outDir, { recursive: true });

async function step(page, s) {
  const [a, ...x] = s;
  switch (a) {
    case 'template': await page.evaluate(id => $('#' + id).click(), x[0]); await page.waitForTimeout(500); break;
    case 'type': await g.type(page, ...x); if (x[1] >= 9 && x[1] % 2 === 1 && x[1] <= 13) await g.closeCancerList(page); break;
    case 'check': await g.check(page, ...x); break;
    case 'select': await g.click(page, ...x); await g.closeCancerList(page); break;
    case 'disease': await g.disease(page, ...x); break;
    case 'hpo': await g.hpo(page, ...x); break;
    case 'paste': await g.paste(page, ...x); break;
    case 'range_delete': await g.rangeDelete(page, ...x); break;
    case 'undo': await page.keyboard.press('Control+Z'); await page.waitForTimeout(250); break;
    case 'redo': await page.keyboard.press('Control+Y'); await page.waitForTimeout(250); break;
    case 'remove': await drv.removeRow(page, x[0]); break;
    case 'remove_last': await drv.removeRow(page, (await page.evaluate(() => hot.getSourceData().length)) - 1); break;
    case 'dialog': await g.dialogButton(page, x[0]); break;
    case 'move': await drv.moveRow(page, x[0], x[1]); break;
    case 'click': await page.evaluate(sel => $(sel).click(), x[0]); await page.waitForTimeout(400); break;
    case 'branch': case 'custom':
      await page.evaluate(([fam, btn]) => { for (const [k, v] of Object.entries(fam)) $('#' + k).val(v); $(btn).click(); }, [x[0], a === 'branch' ? '#submitAddBranch' : '#submitCustomFam']);
      await page.waitForTimeout(500); break;
    default: throw new Error('unknown step ' + a);
  }
}

(async () => {
  const b = await chromium.launch();
  const all = [...scenarios.map(s => ({ ...s, kind: 'ui' })), ...families.map(f => ({ ...f, kind: 'data' }))].filter(s => !only || s.id === only);
  for (const sc of all) {
    const { ctx, page, errors, alerts } = await openTool(b, url, sc.lang);
    try {
      if (sc.kind === 'ui') for (const s of sc.steps) { if (process.env.DEBUG) console.log('  step', JSON.stringify(s)); await step(page, s); }
      else await page.evaluate(rows => hot.loadData(rows), sc.rows);
      const out = await exportAll(page);
      fs.writeFileSync(path.join(outDir, sc.id + '.json'), JSON.stringify({ ...out, errors, alerts }, null, 1));
      process.stdout.write(sc.id + (errors.length ? ' [page errors: ' + errors.join(' | ') + ']' : '') + '  ');
    } catch (e) { console.log('\n' + sc.id + ' FAILED: ' + e.message.split('\n')[0]); await page.screenshot({ path: path.join(outDir, sc.id + '_fail.png') }); }
    await ctx.close();
  }
  console.log('\ndone'); await b.close();
})();
