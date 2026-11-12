// Index fields, panels, the cancer list and the step-by-step relative dialogs.
const PANEL = { cancer: 'collapseCancer', children: 'collapseChildren', siblings: 'collapseSiblings', parents: 'collapseParents', gpp: 'collapseGpp', fatherSiblings: 'collapseGpp', gpm: 'collapseGpm', motherSiblings: 'collapseGpm' };
const COLLAPSE = { collapseCancer: '#collapse1', collapseChildren: '#collapse2', collapseSiblings: '#collapse3', collapseParents: '#collapseP', collapseGpp: '#collapse4', collapseGpm: '#collapse5' };

async function openPanel(page, key) {
  const link = PANEL[key] || key;
  const open = await page.evaluate(sel => document.querySelector(sel).classList.contains('in'), COLLAPSE[link]);
  if (!open) { await page.click('#' + link); }
  await page.waitForTimeout(700);
}

async function pickCancer(page, value) {
  await page.locator('#cancerList2').waitFor({ state: 'visible' });
  // the tests use the French keys; translate by position for the English page
  const FR = ['cancer_sein', 'cancer_sein2', 'cancer_ovaire', 'cancer_prostate', 'cancer_pancréas', 'cancer_colon', 'cancer_estomac', 'cancer_poumon', 'cancer_utérus', 'cancer_rein', 'cancer_foie', 'mélanome', 'cancer_orl', 'polypes'];
  const key = await page.evaluate(([fr, v]) => fr.includes(v) ? onco_full()[fr.indexOf(v)] : v, [FR, value]);
  await page.locator(`#cancerList2 input[value="${key}"]`).click();
  await page.waitForTimeout(250);
}

// Index fields + the step-by-step dialogs for children / siblings / aunts and uncles
async function fillIndexFields(page, sc) {
  await page.fill('#civil_name', sc.index.name);
  if (sc.index.dbirth) { await page.click('#dbirth'); await page.keyboard.type(sc.index.dbirth.replace(/\//g, '')); }
  await page.evaluate(id => document.getElementById(id).click(), sc.index.sex === 'M' ? 'index_id_sex_0' : 'index_id_sex_1');
  await page.fill('#form_id_comment', sc.index.comment);
}

async function addRelatives(page, group, list) {
  if (!list.length) return;
  const panel = { children: 'children', siblings: 'siblings', fatherSiblings: 'fatherSiblings', motherSiblings: 'motherSiblings' }[group];
  await openPanel(page, group);
  await page.check(`#${panel}_Yes`);
  await page.fill(`#${panel}_input`, String(list.length));
  await page.locator(`#${panel}_input`).blur();
  for (const p of list) {
    const dlg = page.locator('.ui-dialog:has(#defineInd)');
    await dlg.waitFor({ state: 'visible' });
    await page.waitForTimeout(550);
    await page.check(`#defineInd input[name=sex][value=${p.sex}]`);
    await page.fill('#yobIndInput', p.yob);
    if (p.dead) { await page.check('#defineInd input[name=deadStatus][value="1"]'); await page.fill('#deathyIndInput', p.deathAge); }
    if (p.d1) {
      await page.check('#defineInd input[name=diseaseStatus][value="1"]');
      await page.click('#IndDisease1Input'); await pickCancer(page, p.d1);
      await page.fill('#IndDisease1Age', p.a1 || '');
      if (p.d2) { await page.click('#IndDisease2Input'); await pickCancer(page, p.d2); await page.fill('#IndDisease2Age', p.a2 || ''); }
    }
    if (p.comment) await page.fill('#IndCommentInput', p.comment);
    await dlg.locator('.ui-dialog-buttonpane button').first().click(); // 'Sauvegarder' before the fix, 'Enregistrer' / 'Save' after
    await page.waitForTimeout(450);
  }
  await page.waitForTimeout(400);
}

module.exports = { openPanel, pickCancer, fillIndexFields, addRelatives };
