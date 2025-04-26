const FuncionarioModel = require('../models/funcionarioModel');
const { validationResult } = require('express-validator');

class FuncionarioController {
  static async create(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const funcionario = await FuncionarioModel.create(req.body);
      res.status(201).json(funcionario);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async findAll(req, res) {
    try {
      const funcionarios = await FuncionarioModel.findAll();
      res.json(funcionarios);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async findById(req, res) {
    try {
      const funcionario = await FuncionarioModel.findById(req.params.id);
      if (!funcionario) {
        return res.status(404).json({ error: 'Funcionário não encontrado' });
      }
      res.json(funcionario);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async update(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const funcionario = await FuncionarioModel.update(req.params.id, req.body);
      if (!funcionario) {
        return res.status(404).json({ error: 'Funcionário não encontrado' });
      }
      res.json(funcionario);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async delete(req, res) {
    try {
      const funcionario = await FuncionarioModel.delete(req.params.id);
      if (!funcionario) {
        return res.status(404).json({ error: 'Funcionário não encontrado' });
      }
      res.json({ message: 'Funcionário removido com sucesso' });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async associarProposta(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { funcionarioId, propostaId } = req.params;
      const { dataInicio } = req.body;

      const associacao = await FuncionarioModel.associarProposta(
        funcionarioId, 
        propostaId, 
        dataInicio
      );

      res.json(associacao);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async desassociarProposta(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { funcionarioId, propostaId } = req.params;
      const { dataFim } = req.body;

      const desassociacao = await FuncionarioModel.desassociarProposta(
        funcionarioId, 
        propostaId, 
        dataFim
      );

      res.json(desassociacao);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async listarPropostas(req, res) {
    try {
      const { funcionarioId } = req.params;
      const propostas = await FuncionarioModel.listarPropostas(funcionarioId);
      res.json(propostas);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

module.exports = FuncionarioController; 