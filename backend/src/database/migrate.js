const fs = require('fs').promises;
const path = require('path');
const db = require('../config/database');

async function readSqlFile(filePath) {
  try {
    return await fs.readFile(filePath, 'utf8');
  } catch (error) {
    console.error(`Erro ao ler arquivo SQL ${filePath}:`, error);
    throw error;
  }
}

async function executeSqlDirect(query) {
  try {
    await db.query(query);
  } catch (error) {
    console.error('Erro SQL:', error);
    throw error;
  }
}

async function executeSqlFiles(directory) {
  try {
    const files = await fs.readdir(directory);
    const sortedFiles = files.sort();

    for (const file of sortedFiles) {
      const filePath = path.join(directory, file);
      console.log(`\nExecutando ${file}...`);
      
      const sqlContent = await readSqlFile(filePath);
      await executeSqlDirect(sqlContent);
      
      console.log(`✓ ${file} executado com sucesso`);
    }
  } catch (error) {
    console.error('Erro durante a migração:', error);
    throw error;
  }
}

async function checkTables() {
  try {
    const result = await db.query(`
      SELECT table_schema, table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('users', 'sessions')
    `);

    console.log('\nTabelas no schema public:');
    result.rows.forEach(table => {
      console.log(`- ${table.table_schema}.${table.table_name}`);
    });
  } catch (error) {
    console.error('Erro ao verificar tabelas:', error);
  }
}

async function runMigration() {
  try {
    const action = process.argv[2] === 'down' ? 'down' : 'up';
    console.log(`\nIniciando migração - Ação: ${action}`);

    const migrationsPath = path.join(__dirname, 'migrations', action);
    await executeSqlFiles(migrationsPath);
    
    if (action === 'up') {
      await checkTables();
    }

    console.log('\n✓ Migração concluída com sucesso!');
    process.exit(0);
  } catch (error) {
    console.error('\nErro ao executar migração:', error);
    process.exit(1);
  }
}

runMigration();