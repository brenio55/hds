const { queryBuilder } = require('../config/database');
const bcrypt = require('bcrypt');

class UserModel {
  static async createUser({ username, password, role = 'user' }) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const query = `
      INSERT INTO users (username, password, role, created_at)
      VALUES ($1, $2, $3, NOW())
      RETURNING id, username, role, created_at
    `;
    const values = [username, hashedPassword, role];
    const result = await queryBuilder.query(query, values);
    return result.rows[0];
  }

  static async findByUsername(username) {
    const result = await queryBuilder.queryByJson('users', { username });
    return result.rows[0];
  }

  static async createSession(userId, token) {
    const query = `
      INSERT INTO sessions (user_id, token, created_at)
      VALUES ($1, $2, NOW())
      RETURNING id, user_id, created_at
    `;
    const values = [userId, token];
    const result = await queryBuilder.query(query, values);
    return result.rows[0];
  }
}

module.exports = UserModel; 