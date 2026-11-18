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
  const errors = [], answers = { confirm: false };   // a test sets answers.confirm = true to accept the next confirm()
  page.on('pageerror', e => errors.push(e.message));
  page.on('dialog', d => { errors.push('alert: ' + d.message()); if (d.type() === 'confirm' && answers.confirm) d.accept(); else d.dismiss(); });
  await page.goto(url, {waitUntil:'networkidle'});
  await page.evaluate(() => {
    const orig = window.FormatToPedigreeJS;
    window.__createPedOut = [];
    window.FormatToPedigreeJS = function(obj, ...rest) { window.__createPedOut.push(JSON.parse(JSON.stringify(obj))); return orig.call(this, obj, ...rest); };
  });
  return {ctx, page, errors, answers};
}

// Runs tests one by one, each on a fresh page; a page error or an unexpected alert fails the test.
async function runTests(tests, url) {
  const b = await chromium.launch(); let failed = 0;
  for (const t of tests) {
    const { ctx, page, errors, answers } = await openPage(b, url, t.lang);
    try {
      await t.fn(page, answers, errors);
      const errs = errors.filter(e => !e.startsWith('alert'));
      if (errs.length) throw new Error('page errors: ' + errs.join(' | '));
      console.log('PASS ' + t.name);
    } catch (e) { failed++; console.log('FAIL ' + t.name + '\n     ' + e.message.split('\n')[0]); }
    await ctx.close();
  }
  console.log(`${tests.length - failed}/${tests.length} passed`); await b.close(); process.exit(failed ? 1 : 0);
}

// The family the page sends to the pedigree (input of FormatToPedigreeJS)
async function pedigree(page) {
  await page.evaluate(() => $('#createPed').click()); await page.waitForTimeout(400);
  return page.evaluate(() => window.__createPedOut[window.__createPedOut.length - 1]);
}
module.exports = { chromium, openPage, runTests, pedigree };
