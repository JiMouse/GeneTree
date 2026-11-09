// usage: node run_suite.js <page url> <driver module> <output dir> [only-id]
const fs = require('fs'), path = require('path');
const { chromium, openPage, buildAndExport } = require('./harness');
const scenarios = require('./scenarios'), families = require('./random_families')();
const [url, driverPath, outDir, only] = process.argv.slice(2);
const driver = require(path.resolve(driverPath));
fs.mkdirSync(outDir, { recursive: true });
(async () => {
  const b = await chromium.launch();
  const all = [...scenarios.map(s => ({ ...s, kind: 'ui' })), ...families.map(f => ({ ...f, kind: 'data' }))].filter(s => !only || s.id === only);
  for (const sc of all) {
    const { ctx, page, errors } = await openPage(b, url, sc.lang);
    try {
      if (sc.kind === 'ui') await driver.run(page, sc);
      else {
        if (sc.index.dbirth) { await page.click('#dbirth'); await page.keyboard.type(sc.index.dbirth.replace(/\//g, '')); }
        await page.evaluate(id => document.getElementById(id).click(), sc.index.sex === 'M' ? 'index_id_sex_0' : 'index_id_sex_1');
        await page.evaluate(t => { for (const [h, rows] of Object.entries(t)) window[h].loadData(JSON.parse(JSON.stringify(rows))); }, sc.tables);
      }
      const r = await buildAndExport(page);
      fs.writeFileSync(path.join(outDir, sc.id + '.json'), JSON.stringify({ createPed: r.createPed, files: r.files, errors }, null, 1));
      process.stdout.write(sc.id + (errors.length ? ' [page errors: ' + errors.join(' | ') + ']' : '') + '  ');
    } catch (e) { console.log('\n' + sc.id + ' FAILED: ' + e.message.split('\n')[0]); await page.screenshot({ path: path.join(outDir, sc.id + '_fail.png') }); }
    await ctx.close();
  }
  console.log('\ndone'); await b.close();
})();
