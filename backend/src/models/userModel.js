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
}

module.exports = UserModel; 