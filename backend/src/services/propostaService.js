const PropostaModel = require('../models/propostaModel');
const PdfService = require('./pdfService');
const fs = require('fs').promises;
const path = require('path');

class PropostaService {
  static async create(propostaData) {
    try {
      // Processar proposta_itens se existir
      if (propostaData.proposta_itens) {
        // Garantir que seja um array
        if (!Array.isArray(propostaData.proposta_itens)) {
          propostaData.proposta_itens = [];
        }
        
        // Recalcular valores totais se necessário
        propostaData.proposta_itens = propostaData.proposta_itens.map(item => {
          // Se valor_total não estiver definido, calcular a partir do valor unitário * quantidade
          if (!item.valor_total && item.valor_unitario && item.qtdUnidades) {
            const valorUnitario = parseFloat(item.valor_unitario) || 0;
            const quantidade = parseFloat(item.qtdUnidades) || 0;
            item.valor_total = valorUnitario * quantidade;
          }
          return item;
        });
      }

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
        'especificacoes_html', 'valor_final', 'proposta_itens'
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
      // Suporte para busca em proposta_itens
      const transformedParams = { ...params };
      
      // Verificar se estamos buscando por algum campo dentro dos itens
      for (const key of Object.keys(params)) {
        // Se a busca é por um campo dentro de um item específico, formatar corretamente
        if (key.startsWith('item.')) {
          const itemField = key.replace('item.', '');
          transformedParams[`proposta_itens.${itemField}`] = params[key];
          delete transformedParams[key]; // Remove o parâmetro original
        }
      }
      
      return await PropostaModel.findByParams(transformedParams);
    } catch (error) {
      throw new Error('Erro ao buscar propostas: ' + error.message);
    }
  }
  
  static async update(id, propostaData) {
    try {
      // Processar proposta_itens se existir
      if (propostaData.proposta_itens) {
        // Garantir que seja um array
        if (!Array.isArray(propostaData.proposta_itens)) {
          propostaData.proposta_itens = [];
        }
        
        // Recalcular valores totais se necessário
        propostaData.proposta_itens = propostaData.proposta_itens.map(item => {
          // Se valor_total não estiver definido, calcular a partir do valor unitário * quantidade
          if (!item.valor_total && item.valor_unitario && item.qtdUnidades) {
            const valorUnitario = parseFloat(item.valor_unitario) || 0;
            const quantidade = parseFloat(item.qtdUnidades) || 0;
            item.valor_total = valorUnitario * quantidade;
          }
          return item;
        });
      }
      
      // Atualiza a proposta
      const proposta = await PropostaModel.update(id, propostaData);
      if (!proposta) {
        throw new Error('Proposta não encontrada');
      }
      
      return proposta;
    } catch (error) {
      throw new Error('Erro ao atualizar proposta: ' + error.message);
    }
  }
}

module.exports = PropostaService; 