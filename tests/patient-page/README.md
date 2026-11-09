# Patient page: output comparison tests

These tests check that two versions of the patient page produce **exactly the same files**: the pedigree passed to `FormatToPedigreeJS` (the output of `createPed()`), the GeneTree JSON download and the CanRisk download.

They run 35 families:

- **5 families entered through the interface**, in French and English, the way a patient does: index fields, the step-by-step dialogs for each relative, clicks and typing in the tables, and the cancer list. See `scenarios.js`.
- **30 random families** loaded straight into the 8 tables, to test the data plumbing. See `random_families.js`.

The date and `Math.random` (used for disease colours) are fixed, so every run is reproducible.

## Run

```bash
npm install playwright            # once
npx playwright install chromium   # once
python3 -m http.server 8000       # in another terminal, from the folder that CONTAINS GeneTree/
cd GeneTree/tests/patient-page

# reference: the current page (Handsontable)
node run_suite.js http://localhost:8000/GeneTree/docs/user-interface.html drive_old.js out_old
# the new page (PersonTable cards)
node run_suite.js http://localhost:8000/GeneTree/docs/patient.html drive_new.js out_new

node compare.js out_old out_new   # "35 identical, 0 different" expected
```

`drive_old.js` clicks into Handsontable cells, so the old page must display its tables. Handsontable 16 draws them 0 px wide, so record the reference with 15.3.0.

## Bug tests

`bugs.js` checks one fixed bug per test (12 tests): no carry-over between groups of relatives, correct ages and years of diagnosis, clearing an age, text in an age field, clickable labels, relatives' names, the English wording, and deceased relatives.

```bash
node bugs.js http://localhost:8000/GeneTree/docs/patient.html drive_new.js
node bugs.js http://localhost:8000/GeneTree/docs/user-interface.html drive_old.js
```
