const db = require('../config/database');
const bcrypt = require('bcrypt');

class UserModel {
  static async createUser({ username, password, role = 'user' }) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const query = `
      INSERT INTO users (username, password, role, created_at)
      VALUES ($1, $2, $3, NOW())
      RETURNING id, username, role, created_at
    `;
    
    const result = await db.query(query, [username, hashedPassword, role]);
    return result.rows[0];
  }

  static async findByUsername(username) {
    const query = 'SELECT * FROM users WHERE username = $1';
    const result = await db.query(query, [username]);
    return result.rows[0];
  }

  static async createSession(userId, token) {
    const query = `
      INSERT INTO sessions (user_id, token, created_at)
      VALUES ($1, $2, NOW())
      RETURNING id, user_id, token, created_at
    `;
    
    const result = await db.query(query, [userId, token]);
    return result.rows[0];
  }

  static async findSessionByToken(token) {
    const query = 'SELECT * FROM sessions WHERE token = $1';
    const result = await db.query(query, [token]);
    return result.rows[0];
  }

  static async findById(id) {
    const query = 'SELECT * FROM users WHERE id = $1';
    const result = await db.query(query, [id]);
    return result.rows[0];
  }

  static async ensureUpdatedAtExists() {
    try {
      const checkQuery = `
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'updated_at'
      `;
      const result = await db.query(checkQuery);
      
      if (result.rows.length === 0) {
        const alterQuery = `
          ALTER TABLE users 
          ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        `;
        await db.query(alterQuery);
      }
    } catch (error) {
      console.error('Erro ao verificar/criar coluna updated_at:', error);
    }
  }

  static async update(id, data) {
    // Garante que a coluna updated_at existe
    await this.ensureUpdatedAtExists();

    const fields = [];
    const values = [];
    let paramCount = 1;

    // Constrói a query dinamicamente baseada nos campos fornecidos
    Object.keys(data).forEach(key => {
      if (data[key] !== undefined) {
        fields.push(`${key} = $${paramCount}`);
        values.push(data[key]);
        paramCount++;
      }
    });

    if (fields.length === 0) return null;

    values.push(id);
    const query = `
      UPDATE users 
      SET ${fields.join(', ')}, 
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramCount}
      RETURNING id, username, role, created_at, updated_at
    `;

    try {
      const result = await db.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Erro ao atualizar usuário: ${error.message}`);
    }
  }
}

module.exports = UserModel; 