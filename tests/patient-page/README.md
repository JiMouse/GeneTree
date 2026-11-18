# Patient page tests

The tests drive the patient interface (`docs/patient.html`) in a real browser, the way a patient fills it in: clicking the buttons, picking from the cancer list, typing then Tab. The date and `Math.random` (disease colours) are fixed, so every run is reproducible.

## 1. Bug tests (`bugs.js`)

11 tests, one per fixed bug: no carry-over between groups of relatives, a cancer answered "no" is not sent, correct ages and years of diagnosis, clearing an age, text in an age field, clickable labels, relatives' names, the English wording, and deceased relatives.

## 2. Questionnaire (`questionnaire.js`)

15 tests: the cards appear as soon as the number of relatives is given (no dialog), default names that follow the sex, fewer relatives (confirmation before removing filled cards), the cancer questions and the single "age or year of diagnosis" field, parents and grandparents, uncles and aunts with a second cancer, age and year of birth calculated from each other, the warnings (year of birth, diagnosis, date of birth), the patient's own cancers ("another cancer?"), a group answered "no", the comment at the end, the language switch, and what a whole family sends to the pedigree.

## Run

```bash
npm install playwright            # once
npx playwright install chromium   # once
python3 -m http.server 8000       # in another terminal, from the folder that CONTAINS GeneTree/
cd GeneTree/tests/patient-page

node bugs.js http://localhost:8000/GeneTree/docs/patient.html
node questionnaire.js http://localhost:8000/GeneTree/docs/patient.html
```
