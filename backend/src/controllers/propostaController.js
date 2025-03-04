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
}

module.exports = PropostaController; 