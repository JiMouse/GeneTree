// Family scenarios, described independently of the page's widgets.
// Each relative added through the dialog: {sex, yob (year or age), dead, deathAge, d1, a1, d2, a2, comment}
// Table edits after the dialogs: [table, row, prop, value]  (value typed as a patient would, as text)
module.exports = [
  {
    id: 'S1_full_family_fr', lang: 'fr',
    index: { name: 'DUPONT Marie', dbirth: '15/03/1975', sex: 'F', comment: 'Suivi au CHRU', cancers: [{ cancer: 'cancer_sein', age: '45' }] },
    children: [{ sex: 'F', yob: '2000', d1: 'cancer_sein', a1: '24' }, { sex: 'M', yob: '23', comment: 'vit à Lyon' }],
    siblings: [{ sex: 'M', yob: '1972', dead: true, deathAge: '2010', d1: 'cancer_colon', a1: '37' }, { sex: 'F', yob: '1978' }],
    fatherSiblings: [{ sex: 'F', yob: '1950', d1: 'cancer_ovaire', a1: '60', d2: 'cancer_sein', a2: '65' }],
    motherSiblings: [{ sex: 'M', yob: '1948' }, { sex: 'M', yob: '1952', dead: true, deathAge: '70', d1: 'cancer_prostate', a1: '68' }],
    edits: [
      ['parents', 0, 'Age', '78'], ['parents', 0, 'Disease1', 'cancer_prostate'], ['parents', 0, 'Age1', '70'],
      ['parents', 1, 'Yob', '1950'], ['parents', 1, 'Deceased', '1'],
      ['gpm', 1, 'Disease1', 'cancer_sein'], ['gpm', 1, 'Age1', '55'], ['gpm', 1, 'Deceased', '1'],
      ['gpp', 0, 'Name', 'Jean'], ['children', 1, 'Age', '25'],
    ],
  },
  {
    id: 'S2_man_no_cancer_eng', lang: 'eng',
    index: { name: 'SMITH John', dbirth: '01/12/1980', sex: 'M', comment: '', cancers: [] },
    children: [], siblings: [{ sex: 'F', yob: '1983', d1: 'cancer_sein', a1: '40' }],
    fatherSiblings: [], motherSiblings: [],
    edits: [['parents', 0, 'Yob', '1950'], ['parents', 1, 'Age', '72'], ['parents', 1, 'Disease1', 'cancer_ovaire'], ['parents', 1, 'Year1', '2015']],
  },
  {
    id: 'S3_empty_form_fr', lang: 'fr',
    index: { name: '', dbirth: '', sex: 'F', comment: '', cancers: [] },
    children: [], siblings: [], fatherSiblings: [], motherSiblings: [], edits: [],
  },
  {
    id: 'S4_two_cancers_comments_fr', lang: 'fr',
    index: { name: 'MARTIN Léa', dbirth: '20/06/1968', sex: 'F', comment: 'Lettre du Dr X', cancers: [{ cancer: 'cancer_sein', age: '40' }, { cancer: 'cancer_ovaire', year: '2019' }] },
    children: [{ sex: 'M', yob: '1995', comment: 'adopté ?' }, { sex: 'F', yob: '1998', d1: 'mélanome', a1: '25' }, { sex: 'F', yob: '2002' }],
    siblings: [], fatherSiblings: [{ sex: 'M', yob: '1940', dead: true, deathAge: '1990' }], motherSiblings: [],
    edits: [['gpp', 0, 'Deceased', '1'], ['gpp', 1, 'Age', '95'], ['gpm', 0, 'Disease1', 'cancer_pancréas'], ['gpm', 0, 'Age1', '80'], ['children', 0, 'Disease1', 'cancer_colon'], ['children', 0, 'Age1', '28']],
  },
  {
    id: 'S5_no_birthdate_eng', lang: 'eng',
    index: { name: 'DOE Jane', dbirth: '', sex: 'F', comment: '', cancers: [{ cancer: 'cancer_colon', age: '50' }] },
    children: [], siblings: [], fatherSiblings: [], motherSiblings: [{ sex: 'F', yob: '60', d1: 'cancer_utérus', a1: '55' }],
    edits: [['motherSiblings', 0, 'Name', 'Tante Anne'], ['motherSiblings', 0, 'comment', 'opérée à Nancy']],
  },
];
