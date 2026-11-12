# Patient page tests

The bug tests drive the patient interface (`docs/patient.html`) in a real browser. The date and `Math.random` (disease colours) are fixed, so every run is reproducible.

## Bug tests (`bugs.js`)

12 tests, one per fixed bug: no carry-over between groups of relatives, correct ages and years of diagnosis, clearing an age, text in an age field, clickable labels, relatives' names, the English wording, and deceased relatives.

## Run

```bash
npm install playwright            # once
npx playwright install chromium   # once
python3 -m http.server 8000       # in another terminal, from the folder that CONTAINS GeneTree/
cd GeneTree/tests/patient-page

node bugs.js http://localhost:8000/GeneTree/docs/patient.html
```
