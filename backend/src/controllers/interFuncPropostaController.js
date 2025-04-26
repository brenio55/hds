const InterFuncPropostaModel = require('../models/InterFuncPropostaModel');
const { validationResult } = require('express-validator');

class InterFuncPropostaController {
  static async getFuncionariosByProposta(req, res) {
    try {
      const { propostaId } = req.params;
      const funcionarios = await InterFuncPropostaModel.getFuncionariosByProposta(propostaId);
      res.json(funcionarios);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async getPropostasByFuncionario(req, res) {
    try {
      const { funcionarioId } = req.params;
      const propostas = await InterFuncPropostaModel.getPropostasByFuncionario(funcionarioId);
      res.json(propostas);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async findAll(req, res) {
    try {
      const filtros = {
        funcionario_id: req.query.funcionario_id,
        proposta_id: req.query.proposta_id
      };
      
      const relacoes = await InterFuncPropostaModel.findAll(filtros);
      res.json(relacoes);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async findByIds(req, res) {
    try {
      const { funcionarioId, propostaId } = req.params;
      const relacao = await InterFuncPropostaModel.findByIds(funcionarioId, propostaId);
      
      if (!relacao) {
        return res.status(404).json({ error: 'Relação não encontrada' });
      }
      
      res.json(relacao);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async create(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      
      const relacao = await InterFuncPropostaModel.create(req.body);
      res.status(201).json(relacao);
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
      
      const { id } = req.params;
      const relacao = await InterFuncPropostaModel.update(id, req.body);
      
      if (!relacao) {
        return res.status(404).json({ error: 'Relação não encontrada' });
      }
      
      res.json(relacao);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async delete(req, res) {
    try {
      const { id } = req.params;
      const relacao = await InterFuncPropostaModel.delete(id);
      
      if (!relacao) {
        return res.status(404).json({ error: 'Relação não encontrada' });
      }
      
      res.json({ message: 'Relação removida com sucesso' });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

module.exports = InterFuncPropostaController; 