const fs = require('node:fs');
const { Client, types } = require('pg');
types.setTypeParser(1082, value => value);
if (!process.env.DATABASE_URL) throw new Error('Set DATABASE_URL to a dedicated lab database');
(async () => {
  const db = new Client({ connectionString: process.env.DATABASE_URL });
  await db.connect();
  try {
    for (const file of process.argv.slice(2)) {
      console.log('FILE: ' + file);
      const results = await db.query(fs.readFileSync(file, 'utf8'));
      for (const r of Array.isArray(results) ? results : [results]) {
        if (r.rows.length) console.log(JSON.stringify(r.rows, null, 2));
        else console.log(r.command + ': ' + (r.rowCount ?? 'OK'));
      }
    }
  } finally { await db.end(); }
})().catch(e => { console.error(e.message); process.exitCode = 1; });
