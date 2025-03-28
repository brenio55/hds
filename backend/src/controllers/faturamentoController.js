const FaturamentoModel = require('../models/faturamentoModel');
const { validationResult } = require('express-validator');

class FaturamentoController {
  static async create(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const faturamento = await FaturamentoModel.create(req.body);
      res.status(201).json(faturamento);
    } catch (error) {
      console.error('Erro ao criar faturamento:', error);
      res.status(400).json({ error: error.message });
    }
  }

  static async findById(req, res) {
    try {
      const faturamento = await FaturamentoModel.findById(req.params.id);
      if (!faturamento) {
        return res.status(404).json({ error: 'Faturamento não encontrado' });
      }
      res.json(faturamento);
    } catch (error) {
      console.error('Erro ao buscar faturamento:', error);
      res.status(400).json({ error: error.message });
    }
  }

  static async findAll(req, res) {
    try {
      const { campo, valor } = req.query;

      if (campo && valor) {
        const allowedFields = ['id_type', 'id_number', 'data_vencimento', 'nf', 'pagamento'];
        if (!allowedFields.includes(campo)) {
          return res.status(400).json({ 
            error: `Campo de busca inválido. Campos permitidos: ${allowedFields.join(', ')}` 
          });
        }

        const faturamentos = await FaturamentoModel.findByField(campo, valor);
        return res.json(faturamentos);
      }

      const faturamentos = await FaturamentoModel.findAll();
      res.json(faturamentos);
    } catch (error) {
      console.error('Erro ao listar faturamentos:', error);
      res.status(400).json({ error: error.message });
    }
  }

  static async update(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const faturamento = await FaturamentoModel.update(req.params.id, req.body);
      if (!faturamento) {
        return res.status(404).json({ error: 'Faturamento não encontrado' });
      }
      res.json(faturamento);
    } catch (error) {
      console.error('Erro ao atualizar faturamento:', error);
      res.status(400).json({ error: error.message });
    }
  }

  static async delete(req, res) {
    try {
      const faturamento = await FaturamentoModel.delete(req.params.id);
      if (!faturamento) {
        return res.status(404).json({ error: 'Faturamento não encontrado' });
      }
      res.json({ message: 'Faturamento removido com sucesso' });
    } catch (error) {
      console.error('Erro ao deletar faturamento:', error);
      res.status(400).json({ error: error.message });
    }
  }
}

module.exports = FaturamentoController; 