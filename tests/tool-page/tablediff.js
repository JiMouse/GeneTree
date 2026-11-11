const [a, b, id] = process.argv.slice(2); const A = require(`${a}/${id}.json`), B = require(`${b}/${id}.json`);
const ta = A.table, tb = B.table;
for (let i = 0; i < Math.max(ta.length, tb.length); i++) {
  const x = ta[i] || {}, y = tb[i] || {}; const keys = [...new Set([...Object.keys(x), ...Object.keys(y)])];
  const d = keys.filter(k => JSON.stringify(x[k]) !== JSON.stringify(y[k])).map(k => `${k}: ${JSON.stringify(x[k])} -> ${JSON.stringify(y[k])}`);
  if (d.length) console.log(`  row ${i}: ` + d.join(' | '));
}
for (const f of Object.keys({ ...A.files, ...B.files })) if (A.files[f] !== B.files[f]) console.log('  file differs:', f);
