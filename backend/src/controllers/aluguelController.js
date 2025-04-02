const AluguelModel = require('../models/aluguelModel');
const { validationResult } = require('express-validator');

class AluguelController {
  static async create(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const aluguel = await AluguelModel.create(req.body);
      res.status(201).json(aluguel);
    } catch (error) {
      console.error('Erro ao criar aluguel:', error);
      res.status(400).json({ error: error.message });
    }
  }

  static async findAll(req, res) {
    try {
      const { campo, valor, data_inicial } = req.query;

      // Se houver parâmetros de busca, usa o método de busca com filtros
      if (campo || valor || data_inicial) {
        // Validar campos permitidos
        const camposPermitidos = [
          'id',
          'valor',
          'obra_id',
          'dia_vencimento',
          'pagamento',
          'observacoes'
        ];

        if (campo && !camposPermitidos.includes(campo)) {
          return res.status(400).json({
            error: `Campo de busca inválido. Campos permitidos: ${camposPermitidos.join(', ')}`,
            exemplo: 'Use /api/alugueis?campo=obra_id&valor=1 ou /api/alugueis?data_inicial=2024-01-01'
          });
        }

        // Se tiver campo mas não tiver valor, ou vice-versa
        if ((campo && !valor) || (!campo && valor)) {
          return res.status(400).json({
            error: 'Para realizar uma busca, informe tanto o campo quanto o valor',
            exemplo: 'Use /api/alugueis?campo=obra_id&valor=1'
          });
        }

        // Validar formato da data inicial
        if (data_inicial && !/^\d{4}-\d{2}-\d{2}$/.test(data_inicial)) {
          return res.status(400).json({
            error: 'Formato de data inválido. Use o formato YYYY-MM-DD',
            exemplo: 'Use /api/alugueis?data_inicial=2024-01-01'
          });
        }

        const alugueis = await AluguelModel.findByParams({
          campo,
          valor,
          data_inicial
        });

        return res.json(alugueis);
      }

      // Se não houver parâmetros, retorna todos os aluguéis
      const alugueis = await AluguelModel.findAll();
      res.json(alugueis);
    } catch (error) {
      console.error('Erro ao listar aluguéis:', error);
      res.status(400).json({ error: error.message });
    }
  }

  static async findById(req, res) {
    try {
      const aluguel = await AluguelModel.findById(req.params.id);
      if (!aluguel) {
        return res.status(404).json({ error: 'Aluguel não encontrado' });
      }
      res.json(aluguel);
    } catch (error) {
      console.error('Erro ao buscar aluguel:', error);
      res.status(400).json({ error: error.message });
    }
  }

  static async update(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const aluguel = await AluguelModel.update(req.params.id, req.body);
      if (!aluguel) {
        return res.status(404).json({ error: 'Aluguel não encontrado' });
      }
      res.json(aluguel);
    } catch (error) {
      console.error('Erro ao atualizar aluguel:', error);
      res.status(400).json({ error: error.message });
    }
  }

  static async delete(req, res) {
    try {
      const aluguel = await AluguelModel.delete(req.params.id);
      if (!aluguel) {
        return res.status(404).json({ error: 'Aluguel não encontrado' });
      }
      res.json({ message: 'Aluguel removido com sucesso' });
    } catch (error) {
      console.error('Erro ao deletar aluguel:', error);
      res.status(400).json({ error: error.message });
    }
  }
}

module.exports = AluguelController; 