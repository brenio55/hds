const FornecedorModel = require('../models/fornecedorModel');
const { validationResult } = require('express-validator');

class FornecedorController {
  static async create(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const fornecedor = await FornecedorModel.create(req.body);
      res.status(201).json(fornecedor);
    } catch (error) {
      console.error('Erro ao criar fornecedor:', error);
      res.status(400).json({ error: error.message });
    }
  }

  static async findAll(req, res) {
    try {
      const fornecedores = await FornecedorModel.findAll();
      res.json(fornecedores);
    } catch (error) {
      console.error('Erro ao listar fornecedores:', error);
      res.status(400).json({ error: error.message });
    }
  }

  static async findById(req, res) {
    try {
      const fornecedor = await FornecedorModel.findById(req.params.id);
      if (!fornecedor) {
        return res.status(404).json({ error: 'Fornecedor não encontrado' });
      }
      res.json(fornecedor);
    } catch (error) {
      console.error('Erro ao buscar fornecedor:', error);
      res.status(400).json({ error: error.message });
    }
  }

  static async update(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const fornecedor = await FornecedorModel.update(req.params.id, req.body);
      if (!fornecedor) {
        return res.status(404).json({ error: 'Fornecedor não encontrado' });
      }
      res.json(fornecedor);
    } catch (error) {
      console.error('Erro ao atualizar fornecedor:', error);
      res.status(400).json({ error: error.message });
    }
  }
}

module.exports = FornecedorController; 