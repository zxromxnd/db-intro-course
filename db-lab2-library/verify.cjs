const assert = require('node:assert/strict');
const { Client } = require('pg');
if (!process.env.DATABASE_URL) throw new Error('Set DATABASE_URL');
const config = { connectionString: process.env.DATABASE_URL };
(async () => {
  const db = new Client(config);
  await db.connect();
  let count = 0;
  async function rejected(name, sql, code) {
    await db.query('BEGIN');
    try {
      let error;
      try { await db.query(sql); await db.query('SET CONSTRAINTS ALL IMMEDIATE'); }
      catch (e) { error = e; }
      assert.equal(error?.code, code, name + ': expected SQLSTATE ' + code);
      console.log('PASS ' + name); count++;
    } finally { await db.query('ROLLBACK'); }
  }
  try {
    for (const [table,n] of Object.entries({author:5,edition:6,authorship:6,copy:8,reader:6,loan:10})) {
      assert.equal(Number((await db.query('SELECT count(*) n FROM ' + table)).rows[0].n), n);
      console.log('PASS rows ' + table + ': ' + n); count++;
    }
    await rejected('negative ID', "INSERT INTO reader VALUES (-1,'A','B','1')", '23514');
    await rejected('empty phone', "INSERT INTO reader VALUES (90,'A','B','   ')", '23514');
    await rejected('NULL phone', "INSERT INTO reader VALUES (90,'A','B',NULL)", '23502');
    await rejected('nameless author', 'INSERT INTO author(author_id) VALUES(90)', '23514');
    await rejected('duplicate authorship', 'INSERT INTO authorship VALUES(1,1)', '23505');
    await rejected('unknown edition', 'INSERT INTO copy VALUES(990,999)', '23503');
    await rejected('deadline before issue', "INSERT INTO loan VALUES(90,1,202,'2026-10-10','2026-10-09',NULL)", '23514');
    await rejected('return before issue', "INSERT INTO loan VALUES(90,1,202,'2026-10-10','2026-10-20','2026-10-09')", '23514');
    await rejected('second active loan', "INSERT INTO loan VALUES(90,2,101,'2026-10-11','2026-10-25',NULL)", '23514');
    await rejected('historical overlap', "INSERT INTO loan VALUES(90,2,301,'2026-09-12','2026-09-20','2026-09-19')", '23514');
    await rejected('same-day inside old loan', "INSERT INTO loan VALUES(90,2,301,'2026-09-12','2026-09-20','2026-09-12')", '23514');
    await rejected('edition without copy', "INSERT INTO edition(edition_id,title,language) VALUES(90,'Test','uk')", '23514');
    await rejected('author without authorship', "INSERT INTO author(author_id,pen_name) VALUES(90,'Test')", '23514');
    await rejected('last copy removed', 'DELETE FROM copy WHERE inventory_number=202; DELETE FROM copy WHERE inventory_number=201', '23503');
    await rejected('last copy minimum', "INSERT INTO edition(edition_id,title,language) VALUES(90,'Test','uk'); INSERT INTO copy VALUES(990,90); DELETE FROM copy WHERE inventory_number=990", '23514');
    await rejected('last authorship removed', 'DELETE FROM authorship WHERE author_id=1', '23514');
    await rejected('reader history protected', 'DELETE FROM reader WHERE reader_id=1', '23503');
    await db.query('BEGIN');
    await db.query("INSERT INTO loan VALUES(90,2,202,'2026-11-01','2026-11-15','2026-11-01'); INSERT INTO loan VALUES(91,2,202,'2026-11-01','2026-11-15','2026-11-20')");
    await db.query('SET CONSTRAINTS ALL IMMEDIATE');
    await db.query('ROLLBACK');
    console.log('PASS same-day return, reissue and late return'); count++;
    const other = new Client(config); await other.connect();
    try {
      await db.query('BEGIN');
      await db.query("INSERT INTO loan VALUES(90,1,202,'2026-11-01','2026-11-15',NULL)");
      await other.query("SET lock_timeout='300ms'");
      let blocked;
      try { await other.query("INSERT INTO loan VALUES(91,2,202,'2026-11-01','2026-11-15',NULL)"); }
      catch(e) { blocked=e; }
      assert.equal(blocked?.code,'55P03');
      await db.query('ROLLBACK');
      console.log('PASS concurrent issue waits on copy lock'); count++;
    } finally { await db.query('ROLLBACK'); await other.end(); }
    console.log('TOTAL PASS: ' + count);
  } finally { await db.end(); }
})().catch(e => { console.error(e); process.exitCode=1; });
