const PedidoCompraModel = require('../models/pedidoCompraModel');
const { validationResult } = require('express-validator');

class PedidoCompraController {
  static async create(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const pedido = await PedidoCompraModel.create(req.body);
      res.status(201).json(pedido);
    } catch (error) {
      console.error('Erro ao criar pedido:', error);
      res.status(400).json({ error: error.message });
    }
  }

  static async findAll(req, res) {
    try {
      const pedidos = await PedidoCompraModel.findAll();
      res.json(pedidos);
    } catch (error) {
      console.error('Erro ao listar pedidos:', error);
      res.status(400).json({ error: error.message });
    }
  }

  static async findById(req, res) {
    try {
      const pedido = await PedidoCompraModel.findById(req.params.id);
      if (!pedido) {
        return res.status(404).json({ error: 'Pedido não encontrado' });
      }
      res.json(pedido);
    } catch (error) {
      console.error('Erro ao buscar pedido:', error);
      res.status(400).json({ error: error.message });
    }
  }

  static async update(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const pedido = await PedidoCompraModel.update(req.params.id, req.body);
      if (!pedido) {
        return res.status(404).json({ error: 'Pedido não encontrado' });
      }
      res.json(pedido);
    } catch (error) {
      console.error('Erro ao atualizar pedido:', error);
      res.status(400).json({ error: error.message });
    }
  }
}

module.exports = PedidoCompraController; 