const CustoObraModel = require('../models/custoObraModel');
const { validationResult } = require('express-validator');

class CustoObraController {
  static async create(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const custoObra = await CustoObraModel.create(req.body);
      res.status(201).json(custoObra);
    } catch (error) {
      console.error('Erro ao criar custo obra:', error);
      res.status(400).json({ error: error.message });
    }
  }

  static async findAll(req, res) {
    try {
      const { campo, valor } = req.query;

      if (!campo || !valor) {
        const custosObra = await CustoObraModel.findAll();
        return res.json(custosObra);
      }

      const camposPermitidos = ['id', 'valor', 'obra', 'duracao', 'created_at'];

      if (!camposPermitidos.includes(campo)) {
        return res.status(400).json({ 
          error: `Campo de busca inválido. Campos permitidos: ${camposPermitidos.join(', ')}`,
          exemplo: 'Use /api/custos-obra?campo=obra&valor=construcao'
        });
      }

      const custosObra = await CustoObraModel.findByField(campo, valor);
      
      if (!custosObra || custosObra.length === 0) {
        return res.status(404).json({ 
          message: 'Nenhum custo obra encontrado com os critérios informados'
        });
      }

      res.json(custosObra);
    } catch (error) {
      console.error('Erro ao listar custos obra:', error);
      res.status(400).json({ error: error.message });
    }
  }

  static async findById(req, res) {
    try {
      const custoObra = await CustoObraModel.findById(req.params.id);
      if (!custoObra) {
        return res.status(404).json({ error: 'Custo obra não encontrado' });
      }
      res.json(custoObra);
    } catch (error) {
      console.error('Erro ao buscar custo obra:', error);
      res.status(400).json({ error: error.message });
    }
  }

  static async update(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const custoObra = await CustoObraModel.update(req.params.id, req.body);
      if (!custoObra) {
        return res.status(404).json({ error: 'Custo obra não encontrado' });
      }
      res.json(custoObra);
    } catch (error) {
      console.error('Erro ao atualizar custo obra:', error);
      res.status(400).json({ error: error.message });
    }
  }

  static async delete(req, res) {
    try {
      const custoObra = await CustoObraModel.delete(req.params.id);
      if (!custoObra) {
        return res.status(404).json({ error: 'Custo obra não encontrado' });
      }
      res.json({ message: 'Custo obra removido com sucesso' });
    } catch (error) {
      console.error('Erro ao deletar custo obra:', error);
      res.status(400).json({ error: error.message });
    }
  }
}

module.exports = CustoObraController; 