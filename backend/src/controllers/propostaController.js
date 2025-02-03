const PropostaService = require('../services/propostaService');
const { validationResult } = require('express-validator');
const PropostaModel = require('../models/propostaModel');
const path = require('path');
const fs = require('fs');

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
      const { version } = req.query;
      
      // Busca a proposta
      const proposta = await PropostaModel.findById(id);
      if (!proposta) {
        return res.status(404).json({ error: 'Proposta não encontrada' });
      }

      // Verifica se existe PDF para a versão
      const pdfVersions = proposta.pdf_versions || {};
      const pdfUid = version ? pdfVersions[version] : pdfVersions[proposta.versao];

      if (!pdfUid) {
        return res.status(404).json({ error: 'PDF não encontrado' });
      }

      // Caminho do arquivo
      const pdfPath = path.join(__dirname, `../../uploads/pdfs/${pdfUid}.pdf`);

      // Verifica se o arquivo existe
      try {
        await fs.access(pdfPath);
      } catch {
        return res.status(404).json({ error: 'Arquivo PDF não encontrado' });
      }

      // Envia o arquivo
      res.download(pdfPath, `proposta-${id}-v${version || proposta.versao}.pdf`);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

module.exports = PropostaController; 