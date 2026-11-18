# Patient page tests

The tests drive the patient interface (`docs/patient.html`) in a real browser, the way a patient fills it in: clicking the buttons, picking from the cancer list, typing then Tab. The date and `Math.random` (disease colours) are fixed, so every run is reproducible.

## 1. Bug tests (`bugs.js`)

11 tests, one per fixed bug: no carry-over between groups of relatives, a cancer answered "no" is not sent, correct ages and years of diagnosis, clearing an age, text in an age field, clickable labels, relatives' names, the English wording, and deceased relatives.

## 2. Questionnaire (`questionnaire.js`)

16 tests: the cards appear as soon as the number of relatives is given (no dialog), default names that follow the sex and are numbered per sex (Sœur 1, Frère 1, Sœur 2), fewer relatives (confirmation before removing filled cards), the cancer questions and the single "age or year of diagnosis" field, parents and grandparents, uncles and aunts with a second cancer, age and year of birth calculated from each other, the warnings (year of birth, diagnosis, date of birth), the patient's own cancers ("another cancer?"), a group answered "no", the comment at the end, the language switch, and what a whole family sends to the pedigree.

## 3. Live pedigree (`live.js`)

10 tests: the pedigree is drawn at load and follows the answers without any button, no alert while typing, it is a preview (no editing buttons), a whole family fits in the drawing, on a wide screen the page takes the whole width and the pedigree column (with its buttons) fits the screen, at the top and while scrolling, on a phone it is below with a "Voir l'arbre" button, and a single file, the GeneTree file, is downloaded, named after the patient (accents removed).

## Run

```bash
npm install playwright            # once
npx playwright install chromium   # once
python3 -m http.server 8000       # in another terminal, from the folder that CONTAINS GeneTree/
cd GeneTree/tests/patient-page

node bugs.js http://localhost:8000/GeneTree/docs/patient.html
node questionnaire.js http://localhost:8000/GeneTree/docs/patient.html
node live.js http://localhost:8000/GeneTree/docs/patient.html
```
