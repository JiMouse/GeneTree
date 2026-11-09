// Shared test harness: deterministic clock + random, captures createPed() output and both downloaded files.
const { chromium } = require('playwright');
const fs = require('fs');
const FIXED = new Date('2026-11-09T10:00:00');
async function openPage(browser, url, lang='fr', viewport={width:1300,height:900}) {
  const ctx = await browser.newContext({acceptDownloads:true, viewport, locale: lang==='fr'?'fr-FR':'en-US'});
  const page = await ctx.newPage();
  await page.addInitScript(([lang, fixed]) => {
    const RealDate = Date, offset = fixed - RealDate.now();
    class FakeDate extends RealDate { constructor(...a) { if (a.length) super(...a); else super(RealDate.now() + offset); } static now() { return RealDate.now() + offset; } }
    window.Date = FakeDate;
    let s = 42; Math.random = () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
    try { localStorage.setItem('language', lang); sessionStorage.clear(); } catch(e) {}
  }, [lang, FIXED.getTime()]);
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('dialog', d => { errors.push('alert: ' + d.message()); d.dismiss(); });
  await page.goto(url, {waitUntil:'networkidle'});
  await page.evaluate(() => {
    const orig = window.FormatToPedigreeJS;
    window.__createPedOut = [];
    window.FormatToPedigreeJS = function(obj, ...rest) { window.__createPedOut.push(JSON.parse(JSON.stringify(obj))); return orig.call(this, obj, ...rest); };
  });
  return {ctx, page, errors};
}
async function buildAndExport(page) {
  await page.click('#createPed');
  await page.waitForTimeout(300);
  const createPed = await page.evaluate(() => window.__createPedOut[window.__createPedOut.length-1]);
  const dls = [];
  page.on('download', d => dls.push(d));
  await page.click('#exportPedigreejsCanRisk');
  await page.waitForTimeout(400);
  await page.click('#cr_file_save');
  await page.waitForTimeout(400);
  const files = {};
  for (const d of dls) files[d.suggestedFilename().replace(/\d{4}-\d{2}-\d{2}|\d{8,}/g,'DATE')] = fs.readFileSync(await d.path(), 'utf8');
  return {createPed, files};
}
module.exports = { chromium, openPage, buildAndExport };
