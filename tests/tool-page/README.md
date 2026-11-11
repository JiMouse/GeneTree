# Tool page: output comparison tests

These tests check that the tool built on Handsontable (`index.html`) and the tool built on DataGrid (`tool.html`) produce **exactly the same results**. For each family they compare:

- the table (`getSourceData()`) and the copy saved in the session;
- the pedigree built from the table (output of `FormatToPedigreeJS`);
- the summary text;
- the 7 exported files: GeneTree JSON, BOADICEA, TSV, PED, pedigreejs JSON, GEDCOM and CanRisk;
- alerts and errors, including an export failing the same way on both pages.

They run 38 families:

- **8 families entered through the table** (`scenarios.js`), the way a physician does: typing and Enter, ticking boxes, the cancer and HPO pickers, pasting blocks from Excel (including new rows and multi-line cells), Delete on a selection, undo/redo, deleting rows (and the partner/children warning), dragging rows (and the refusal to move a row above the index), changing a sex (partner and children swapped), and the family buttons (branch, son, daughter, miscarriage, custom family).
- **30 random but valid pedigrees** (`random_families.js`), loaded straight into the table.

The date and `Math.random` (disease colours) are fixed, so every run is reproducible.

## Run

```bash
npm install playwright            # once
npx playwright install chromium   # once
python3 -m http.server 8000       # in another terminal, from the folder that CONTAINS GeneTree/
cd GeneTree/tests/tool-page

node run_suite.js http://localhost:8000/GeneTree/ drive_old.js out_old          # Handsontable
node run_suite.js http://localhost:8000/GeneTree/tool.html drive_new.js out_new # DataGrid
node compare.js out_old out_new          # "38 identical, 0 different" expected

node grid_features.js http://localhost:8000/GeneTree/tool.html   # DataGrid's own features
```

`drive_old.js` and `drive_new.js` hold the two actions that use each grid's own widgets: deleting a row (Handsontable's right-click menu or DataGrid's × button) and dragging a row. Every other action (`grid_driver.js`) is the same mouse and keyboard input on both pages.

`grid_features.js` checks DataGrid's spreadsheet features directly: keyboard navigation, Escape and F2, one Ctrl+Z undoing an age together with the year of birth it filled in, copy to and paste from Excel, deleting a row then undoing it, dragging rows, tick boxes, dropdown lists, red age cells, and no external requests.

## Bug tests

`bugs.js` checks the fixed tool bugs (11 tests), on both pages:

- the summary text for a person of unknown sex ("Grossesse"), in French and English;
- changing a sex: partners and children's father/mother columns updated, listed, and Cancel restores the previous sex;
- the session copy updated after deleting a row;
- the index case and his/her ancestors cannot be deleted;
- deleting someone with children lists who else goes, and Cancel deletes nobody;
- rows pasted from Excel get the family number;
- the TSV header.

```bash
node bugs.js http://localhost:8000/GeneTree/ drive_old.js
node bugs.js http://localhost:8000/GeneTree/tool.html drive_new.js
```
