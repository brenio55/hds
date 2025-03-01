const DividaModel = require('../models/dividaModel');
const { validationResult } = require('express-validator');

class DividaController {
  static async create(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const divida = await DividaModel.create(req.body);
      res.status(201).json(divida);
    } catch (error) {
      console.error('Erro ao criar dívida:', error);
      res.status(400).json({ error: error.message });
    }
  }

  static async update(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const divida = await DividaModel.update(req.params.id, req.body);
      if (!divida) {
        return res.status(404).json({ error: 'Dívida não encontrada' });
      }
      res.json(divida);
    } catch (error) {
      console.error('Erro ao atualizar dívida:', error);
      res.status(400).json({ error: error.message });
    }
  }

  static async findAll(req, res) {
    try {
      const { campo, valor } = req.query;

      if (!campo || !valor) {
        const dividas = await DividaModel.findAll();
        return res.json(dividas);
      }

      const camposPermitidos = ['id', 'valor', 'detalhes', 'created_at'];

      if (!camposPermitidos.includes(campo)) {
        return res.status(400).json({ 
          error: `Campo de busca inválido. Campos permitidos: ${camposPermitidos.join(', ')}`,
          exemplo: 'Use /api/dividas?campo=valor&valor=1000.00'
        });
      }

      const dividas = await DividaModel.findByField(campo, valor);
      
      if (!dividas || dividas.length === 0) {
        return res.status(404).json({ 
          message: 'Nenhuma dívida encontrada com os critérios informados'
        });
      }

      res.json(dividas);
    } catch (error) {
      console.error('Erro ao listar dívidas:', error);
      res.status(400).json({ error: error.message });
    }
  }
}

module.exports = DividaController; 