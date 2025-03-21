const ServicoModel = require('../models/servicoModel');
const { validationResult } = require('express-validator');

class ServicoController {
  static async create(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const servico = await ServicoModel.create(req.body);
      res.status(201).json(servico);
    } catch (error) {
      console.error('Erro ao criar serviço:', error);
      res.status(400).json({ error: error.message });
    }
  }

  static async findById(req, res) {
    try {
      const servico = await ServicoModel.findById(req.params.id);
      if (!servico) {
        return res.status(404).json({ error: 'Serviço não encontrado' });
      }
      res.json(servico);
    } catch (error) {
      console.error('Erro ao buscar serviço:', error);
      res.status(400).json({ error: error.message });
    }
  }

  static async findAll(req, res) {
    try {
      const { campo, valor } = req.query;

      if (campo && valor) {
        const servicos = await ServicoModel.findByField(campo, valor);
        return res.json(servicos);
      }

      const servicos = await ServicoModel.findAll();
      res.json(servicos);
    } catch (error) {
      console.error('Erro ao listar serviços:', error);
      res.status(400).json({ error: error.message });
    }
  }

  static async update(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const servico = await ServicoModel.update(req.params.id, req.body);
      if (!servico) {
        return res.status(404).json({ error: 'Serviço não encontrado' });
      }
      res.json(servico);
    } catch (error) {
      console.error('Erro ao atualizar serviço:', error);
      res.status(400).json({ error: error.message });
    }
  }

  static async delete(req, res) {
    try {
      const servico = await ServicoModel.delete(req.params.id);
      if (!servico) {
        return res.status(404).json({ error: 'Serviço não encontrado' });
      }
      res.json({ message: 'Serviço removido com sucesso' });
    } catch (error) {
      console.error('Erro ao deletar serviço:', error);
      res.status(400).json({ error: error.message });
    }
  }
}

module.exports = ServicoController; 