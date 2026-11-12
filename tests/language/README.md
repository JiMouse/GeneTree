# Language switch test

`language.js` switches language (FR → EN → FR → EN) on every page, with the language files slowed down by 400 ms, as on a real connection. On each page it checks that the flag, the label, the page texts and the saved preference always agree, and that the choice survives a reload. It also checks the tool's table headers, and on the patient page the card labels and default names (a name typed by the patient must be kept).

```bash
python3 -m http.server 8000       # from the folder that CONTAINS GeneTree/
node language.js http://localhost:8000/GeneTree/
```
