// 30 random families loaded straight into the 8 tables (tests the data plumbing, not the widgets).
function rng(seed) { let s = seed; return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; }
// French keys; the English families (lang 'eng') still exercise the plumbing, which is key-agnostic
const D = ['cancer_sein', 'cancer_sein2', 'cancer_ovaire', 'cancer_prostate', 'cancer_pancréas', 'cancer_colon', 'mélanome', 'Autre'];
function person(r, name, extra = {}) {
  const p = { FamID: '1', Name: name, Sex: r() < .5 ? 'M' : 'F', Deceased: r() < .2 ? '1' : '0', ...extra };
  if (r() < .8) p.Yob = String(1930 + Math.floor(r() * 80));
  if (r() < .6) p.Age = Math.floor(r() * 90);
  if (r() < .4) { p.Disease1 = D[Math.floor(r() * D.length)]; p.Age1 = String(30 + Math.floor(r() * 50)); }
  if (r() < .15) { p.Disease2 = D[Math.floor(r() * D.length)]; p.Age2 = String(30 + Math.floor(r() * 50)); }
  if (r() < .2) p.Year1 = 1990 + Math.floor(r() * 35);
  if (r() < .2) p.comment = 'note ' + Math.floor(r() * 100);
  return p;
}
module.exports = function families() {
  const out = [];
  for (let k = 0; k < 30; k++) {
    const r = rng(1000 + k), n = () => Math.floor(r() * 4);
    const fixed = (rows) => rows.map(row => { const p = person(r, row.Name, row); p.Sex = row.Sex; return p; });
    out.push({
      id: 'R' + k, lang: k % 3 ? 'fr' : 'eng',
      index: { sex: r() < .5 ? 'M' : 'F', dbirth: r() < .7 ? `0${1 + Math.floor(r() * 9)}/0${1 + Math.floor(r() * 9)}/19${50 + Math.floor(r() * 45)}` : '' },
      tables: {
        hotCancer: r() < .5 ? [{ Cancer: D[Math.floor(r() * 7)], Age: 40 + Math.floor(r() * 30), Year: '' }, { Cancer: null, Age: null, Year: null }] : [{ Cancer: '', Age: '', Year: '' }],
        hotParents: fixed([{ FamID: '1', Name: 'Père', IndivID: '2', FathID: '4', MothID: '5', Sex: 'M', Affected: '1' }, { FamID: '1', Name: 'Mère', IndivID: '3', FathID: '6', MothID: '7', Sex: 'F', Affected: '1' }]),
        hotGpp: fixed([{ FamID: '1', Name: 'GPP', IndivID: '4', FathID: '0', MothID: '0', Sex: 'M', Affected: '1' }, { FamID: '1', Name: 'GMP', IndivID: '5', FathID: '0', MothID: '0', Sex: 'F', Affected: '1' }]),
        hotGpm: fixed([{ FamID: '1', Name: 'GPM', IndivID: '6', FathID: '0', MothID: '0', Sex: 'M', Affected: '1' }, { FamID: '1', Name: 'GMM', IndivID: '7', FathID: '0', MothID: '0', Sex: 'F', Affected: '1' }]),
        hotChildren: Array.from({ length: n() }, (_, i) => person(r, 'Enfant' + (i + 1))),
        hotSiblings: Array.from({ length: n() }, (_, i) => person(r, 'Enfant' + (i + 1))),
        hotFatherSiblings: Array.from({ length: n() }, (_, i) => person(r, 'Enfant' + (i + 1))),
        hotMotherSiblings: Array.from({ length: n() }, (_, i) => person(r, 'Enfant' + (i + 1))),
      },
    });
  }
  return out;
};
