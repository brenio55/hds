const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const UserModel = require('../models/userModel');

class AuthService {
  static async register({ username, password, role }) {
    const existingUser = await UserModel.findByUsername(username);
    if (existingUser) {
      throw new Error('Username já existe');
    }

    const user = await UserModel.createUser({ username, password, role });
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    await UserModel.createSession(user.id, token);

    return {
      user: {
        id: user.id,
        username: user.username,
        role: user.role
      },
      token
    };
  }

  static async login({ username, password }) {
    const user = await UserModel.findByUsername(username);
    if (!user) {
      throw new Error('Credenciais inválidas');
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new Error('Credenciais inválidas');
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    await UserModel.createSession(user.id, token);

    return {
      user: {
        id: user.id,
        username: user.username,
        role: user.role
      },
      token
    };
  }
}

module.exports = AuthService; 