require('dotenv').config();

module.exports = {
  development: {
    url: process.env.SUPABASE_URL,
    dialect: 'postgres'
  },
  test: {
    url: process.env.SUPABASE_URL,
    dialect: 'postgres'
  },
  production: {
    url: process.env.SUPABASE_URL,
    dialect: 'postgres'
  }
}; 