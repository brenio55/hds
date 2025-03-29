const ReembolsoModel = require('../models/reembolsoModel');
const { validationResult } = require('express-validator');

class ReembolsoController {
  static async create(req, res) {
    try {
      console.log('Recebendo requisição para criar reembolso');
      
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.error('Erros de validação:', errors.array());
        return res.status(400).json({ errors: errors.array() });
      }

      // Log dos campos recebidos para depuração
      console.log('Campos recebidos:', Object.keys(req.body));
      
      // Preparar dados para o modelo
      const dadosReembolso = {
        id_funcionarios: req.body.id_funcionarios,
        valor: req.body.valor,
        prazo: req.body.prazo,
        descricao: req.body.descricao,
        comprovante: req.body.comprovante,
        centro_custo_id: req.body.centro_custo_id
      };

      console.log('Dados preparados para criação:', {
        id_funcionarios: dadosReembolso.id_funcionarios,
        valor: dadosReembolso.valor,
        prazo: dadosReembolso.prazo,
        descricao_length: dadosReembolso.descricao ? dadosReembolso.descricao.length : 0,
        has_comprovante: !!dadosReembolso.comprovante,
        centro_custo_id: dadosReembolso.centro_custo_id
      });

      const reembolso = await ReembolsoModel.create(dadosReembolso);
      console.log('Reembolso criado com sucesso, ID:', reembolso.id);
      
      res.status(201).json(reembolso);
    } catch (error) {
      console.error('Erro ao criar reembolso:', error);
      res.status(400).json({ error: error.message });
    }
  }

  static async update(req, res) {
    try {
      console.log(`Recebendo requisição para atualizar reembolso ID ${req.params.id}`);
      
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.error('Erros de validação:', errors.array());
        return res.status(400).json({ errors: errors.array() });
      }

      // Log dos campos recebidos para depuração
      console.log('Campos recebidos para atualização:', Object.keys(req.body));
      
      // Preparar dados para o modelo
      const dadosReembolso = {
        id_funcionarios: req.body.id_funcionarios,
        valor: req.body.valor,
        prazo: req.body.prazo,
        descricao: req.body.descricao,
        comprovante: req.body.comprovante,
        centro_custo_id: req.body.centro_custo_id
      };

      console.log('Dados preparados para atualização:', {
        id_funcionarios: dadosReembolso.id_funcionarios,
        valor: dadosReembolso.valor,
        prazo: dadosReembolso.prazo,
        descricao_length: dadosReembolso.descricao ? dadosReembolso.descricao.length : 0,
        has_comprovante: !!dadosReembolso.comprovante,
        centro_custo_id: dadosReembolso.centro_custo_id
      });

      const reembolso = await ReembolsoModel.update(req.params.id, dadosReembolso);
      if (!reembolso) {
        console.error(`Reembolso ID ${req.params.id} não encontrado`);
        return res.status(404).json({ error: 'Reembolso não encontrado' });
      }
      
      console.log(`Reembolso ID ${req.params.id} atualizado com sucesso`);
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
        'created_at',
        'centro_custo_id'  // Adicionado novo campo permitido para busca
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