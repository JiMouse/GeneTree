// 30 random but valid pedigrees, loaded straight into the table (tests the data plumbing and every export).
function rng(seed) { let s = seed; return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; }
const D = ['cancer_sein', 'cancer_ovaire', 'cancer_prostate', 'cancer_pancréas', 'cancer_colon', 'mélanome', 'cancer_utérus', 'Autre', 'Lymphome'];
const OPT = ['', '', '', 'FCS', 'Adopté', 'JumDZ'];
module.exports = function families() {
  const out = [];
  for (let k = 0; k < 30; k++) {
    const r = rng(500 + k), pick = a => a[Math.floor(r() * a.length)];
    let id = 0; const rows = [];
    const add = (name, fath, moth, sex, extra = {}) => {
      const p = { FamID: '1', Name: name, IndivID: String(++id), FathID: fath, MothID: moth, Sex: sex, Affected: '1', Deceased: r() < .2 ? '1' : '0', Age: '', Yob: '', Option: '', Disease1: '', Age1: '', Disease2: '', Age2: '', Disease3: '', Age3: '', ...extra };
      if (r() < .7) p.Yob = 1920 + Math.floor(r() * 90);
      if (r() < .6) p.Age = Math.floor(r() * 90);
      for (let d = 1; d <= 3; d++) if (r() < [0, .35, .12, .05][d]) { p['Disease' + d] = pick(D); p['Age' + d] = 25 + Math.floor(r() * 55); }
      if (r() < .15) p.comment = 'note ' + Math.floor(r() * 100);
      if (r() < .1) p.Option = pick(OPT);
      rows.push(p); return p.IndivID;
    };
    const sexP = r() < .5 ? 'F' : 'M';
    add('Index', '2', '3', sexP, { proband: true });
    add('Père', '4', '5', 'M'); add('Mère', '6', '7', 'F');
    add('GPP', '0', '0', 'M'); add('GMP', '0', '0', 'F'); add('GPM', '0', '0', 'M'); add('GMM', '0', '0', 'F');
    for (let i = 0, n = Math.floor(r() * 4); i < n; i++) add('Frère/Soeur' + (i + 1), '2', '3', pick(['M', 'F']));
    for (let i = 0, n = Math.floor(r() * 3); i < n; i++) add('Oncle/Tante P' + (i + 1), '4', '5', pick(['M', 'F']));
    for (let i = 0, n = Math.floor(r() * 3); i < n; i++) add('Oncle/Tante M' + (i + 1), '6', '7', pick(['M', 'F']));
    const nChildren = Math.floor(r() * 3);
    if (nChildren) {
      const partner = add('Conjoint', '0', '0', sexP === 'F' ? 'M' : 'F');
      for (let i = 0; i < nChildren; i++) add('Enfant' + (i + 1), sexP === 'F' ? partner : '1', sexP === 'F' ? '1' : partner, pick(['M', 'F']));
    }
    out.push({ id: 'R' + k, lang: k % 3 ? 'fr' : 'eng', rows });
  }
  return out;
};
