require('dotenv').config();
const { Pool } = require('pg');

const url = process.env.DATABASE_URL || '';
const isLocal = !url || url.includes('localhost') || url.includes('127.0.0.1');

module.exports = new Pool({
  connectionString: url,
  ssl: isLocal ? false : { rejectUnauthorized: false },
});