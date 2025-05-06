const FaturamentoModel = require('../models/faturamentoModel');
const { validationResult } = require('express-validator');
const fs = require('fs');
const path = require('path');

class FaturamentoController {
  static async create(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      // Valida se o pedido relacionado existe
      const pedidoExists = await FaturamentoModel.validatePedido(req.body.id_type, req.body.id_number);
      if (!pedidoExists) {
        return res.status(404).json({ message: 'Pedido não encontrado' });
      }

      const faturamento = await FaturamentoModel.create(req.body);
      return res.status(201).json(faturamento);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  static async findById(req, res) {
    try {
      const faturamento = await FaturamentoModel.findById(req.params.id);
      if (!faturamento) {
        return res.status(404).json({ message: 'Faturamento não encontrado' });
      }
      return res.json(faturamento);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  static async findAll(req, res) {
    try {
      const faturamentos = await FaturamentoModel.findAll();
      return res.json(faturamentos);
    } catch (error) {
      return res.status(500).json({ message: error.message });
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
        return res.status(404).json({ message: 'Faturamento não encontrado' });
      }
      return res.json(faturamento);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  static async delete(req, res) {
    try {
      const faturamento = await FaturamentoModel.delete(req.params.id);
      if (!faturamento) {
        return res.status(404).json({ message: 'Faturamento não encontrado' });
      }
      return res.json({ message: 'Faturamento excluído com sucesso' });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }
  
  static async getAnexo(req, res) {
    try {
      const { id } = req.params;
      const faturamento = await FaturamentoModel.findById(id);
      
      if (!faturamento) {
        return res.status(404).json({ message: 'Faturamento não encontrado' });
      }
      
      if (!faturamento.detalhes_pagamento || !faturamento.detalhes_pagamento.anexo_id) {
        return res.status(404).json({ message: 'Anexo não encontrado para este faturamento' });
      }
      
      const anexoFileName = faturamento.detalhes_pagamento.anexo_id;
      const filePath = path.join('uploads', 'anexos', anexoFileName);
      
      // Verifica se o arquivo existe
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ message: 'Arquivo de anexo não encontrado' });
      }
      
      // Envia o arquivo como resposta
      return res.sendFile(path.resolve(filePath));
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  static async findHistorico(req, res) {
    try {
      const { id_number, id_type } = req.query;
      
      // Validação de parâmetros
      if (!id_number || !id_type) {
        return res.status(400).json({ 
          message: 'Os parâmetros id_number e id_type são obrigatórios'
        });
      }
      
      // Converter id_number para número se necessário
      const parsedIdNumber = parseInt(id_number, 10);
      if (isNaN(parsedIdNumber)) {
        return res.status(400).json({ 
          message: 'O parâmetro id_number deve ser um número válido'
        });
      }
      
      // Validar id_type
      const tiposValidos = ['compra', 'locacao', 'servico'];
      if (!tiposValidos.includes(id_type)) {
        return res.status(400).json({ 
          message: 'O parâmetro id_type deve ser um dos seguintes valores: compra, locacao, servico'
        });
      }
      
      const faturamentos = await FaturamentoModel.findHistorico(parsedIdNumber, id_type);
      
      return res.json({
        total: faturamentos.length,
        historico: faturamentos
      });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }
}

module.exports = FaturamentoController; 