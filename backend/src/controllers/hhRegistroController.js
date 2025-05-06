const HHRegistroModel = require('../models/hhRegistroModel');
const { validationResult } = require('express-validator');

class HHRegistroController {
  static async create(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const registro = await HHRegistroModel.create(req.body);
      res.status(201).json(registro);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async findAll(req, res) {
    try {
      // Extrair filtros da query string
      const filtros = {
        funcionario_id: req.query.funcionario_id,
        obra_id: req.query.obra_id,
        data_inicio: req.query.data_inicio,
        data_fim: req.query.data_fim
      };
      
      const registros = await HHRegistroModel.findAll(filtros);
      res.json(registros);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async findById(req, res) {
    try {
      const registro = await HHRegistroModel.findById(req.params.id);
      if (!registro) {
        return res.status(404).json({ error: 'Registro não encontrado' });
      }
      res.json(registro);
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

      const registro = await HHRegistroModel.update(req.params.id, req.body);
      if (!registro) {
        return res.status(404).json({ error: 'Registro não encontrado' });
      }
      res.json(registro);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async delete(req, res) {
    try {
      const registro = await HHRegistroModel.delete(req.params.id);
      if (!registro) {
        return res.status(404).json({ error: 'Registro não encontrado' });
      }
      res.json({ message: 'Registro removido com sucesso' });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async gerarRelatorioPorObra(req, res) {
    try {
      const obra_id = req.params.obra_id;
      
      // Validar que obra_id é um número
      if (isNaN(obra_id) || parseInt(obra_id) <= 0) {
        return res.status(400).json({ error: 'ID da obra inválido' });
      }
      
      // Extrair filtros de período da query string
      const periodo = {
        data_inicio: req.query.data_inicio,
        data_fim: req.query.data_fim
      };
      
      const relatorio = await HHRegistroModel.gerarRelatorioPorObra(obra_id, periodo);
      res.json(relatorio);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

module.exports = HHRegistroController; 