// usage: node compare.js <dirA> <dirB>  -> exits 1 if any scenario differs
const fs = require('fs'), [a, b] = process.argv.slice(2);
let same = 0, diff = 0;
for (const f of fs.readdirSync(a).filter(f => f.endsWith('.json')).sort()) {
  if (!fs.existsSync(`${b}/${f}`)) { console.log('MISSING in ' + b + ': ' + f); diff++; continue; }
  const A = require(require('path').resolve(a, f)), B = require(require('path').resolve(b, f));
  const parts = Object.fromEntries(['table', 'session', 'pedigree', 'story', 'files', 'exportErrors', 'errors', 'alerts'].map(k => [k, [A[k], B[k]]]));
  const bad = Object.entries(parts).filter(([k, [x, y]]) => JSON.stringify(x) !== JSON.stringify(y)).map(([k]) => k);
  if (bad.length) { diff++; console.log('DIFF ' + f + ': ' + bad.join(', ')); } else same++;
}
console.log(`${same} identical, ${diff} different`); process.exit(diff ? 1 : 0);
