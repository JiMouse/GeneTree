// Test harness for the patient page: fixed date and Math.random, captures the createPed() output.
const { chromium } = require('playwright');
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
module.exports = { chromium, openPage };
