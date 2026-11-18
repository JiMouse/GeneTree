// Index fields, panels, the cancer list and the relatives' cards.
const PANEL = { cancer: 'collapseCancer', children: 'collapseChildren', siblings: 'collapseSiblings', parents: 'collapseParents', gpp: 'collapseGpp', fatherSiblings: 'collapseGpp', gpm: 'collapseGpm', motherSiblings: 'collapseGpm', comment: 'collapseComment' };
const COLLAPSE = { collapseCancer: '#collapse1', collapseChildren: '#collapse2', collapseSiblings: '#collapse3', collapseParents: '#collapseP', collapseGpp: '#collapse4', collapseGpm: '#collapse5', collapseComment: '#collapse6' };
const BOX = { cancer: '#hotCancer', parents: '#hotParents', gpp: '#hotGpp', gpm: '#hotGpm', children: '#hotChildren', siblings: '#hotSiblings', fatherSiblings: '#hotFatherSiblings', motherSiblings: '#hotMotherSiblings' };
const RADIOS = ['Sex', 'K1', 'K2', 'More'];

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

// One field of a card, the way a patient does it: click a button, pick from the list, or type then Tab.
async function editField(page, table, row, prop, value) {
  const box = `${BOX[table]} [data-row="${row}"]`;
  if (RADIOS.includes(prop)) { await page.locator(`${box} [id$="-r${row}-${prop}"] input[value="${value}"]`).click(); await page.waitForTimeout(150); return; }
  const field = page.locator(`${box} [id$="-r${row}-${prop}"]`);
  await field.scrollIntoViewIfNeeded();
  if (/^(Disease\d|Cancer)$/.test(prop)) { await field.click(); await pickCancer(page, value); return; }
  if (prop === 'Deceased') { await field.click(); await page.waitForTimeout(150); return; }
  await field.click(); await field.fill(value); await page.keyboard.press('Tab'); await page.waitForTimeout(150);
}

async function fillIndexFields(page, sc) {
  await page.fill('#civil_name', sc.index.name);
  if (sc.index.dbirth) { await page.click('#dbirth'); await page.keyboard.type(sc.index.dbirth.replace(/\//g, '')); await page.keyboard.press('Tab'); }
  await page.evaluate(id => document.getElementById(id).click(), sc.index.sex === 'M' ? 'index_id_sex_0' : 'index_id_sex_1');
  if (sc.index.comment) { await openPanel(page, 'comment'); await page.fill('#form_id_comment', sc.index.comment); }
}

// Give the number of relatives, then fill their cards
async function addRelatives(page, group, list) {
  if (!list.length) return;
  await openPanel(page, group);
  await page.check(`#${group}_Yes`);
  await page.fill(`#${group}_input`, String(list.length));
  await page.keyboard.press('Tab'); await page.waitForTimeout(300);
  for (let i = 0; i < list.length; i++) await fillCard(page, group, i, list[i]);
}

async function fillCard(page, group, i, p) {
  if (p.sex) await editField(page, group, i, 'Sex', p.sex);
  if (p.dead) await editField(page, group, i, 'Deceased');
  if (p.yob) await editField(page, group, i, 'Yob', p.yob);
  if (p.age) await editField(page, group, i, 'Age', p.age);
  if (p.d1) {
    await editField(page, group, i, 'K1', '1');
    await editField(page, group, i, 'Disease1', p.d1);
    if (p.a1) await editField(page, group, i, 'Dx1', p.a1);
    if (p.d2) {
      await editField(page, group, i, 'K2', '1');
      await editField(page, group, i, 'Disease2', p.d2);
      if (p.a2) await editField(page, group, i, 'Dx2', p.a2);
    }
  }
  if (p.comment) await editField(page, group, i, 'comment', p.comment);
}

module.exports = { openPanel, pickCancer, editField, fillIndexFields, addRelatives, fillCard };
