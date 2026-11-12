// Test harness for the GeneTree tool page: fixed date and Math.random.
const { chromium } = require('playwright');
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

module.exports = { chromium, openTool };
