const PropostaService = require('../services/propostaService');
const { validationResult } = require('express-validator');

class PropostaController {
  static async create(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const propostaData = {
        ...req.body,
        user_id: req.user.id
      };

      const proposta = await PropostaService.create(propostaData);
      res.status(201).json(proposta);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async search(req, res) {
    try {
      const { field, value } = req.query;
      if (!field || !value) {
        return res.status(400).json({ error: 'Campo de busca e valor são obrigatórios' });
      }

      const propostas = await PropostaService.search(field, value);
      res.json(propostas);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

module.exports = PropostaController; 