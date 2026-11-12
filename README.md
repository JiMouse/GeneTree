# GeneTree

**https://jimouse.github.io/GeneTree/**

GeneTree is an integrated tool for clinical geneticists and genetic counsellors, in French and English. It builds a pedigree quickly, exports it to the usual formats and writes the family-history text of the consultation letter. It has a dedicated mode for cancer genetics consultations and an HPO-based mode.

*GeneTree est un outil intégré pour les généticiens cliniciens et les conseillers en génétique, en français et en anglais. Il permet de construire rapidement un arbre généalogique, de l'exporter dans les formats usuels et de générer le texte de l'histoire familiale du compte rendu. Il dispose d'un mode dédié à l'oncogénétique et d'un mode basé sur HPO.*

## Features

- **Family table and pedigree drawing, interconnected.** A family is loaded from a file (JSON, BOADICEA, CanRisk, PED), created from a standard or custom structure, then completed in a spreadsheet-like table or directly on the drawing.
- **A table that works like a spreadsheet:** keyboard editing, copy and paste with Excel, undo and redo, rows moved by dragging, lists for sex and options, a cancer or HPO picker for diseases.
- **Automatic text:** the personal and family history is written from the table, in French or English.
- **Exports:** GeneTree JSON, TSV, PED, BOADICEA, CanRisk, GEDCOM, pedigreejs JSON; the drawing as SVG, image or PDF (print).
- **Patient interface** ([docs/patient.html](https://jimouse.github.io/GeneTree/docs/patient.html)): a form the patient fills in before the consultation, on a computer or a phone. It produces two files (GeneTree and CanRisk) that the patient sends to the practitioner.
- **Guide** ([docs/guide.html](https://jimouse.github.io/GeneTree/docs/guide.html)) and **About** ([docs/about.html](https://jimouse.github.io/GeneTree/docs/about.html)) pages.

## Privacy

GeneTree is a static site: everything runs in the browser.

- No data is sent to or stored on any server.
- No third-party server is contacted: every library is served from this repository.
- The tool keeps the family in the browser tab's session storage, which is cleared when the tab is closed.
- The patient interface gives the patient files to download; how they reach the practitioner is the patient's and the department's choice.

## Pages

| Page | Role |
|---|---|
| `index.html` | The tool: table, pedigree, text, exports |
| `docs/patient.html` | Patient interface |
| `docs/guide.html`, `docs/about.html` | Guide and description |
| `tool.html`, `docs/user-interface.html` | Former addresses: they forward to the tool and to the patient interface |

## Code

- `js/data-grid.js`: the tool's table (DataGrid), a dependency-free spreadsheet.
- `js/person-table.js`: the patient interface's cards (PersonTable).
- `js/main.js`, `js/main_front.js`, `js/hotTable.js`, `js/indexWidgets.js`: the tool's logic (families, table rules, exports).
- `js/user-interface.js`: the patient interface's logic.
- `js/pedigree.js`, `js/widgets.js`, `js/io.js`, `js/canrisk_file.js`…: pedigree drawing and file formats, from pedigreejs.
- `lang/`: texts and text generation in French (`*.fr.js`) and English (`*.eng.js`).
- `package/`: third-party libraries, served locally.

## Tests

The tests drive the pages in a real browser (Playwright) with the mouse and keyboard, and check what the pages produce. See the README in each folder.

- `tests/tool-page/`: the fixed bugs and the table's spreadsheet features.
- `tests/patient-page/`: the fixed bugs.
- `tests/language/`: the language switch on every page.

```bash
npm install playwright && npx playwright install chromium   # once
python3 -m http.server 8000                                 # from the folder that contains GeneTree/
node tests/tool-page/grid_features.js http://localhost:8000/GeneTree/
```

## Based on

- [pedigreejs](https://ccge-boadicea.github.io/pedigreejs/): pedigree drawing and the BOADICEA / CanRisk formats
- [HPO translations](https://github.com/drseb/HPO-translations) and ORPHAdata: phenotype and disease lists
- jQuery, jQuery UI, Bootstrap, d3 and Font Awesome

Until November 2026 the tables were built with Handsontable. They are now GeneTree's own code (`js/data-grid.js`, `js/person-table.js`), and Handsontable is no longer part of the repository.

## Authors and licence

GeneTree is developed and maintained by Dr Jean-Marie Ravel, with the participation of the clinical genetics team of the CHRU de Nancy (France).

GeneTree's own code is released under the [GPL-3.0](LICENSE) licence. The libraries in `package/` keep their own licences.
