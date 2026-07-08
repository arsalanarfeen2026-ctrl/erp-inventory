require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS monthly_demand (
      item_id VARCHAR(20) PRIMARY KEY,
      qty INTEGER NOT NULL DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS stock_opening (
      item_id VARCHAR(20) PRIMARY KEY,
      qty INTEGER NOT NULL DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS stock_receiving (
      id VARCHAR(50) PRIMARY KEY,
      date VARCHAR(20),
      month VARCHAR(10),
      gin VARCHAR(50),
      item_id VARCHAR(20),
      qty INTEGER,
      type VARCHAR(50),
      rate NUMERIC(12,2) DEFAULT 0,
      created_at TIMESTAMP DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS stock_issuance (
      id VARCHAR(50) PRIMARY KEY,
      date VARCHAR(20),
      month VARCHAR(10),
      jc VARCHAR(50),
      item_id VARCHAR(20),
      qty INTEGER,
      type VARCHAR(50),
      created_at TIMESTAMP DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS stock_adjustment (
      id VARCHAR(50) PRIMARY KEY,
      date VARCHAR(20),
      month VARCHAR(10),
      ref VARCHAR(50),
      item_id VARCHAR(20),
      qty INTEGER,
      reason VARCHAR(100),
      created_at TIMESTAMP DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS lead_time (
      item_id VARCHAR(20) PRIMARY KEY,
      days INTEGER NOT NULL DEFAULT 7
    );
    CREATE TABLE IF NOT EXISTS safety_stock (
      item_id VARCHAR(20) PRIMARY KEY,
      qty INTEGER NOT NULL DEFAULT 2
    );
  `);
  console.log('✅ Database tables ready');
}

module.exports = { pool, initDB };
