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

  async logout(token) {
    try {
      // Aqui você pode implementar a lógica para invalidar o token
      // Por exemplo, adicionar o token a uma lista negra
      // Ou remover a sessão do usuário do banco de dados
      return true;
    } catch (error) {
      throw new Error('Erro ao realizar logout');
    }
  }

  static async updateUser(id, updateData) {
    try {
      // Se houver alteração de username, verifica se já existe
      if (updateData.username) {
        const existingUser = await UserModel.findByUsername(updateData.username);
        if (existingUser && existingUser.id !== parseInt(id)) {
          throw new Error('Username já existe');
        }
      }

      // Se houver senha nova, faz o hash
      if (updateData.password) {
        const salt = await bcrypt.genSalt(10);
        updateData.password = await bcrypt.hash(updateData.password, salt);
      }

      const updatedUser = await UserModel.update(id, updateData);
      if (!updatedUser) {
        throw new Error('Usuário não encontrado');
      }

      return updatedUser;
    } catch (error) {
      throw new Error(`Erro ao atualizar usuário: ${error.message}`);
    }
  }
}

module.exports = AuthService; 