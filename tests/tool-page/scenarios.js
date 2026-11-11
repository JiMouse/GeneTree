// Tool scenarios, as a list of actions on the table. Columns:
// 0 Name, 1 IndivID, 2 FathID, 3 MothID, 4 Sex, 5 Deceased, 6 Age, 7 Yob, 8 Option,
// 9 Disease1, 10 Age1, 11 Disease2, 12 Age2, 13 Disease3, 14 Age3, 15 comment
module.exports = [
  {
    id: 'T1_nuclear_keyboard_fr', lang: 'fr', steps: [
      ['template', 'nuclear'],
      ['type', 0, 0, 'DUPONT Marie'], ['type', 0, 6, '45'],                          // age -> year of birth
      ['disease', 0, 9, 'cancer_sein'], ['type', 0, 10, '40'],
      ['check', 1, 5], ['type', 1, 7, '1950'], ['type', 1, 6, '2010'],               // deceased: death year -> age
      ['disease', 1, 9, 'cancer_prostate'], ['type', 1, 10, '2012'],                 // year of diagnosis -> age
      ['type', 2, 7, '1952'], ['disease', 2, 9, 'cancer_ovaire'], ['type', 2, 10, '58'],
      ['disease', 2, 11, 'cancer_sein'], ['type', 2, 12, '62'], ['type', 2, 15, 'opérée à Nancy'],
      ['type', 0, 8, 'Grossesse'],
    ],
  },
  {
    id: 'T2_extended_paste_delete_fr', lang: 'fr', steps: [
      ['template', 'extended1'],
      ['paste', 3, 6, '80\t\t\tcancer_colon\t70\n\t1940'],                       // block on 2 rows, 5 columns
      ['paste', 1, 15, '"note\nsur deux lignes"\nnote "citée"'],                   // multi-line Excel cell, quotes
      ['disease', 2, 9, 'cancer_sein'], ['type', 2, 10, '55'],
      ['range_delete', 3, 9, 3, 10],                                                  // Delete key on two cells
      ['type', 4, 15, 'commentaire'], ['undo'], ['type', 5, 15, 'autre'], ['undo'], ['redo'],
    ],
  },
  {
    id: 'T2b_paste_new_rows_fr', lang: 'fr', steps: [                                // new rows have no FamID: the tool
      ['template', 'extended1'],                                                      // then cannot build the pedigree
      ['paste', 6, 0, 'Grand-Mère mat\t7\t0\t0\tF\t0\nOncle\t8\t4\t5\tM\t0\t70\n"Tante\nAnne"\t9\t4\t5\tF\t1\t\t1950'],
    ],
  },
  {
    id: 'T3_remove_move_rows_fr', lang: 'fr', steps: [
      ['template', 'extended1'],
      ['select', 0, 0], ['branch', { brother: 2, sister: 1 }],
      ['remove', 2],                                                                  // a brother (no children)
      ['move', 3, 1],                                                                 // drag row 3 to just below the index
      ['move', 1, 4],
      ['move', 2, 0],                                                                 // refused: index stays first (alert)
    ],
  },
  {
    id: 'T3b_remove_with_children_fr', lang: 'fr', steps: [
      ['template', 'extended2'],
      ['remove', 1], ['dialog', 0],                                                   // father: "Continue" also removes his children
    ],
  },
  {
    id: 'T4_sex_change_branch_eng', lang: 'eng', steps: [
      ['template', 'extended1'],
      ['select', 0, 0], ['branch', { son: 2, daughter: 1, brother: 1 }],
      ['type', 6, 4, 'F'], ['dialog', 0],                                             // father (row 6 after the branch) -> F: swap partner + children
      ['select', 3, 0], ['click', '#add-daughter'],
      ['select', 0, 0], ['click', '#add-miscarriage'],
      ['type', 2, 0, 'Mary'],
    ],
  },
  {
    id: 'T5_hpo_and_custom_fr', lang: 'fr', steps: [
      ['custom', { brother: 1, sister: 2, uncleM: 1 }],
      ['click', '#myCheckHPO'], ['hpo', 0, 9, 0], ['hpo', 1, 9, 3],
      ['click', '#myCheckOnco'], ['disease', 2, 9, 'cancer_colon'], ['type', 2, 10, '45'],
      ['type', 3, 4, 'U'], ['check', 3, 5], ['check', 3, 5],
    ],
  },
];
