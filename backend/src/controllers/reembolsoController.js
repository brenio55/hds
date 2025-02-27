const ReembolsoModel = require('../models/reembolsoModel');
const { validationResult } = require('express-validator');

class ReembolsoController {
  static async create(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const reembolso = await ReembolsoModel.create(req.body);
      res.status(201).json(reembolso);
    } catch (error) {
      console.error('Erro ao criar reembolso:', error);
      res.status(400).json({ error: error.message });
    }
  }

  static async update(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const reembolso = await ReembolsoModel.update(req.params.id, req.body);
      if (!reembolso) {
        return res.status(404).json({ error: 'Reembolso não encontrado' });
      }
      res.json(reembolso);
    } catch (error) {
      console.error('Erro ao atualizar reembolso:', error);
      res.status(400).json({ error: error.message });
    }
  }

  static async findAll(req, res) {
    try {
      const { campo, valor } = req.query;

      // Se não houver parâmetros de busca, retorna todos os reembolsos
      if (!campo || !valor) {
        const reembolsos = await ReembolsoModel.findAll();
        return res.json(reembolsos);
      }

      // Validar campos permitidos para busca
      const camposPermitidos = [
        'id',
        'id_funcionarios',
        'valor',
        'prazo',
        'descricao',
        'created_at'
      ];

      if (!camposPermitidos.includes(campo)) {
        return res.status(400).json({ 
          error: `Campo de busca inválido. Campos permitidos: ${camposPermitidos.join(', ')}`,
          exemplo: 'Use /api/reembolso?campo=id&valor=1'
        });
      }

      // Busca reembolsos com o filtro
      const reembolsos = await ReembolsoModel.findByField(campo, valor);
      
      if (!reembolsos || reembolsos.length === 0) {
        return res.status(404).json({ 
          message: 'Nenhum reembolso encontrado com os critérios informados',
          exemplo: 'Tente outro valor ou verifique se o campo está correto'
        });
      }

      res.json(reembolsos);
    } catch (error) {
      console.error('Erro ao listar reembolsos:', error);
      res.status(400).json({ error: error.message });
    }
  }
}

module.exports = ReembolsoController; 