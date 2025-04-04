const PropostaModel = require('../models/propostaModel');
const PdfService = require('./pdfService');
const fs = require('fs').promises;
const path = require('path');

class PropostaService {
  static async create(propostaData) {
    try {
      // Cria a proposta
      const proposta = await PropostaModel.create(propostaData);

      // Gera o PDF
      const pdfUid = await PdfService.generatePdf(proposta);

      // Atualiza a proposta com o UID do PDF
      const propostaAtualizada = await PropostaModel.updatePdfVersion(
        proposta.id,
        proposta.versao,
        pdfUid
      );

      return propostaAtualizada;
    } catch (error) {
      throw new Error('Erro ao criar proposta: ' + error.message);
    }
  }

  static async search(field, value) {
    try {
      const allowedFields = [
        'id', 'descricao', 'client_info', 'documento_text',
        'especificacoes_html', 'valor_final'
      ];

      if (!allowedFields.includes(field)) {
        throw new Error('Campo de busca inválido');
      }

      return await PropostaModel.findByField(field, value);
    } catch (error) {
      throw new Error('Erro ao buscar propostas: ' + error.message);
    }
  }

  static async generatePdf(id) {
    try {
      // Busca a proposta
      const proposta = await PropostaModel.findById(id);
      if (!proposta) {
        throw new Error('Proposta não encontrada');
      }

      // Garante que o diretório de uploads existe
      const uploadsDir = path.join(__dirname, '../../uploads/pdfs');
      try {
        await fs.access(uploadsDir);
      } catch {
        await fs.mkdir(uploadsDir, { recursive: true });
      }

      // Gera o PDF
      const pdfUid = await PdfService.generatePdf(proposta);

      // Atualiza a proposta com o novo PDF
      const propostaAtualizada = await PropostaModel.updatePdfVersion(
        proposta.id,
        proposta.versao,
        pdfUid
      );

      return {
        message: 'PDF gerado com sucesso',
        pdf_uid: pdfUid,
        proposta: propostaAtualizada
      };
    } catch (error) {
      throw new Error('Erro ao gerar PDF: ' + error.message);
    }
  }

  static async searchByParams(params) {
    try {
      return await PropostaModel.findByParams(params);
    } catch (error) {
      throw new Error('Erro ao buscar propostas: ' + error.message);
    }
  }
}

module.exports = PropostaService; 