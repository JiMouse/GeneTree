// Language switch on every page, with slow language files (as on a real connection).
// usage: node language.js http://localhost:8000/GeneTree/
const { chromium } = require('playwright');
const base = process.argv[2], DELAY = 400;
const expect = (c, m) => { if (!c) throw new Error(m); };
const PAGES = ['', 'tool-handsontable.html', 'docs/patient.html', 'docs/user-interface.html', 'docs/about.html', 'docs/guide.html'];
const WORD = { fr: 'Outil', eng: 'Tool' }, LABEL = { fr: 'Fr', eng: 'Eng' };

(async () => {
  const b = await chromium.launch(); let failed = 0;
  for (const pg of PAGES) {
    const p = await b.newPage({ viewport: { width: 1400, height: 900 } }); const errs = [];
    p.on('pageerror', e => errs.push(e.message)); p.on('dialog', d => d.accept());
    await p.addInitScript(() => { if (!localStorage.getItem('__init')) { localStorage.setItem('language', 'fr'); localStorage.setItem('__init', '1'); } });
    await p.route(/lang\/(lang|story)\./, async r => { await new Promise(x => setTimeout(x, DELAY)); r.continue(); });
    const state = () => p.evaluate(() => ({ flag: $('#LangSetterImg').attr('src').split('/').pop().replace('.svg', ''), label: $('#LangSetterText').text(), text: $('.lang').filter(function () { return $(this).text().trim().length > 3; }).first().text().trim(), stored: localStorage.getItem('language') }));
    const check = async (lang, when) => { const s = await state(); expect(s.flag === lang && s.label === LABEL[lang] && s.text.startsWith(WORD[lang]) && s.stored === lang, `${when}: expected ${lang}, got ${JSON.stringify(s)}`); };
    try {
      await p.goto(base + pg, { waitUntil: 'networkidle' }); await p.waitForTimeout(1500);
      await check('fr', 'at load');
      if (pg === 'docs/patient.html') await p.evaluate(() => hotGpp.setDataAtRowProp(1, 'Name', 'Mamie Jeanne'));
      for (const lang of ['eng', 'fr', 'eng']) {
        await p.evaluate(l => $(l === 'fr' ? '#LangSetterFr' : '#LangSetterEng').click(), lang); await p.waitForTimeout(DELAY * 2 + 900);
        await check(lang, 'after switching to ' + lang);
      }
      if (pg === '' || pg === 'tool-handsontable.html') {
        const h = await p.evaluate(() => [...document.querySelectorAll('#dataTable thead th')].map(t => t.textContent.trim()).filter(Boolean).slice(0, 6).join('|'));
        expect(h.startsWith('Name|Id.|Father|Mother'), 'table headers: ' + h);
      }
      if (pg === 'docs/patient.html') {
        const r = await p.evaluate(() => ({ labels: [...new Set([...document.querySelectorAll('#hotParents label')].map(l => l.textContent.trim()))].join('|'), names: [...document.querySelectorAll('#hotParents .pt-name input, #hotGpp .pt-name input')].map(i => i.value).join('|') }));
        expect(r.labels === 'Name|Sex|Deceased|Age|Year of birth|Cancer site|Age at diagnosis|Year of diagnosis|Comment', 'card labels: ' + r.labels);
        expect(r.names === 'Father|Mother|Paternal grandfather|Mamie Jeanne', 'names (a name typed by the patient must be kept): ' + r.names);
      }
      await p.reload({ waitUntil: 'networkidle' }); await p.waitForTimeout(1500);
      await check('eng', 'after reloading');
      expect(!errs.length, 'page errors: ' + errs.join(' | '));
      console.log('PASS ' + (pg || 'index.html'));
    } catch (e) { failed++; console.log('FAIL ' + (pg || 'index.html') + '\n     ' + e.message.split('\n')[0]); }
    await p.close();
  }
  console.log(`${PAGES.length - failed}/${PAGES.length} passed`); await b.close(); process.exit(failed ? 1 : 0);
})();
