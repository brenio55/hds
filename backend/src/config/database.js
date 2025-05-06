const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.SUPABASE_DB_URL
});

// Adicionar log para verificar se a conexão está estabelecida
pool.on('connect', () => {
  console.log('Conexão com banco de dados PostgreSQL estabelecida');
});

pool.on('error', (err) => {
  console.error('Erro na conexão com o PostgreSQL:', err);
  console.error('Detalhes do erro:', err.message);
  console.error('Código do erro:', err.code);
});

module.exports = {
  query: async (text, params) => {
    try {
      const start = Date.now();
      const res = await pool.query(text, params);
      const duration = Date.now() - start;
      
      if (duration > 1000) {
        console.log(`Query lenta [${duration}ms]: ${text}`);
      }
      
      return res;
    } catch (error) {
      console.error('Erro ao executar query:', error.message);
      console.error('Query SQL com problema:', text);
      console.error('Parâmetros da query:', params);
      throw error;
    }
  },
  getClient: async () => {
    const client = await pool.connect();
    const originalRelease = client.release;
    
    // Sobrescreve o método release para adicionar logs
    client.release = () => {
      originalRelease.call(client);
    };
    
    return client;
  },
  pool
};