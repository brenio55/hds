const AuthService = require('../services/authService');
const { validationResult } = require('express-validator');
const UserModel = require('../models/userModel');

class AuthController {
  static async register(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { username, password, role } = req.body;
      const user = await AuthService.register({ username, password, role });
      res.status(201).json(user);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async login(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { username, password } = req.body;
      const result = await AuthService.login({ username, password });
      res.json(result);
    } catch (error) {
      res.status(401).json({ error: error.message });
    }
  }

  static async logout(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { token } = req.body;
      await AuthService.logout(token);
      res.json({ message: 'Logout realizado com sucesso' });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async getProfile(req, res) {
    try {
      // O usuário já está disponível através do middleware de autenticação
      const user = req.user;

      // Busca informações adicionais do usuário se necessário
      const userDetails = await UserModel.findById(user.id);
      
      // Remove a senha antes de enviar
      const { password, ...userWithoutPassword } = userDetails;

      res.json(userWithoutPassword);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async updateUser(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      // Verifica se o usuário tem permissão (admin ou dono da conta)
      if (req.user.role !== 'admin' && req.user.id !== parseInt(id)) {
        return res.status(403).json({ 
          error: 'Sem permissão para atualizar este usuário' 
        });
      }

      // Remove campos não permitidos
      const allowedFields = ['username', 'password', 'role'];
      Object.keys(updateData).forEach(key => {
        if (!allowedFields.includes(key)) {
          delete updateData[key];
        }
      });

      // Apenas admin pode alterar role
      if (req.user.role !== 'admin') {
        delete updateData.role;
      }

      const updatedUser = await AuthService.updateUser(id, updateData);
      
      // Remove a senha do retorno
      const { password, ...userWithoutPassword } = updatedUser;
      
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

module.exports = AuthController; 