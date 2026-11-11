// Test harness for the GeneTree tool page: fixed date and Math.random, every export captured.
const { chromium } = require('playwright');
const fs = require('fs');
const FIXED = new Date('2026-11-11T10:00:00').getTime();

async function openTool(browser, url, lang = 'fr') {
  const ctx = await browser.newContext({ acceptDownloads: true, viewport: { width: 1400, height: 1000 }, permissions: ['clipboard-read', 'clipboard-write'], locale: lang === 'fr' ? 'fr-FR' : 'en-US' });
  const page = await ctx.newPage();
  await page.addInitScript(([lang, fixed]) => {
    const RealDate = Date, offset = fixed - RealDate.now();
    class FakeDate extends RealDate { constructor(...a) { if (a.length) super(...a); else super(RealDate.now() + offset); } static now() { return RealDate.now() + offset; } }
    window.Date = FakeDate;
    let s = 42; Math.random = () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
    try { localStorage.setItem('language', lang); if (!sessionStorage.getItem('__keep')) sessionStorage.clear(); } catch (e) {}
  }, [lang, FIXED]);
  const errors = [], alerts = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('dialog', d => { if (d.type() !== 'beforeunload') alerts.push(d.message()); d.accept(); });
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);
  await page.evaluate(() => {
    const orig = window.FormatToPedigreeJS;
    window.__ped = [];
    window.FormatToPedigreeJS = function (obj, ...rest) { const r = orig.call(this, obj, ...rest); window.__ped.push(JSON.parse(JSON.stringify(r))); return r; };
  });
  return { ctx, page, errors, alerts };
}

// Builds the pedigree and the summary text from the table, then clicks every export.
async function exportAll(page) {
  const files = {}, dls = [], exportErrors = {};
  page.on('download', d => dls.push(d));
  const click = async (sel) => {
    try { await page.evaluate(s => $(s).first().click(), sel); }
    catch (e) { exportErrors[sel] = e.message.split('\n')[0].replace(/^page.evaluate: /, ''); }
    await page.waitForTimeout(350);
  };
  await page.evaluate(() => { window.__ped.length = 0; });
  await click('#loadFromHot');
  const pedigree = await page.evaluate(() => window.__ped[window.__ped.length - 1] || null);
  await click('#loadStory');
  const story = await page.evaluate(() => document.getElementById('story').innerHTML);
  for (const sel of ['.exportJson', '#exportBOADICEA', '#export_file', '#savePed', '#exportPedigreejs', '#exportGEDCOM']) await click(sel);
  await click('#save_canrisk_fromHot');
  await click('#cr_file_save');
  await page.evaluate(() => $('.ui-dialog-content:visible').each(function () { try { $(this).dialog('close'); } catch (e) {} }));
  for (const d of dls) {
    let name = d.suggestedFilename(), n = 2;
    while (files[name]) name = d.suggestedFilename() + '#' + n++;
    files[name] = fs.readFileSync(await d.path(), 'utf8');
  }
  const table = await page.evaluate(() => hot.getSourceData());
  const session = await page.evaluate(() => sessionStorage.getItem('hotData'));
  return { table, session: session && JSON.parse(session), pedigree, story, files, exportErrors };
}
module.exports = { chromium, openTool, exportAll };
