const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// Função utilitária para consultas dinâmicas
const queryBuilder = {
  async query(text, params) {
    const start = Date.now();
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text, duration, rows: res.rowCount });
    return res;
  },

  // Função para construir consultas dinâmicas baseadas em JSON
  async queryByJson(table, jsonFilter) {
    let query = `SELECT * FROM ${table}`;
    const values = [];
    const conditions = [];

    if (Object.keys(jsonFilter).length > 0) {
      let paramCount = 1;
      for (const [key, value] of Object.entries(jsonFilter)) {
        conditions.push(`${key} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
      query += ` WHERE ${conditions.join(' AND ')}`;
    }

    return this.query(query, values);
  }
};

module.exports = { pool, queryBuilder }; 