const PropostaService = require('../services/propostaService');
const { validationResult } = require('express-validator');
const PropostaModel = require('../models/propostaModel');
const path = require('path');
const fs = require('fs').promises;

class PropostaController {
  static async create(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      // Validar que o array de itens está na formato correto
      if (req.body.proposta_itens && typeof req.body.proposta_itens === 'string') {
        try {
          req.body.proposta_itens = JSON.parse(req.body.proposta_itens);
        } catch (e) {
          return res.status(400).json({ 
            error: 'O campo proposta_itens deve ser um array JSON válido' 
          });
        }
      }

      // Calcular automaticamente o valor_final se não fornecido ou for zero, mas existirem itens
      if ((req.body.valor_final === 0 || !req.body.valor_final) && 
          req.body.proposta_itens && 
          Array.isArray(req.body.proposta_itens) && 
          req.body.proposta_itens.length > 0) {
        req.body.valor_final = req.body.proposta_itens.reduce((total, item) => {
          return total + (parseFloat(item.valor_total) || 0);
        }, 0);
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
      const queryParams = req.query;
      
      // Se não houver parâmetros, retorna todas as propostas
      if (Object.keys(queryParams).length === 0) {
        const propostas = await PropostaModel.findAll();
        return res.json({
          total: propostas.length,
          propostas
        });
      }

      const propostas = await PropostaService.searchByParams(queryParams);
      res.json({
        total: propostas.length,
        propostas
      });
    } catch (error) {
      console.error('Erro na busca:', error);
      res.status(400).json({ error: error.message });
    }
  }

  static async generatePdf(req, res) {
    try {
      const { id } = req.params;
      
      if (!id) {
        return res.status(400).json({ error: 'ID da proposta é obrigatório' });
      }

      const result = await PropostaService.generatePdf(id);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async downloadPdf(req, res) {
    try {
      const { id } = req.params;

      // Busca ou gera o PDF
      const result = await PropostaService.generatePdf(id);
      
      if (!result || !result.pdf_uid) {
        return res.status(404).json({ error: 'PDF não encontrado' });
      }

      // Constrói o caminho do arquivo
      const pdfPath = path.join(__dirname, `../../uploads/pdfs/${result.pdf_uid}.pdf`);

      try {
        // Verifica se o arquivo existe
        await fs.access(pdfPath);
        
        // Lê e envia o arquivo
        const fileBuffer = await fs.readFile(pdfPath);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=proposta-${id}.pdf`);
        res.send(fileBuffer);
      } catch (error) {
        console.error('Erro ao acessar arquivo:', error);
        res.status(404).json({ error: 'Arquivo PDF não encontrado' });
      }
    } catch (error) {
      console.error('Erro ao baixar PDF:', error);
      res.status(500).json({ error: error.message });
    }
  }

  static async update(req, res) {
    try {
      const { id } = req.params;
      const errors = validationResult(req);
      
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      // Garantir que proposta_itens seja um array válido
      if (req.body.proposta_itens && typeof req.body.proposta_itens === 'string') {
        try {
          req.body.proposta_itens = JSON.parse(req.body.proposta_itens);
        } catch (e) {
          return res.status(400).json({ 
            error: 'O campo proposta_itens deve ser um array JSON válido' 
          });
        }
      }

      // Calcular automaticamente o valor_final se não fornecido ou for zero, mas existirem itens
      if ((req.body.valor_final === 0 || !req.body.valor_final) && 
          req.body.proposta_itens && 
          Array.isArray(req.body.proposta_itens) && 
          req.body.proposta_itens.length > 0) {
        req.body.valor_final = req.body.proposta_itens.reduce((total, item) => {
          return total + (parseFloat(item.valor_total) || 0);
        }, 0);
      }

      const proposta = await PropostaModel.update(id, req.body);
      
      if (!proposta) {
        return res.status(404).json({ error: 'Proposta não encontrada' });
      }
      
      res.json(proposta);
    } catch (error) {
      console.error('Erro ao atualizar proposta:', error);
      res.status(400).json({ error: error.message });
    }
  }
}

module.exports = PropostaController; 