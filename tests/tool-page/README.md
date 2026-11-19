# Tool page tests

Two sets of tests drive the tool (`index.html`) in a real browser with the mouse and keyboard. The date and `Math.random` (disease colours) are fixed, so every run is reproducible.

## 1. Bug tests (`bugs.js`)

22 tests, one per fixed bug: the summary text for a person of unknown sex, changing a sex (partners and children updated, Cancel restores), the session copy after a deletion, the index case and ancestors that cannot be deleted, deleting someone with children, rows pasted from Excel, the TSV header, and the BOADICEA / CanRisk downloads blocked while a member with a cancer used by CanRisk (breast, ovary, prostate, pancreas) has no valid age, and the personal information fields after a reset (not greyed out, no crash), and the CanRisk file saved without a dialog, named after the index case.

## 2. Table features (`grid_features.js`)

10 tests of the table itself: keyboard navigation, Escape and F2, one Ctrl+Z undoing an age together with the year of birth it filled in, copy to and paste from Excel, deleting a row then undoing it, dragging rows, tick boxes, the single-click lists, red age cells, the message when a family cannot be drawn, and no external requests.

## 3. Free-text family description (`free_text.js`)

15 sentences read by `js/text-family.js` without a browser (siblings and children of known or unknown sex, "dont 2 filles", uncles and aunts from "son père a…" or "côté maternel", older or younger brothers, half-siblings and grandchildren left aside, English), then 4 tests in the tool: the fields filled in with the menu kept open and nothing added yet, the relatives of unknown sex added to the selected person and drawn, the hint when nothing is recognised, and the English page.

## Run

```bash
npm install playwright            # once
npx playwright install chromium   # once
python3 -m http.server 8000       # in another terminal, from the folder that CONTAINS GeneTree/
cd GeneTree/tests/tool-page

node bugs.js http://localhost:8000/GeneTree/
node grid_features.js http://localhost:8000/GeneTree/
node free_text.js http://localhost:8000/GeneTree/
```
