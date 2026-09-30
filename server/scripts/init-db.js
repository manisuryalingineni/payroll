require('dotenv').config();
const fs = require('fs');
const path = require('path');
const pool = require('../src/config/db');

(async () => {
  try {
    const file = path.join(__dirname, '..', 'src', 'schema.sql');
    await pool.query(fs.readFileSync(file, 'utf8'));
    console.log('Schema applied');
  } catch (err) {
    console.error('Init failed:', err.code || '', err.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
})();