# Tool page tests

Two sets of tests drive the tool (`index.html`) in a real browser with the mouse and keyboard. The date and `Math.random` (disease colours) are fixed, so every run is reproducible.

## 1. Bug tests (`bugs.js`)

35 tests, one per fixed bug: the summary text for a person of unknown sex, changing a sex (partners and children updated, Cancel restores), the session copy after a deletion, the index case and ancestors that cannot be deleted, deleting someone with children, rows pasted from Excel, the TSV header, and the BOADICEA / CanRisk downloads blocked while a member with a cancer used by CanRisk (breast, ovary, prostate, pancreas) has no valid age, and the personal information fields after a reset (not greyed out, no crash), the CanRisk file saved without a dialog, named after the index case, and the *Supprimer la maladie* button of the disease list (disease and age emptied, one Ctrl+Z, not shown on an empty cell, cancer and HPO lists), and *Nom Prénom* of *Ajouter des informations* copied to the name while it is a default one ("Index", "Oncle pat2", an Id.), shown once on the drawing, a typed name kept, and the summary text for deceased relatives ("Sa grand-mère paternelle est décédée à 49 ans", "Son père est décédé.", "un frère (décédé)", "d'une tumeur"), in French and English, and the same disease twice with two ages ("mélanome: 56, 62" on the drawing, "deux mélanomes diagnostiqués…", back to two lines of the table after an edit on the drawing, gone from the drawing once removed from the table, a file saved by an earlier version drawn without duplicates, "44, ?" and the first age in CanRisk).

`fixtures/courrier-oncogenetique.txt` is an oncogenetics letter (invented identity) and `fixtures/courrier-oncogenetique.json` the family it describes.

## 2. Table features (`grid_features.js`)

10 tests of the table itself: keyboard navigation, Escape and F2, one Ctrl+Z undoing an age together with the year of birth it filled in, copy to and paste from Excel, deleting a row then undoing it, dragging rows, tick boxes, the single-click lists, red age cells, the message when a family cannot be drawn, and no external requests.

## 3. Free-text family history (`free_text.js`)

70 texts read by `js/text-family.js` without a browser, each checked against the exact preview it gives on the default family: siblings and children of known or unknown sex ("dont 2 filles", "2 enfants, un fils et une fille"), uncles and aunts ("son père a 2 frères", "côté maternel"), half-siblings on each side with one new partner of the parent, nephews and cousins through a named relative, cancers mapped to the table's keys (French and English, "K sein", bilateral breast cancer), other diseases kept as written, death and age, negations, a long anamnesis, what is listed for the user, and the table itself (disease columns, comment, year of birth, a brother or uncle already in the table reused, the same text applied twice), and a letter pasted from a PDF (`fixtures/courrier-oncogenetique.txt`, and `-interligne.txt` double spaced: lines cut inside a sentence, "Il est décédé." after "son père…", "deux de ses oncles… pour l'un… pour l'autre…, également décédés", "deux mélanomes, le premier… le second en 2022", a year of diagnosis turned into an age; the rows obtained are exactly `fixtures/courrier-oncogenetique.json`), and the index case's identity ("Madame DUPONT Marie, née … le 21/11/1960": *Nom Prénom*, date and year of birth, age; a relative's "Monsieur …" is not the index case), and twins ("sa sœur jumelle", "deux frères jumeaux", "de vrais jumeaux", "des jumeaux de 5 ans", "son père a un frère jumeau": JumDZ unless said otherwise, JumMZ only for the same sex). Then 8 tests in the tool: the preview with nothing changed yet, *Ajouter à l'arbre* (rows, drawing, text of the letter), half-siblings and grandparents drawn, the preview hidden when the text changes, the hint when nothing is recognised, the English page, the oncogenetics letter pasted in (table, drawing, text of the letter) and twins drawn as twins.

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
