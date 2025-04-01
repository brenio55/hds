const PedidoLocacaoModel = require('../models/pedidoLocacaoModel');
const PedidoLocacaoPdfService = require('../services/pedidoLocacaoPdfService');
const { validationResult } = require('express-validator');
const path = require('path');
const fs = require('fs').promises;
const db = require('../config/database');

class PedidoLocacaoController {
  static async create(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      console.log('Dados recebidos no controller:', req.body);

      // Garantir que itens seja um JSON string válido
      let data = { ...req.body };
      
      if (data.itens) {
        try {
          // Se itens já é uma string, tentar fazer parse para validar
          if (typeof data.itens === 'string') {
            JSON.parse(data.itens); // Apenas para validação
          } else {
            // Se não é string, converter para string JSON
            data.itens = JSON.stringify(data.itens);
          }
        } catch (e) {
          console.error('Erro ao processar itens:', e);
          return res.status(400).json({ error: 'Formato inválido para o campo itens' });
        }
      }

      console.log('Dados processados para criação:', data);

      const pedido = await PedidoLocacaoModel.create(data);
      console.log('Pedido criado:', pedido);
      
      try {
        // Gera o PDF
        console.log('Gerando PDF para o pedido:', pedido.id);
        const pdfUid = await PedidoLocacaoPdfService.generatePdf(pedido);
        console.log('PDF gerado com sucesso. UID:', pdfUid);
        
        await PedidoLocacaoModel.updatePdfUid(pedido.id, pdfUid);
        pedido.pdf_uid = pdfUid;
      } catch (pdfError) {
        console.error('Erro ao gerar PDF:', pdfError);
        // Não falhar a criação do pedido se o PDF falhar
        pedido.pdf_error = pdfError.message;
      }

      res.status(201).json(pedido);
    } catch (error) {
      console.error('Erro ao criar pedido:', error);
      res.status(400).json({ error: error.message });
    }
  }

  static async update(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const pedido = await PedidoLocacaoModel.update(req.params.id, req.body);
      if (!pedido) {
        return res.status(404).json({ error: 'Pedido não encontrado' });
      }

      // Gera novo PDF
      const pdfUid = await PedidoLocacaoPdfService.generatePdf(pedido);
      await PedidoLocacaoModel.updatePdfUid(pedido.id, pdfUid);

      res.json(pedido);
    } catch (error) {
      console.error('Erro ao atualizar pedido:', error);
      res.status(400).json({ error: error.message });
    }
  }

  static async delete(req, res) {
    try {
      const pedido = await PedidoLocacaoModel.delete(req.params.id);
      if (!pedido) {
        return res.status(404).json({ error: 'Pedido não encontrado' });
      }
      res.json({ message: 'Pedido removido com sucesso' });
    } catch (error) {
      console.error('Erro ao deletar pedido:', error);
      res.status(400).json({ error: error.message });
    }
  }

  static async findAll(req, res) {
    try {
      const pedidos = await PedidoLocacaoModel.findAll();
      
      // Buscar informações de faturamento para cada pedido
      const pedidosEnriquecidos = await Promise.all(pedidos.map(async (pedido) => {
        try {
          // Usar o valor total do próprio pedido
          let valorTotal = parseFloat(pedido.total_final) || 0;
          
          // Buscar informações de faturamento
          const faturamentos = await db.query(
            'SELECT * FROM faturamento WHERE id_type = $1 AND id_number = $2 ORDER BY created_at DESC LIMIT 1',
            ['locacao', pedido.id]
          );
          
          let valorFaturado = 0;
          let valorAFaturar = valorTotal;
          
          if (faturamentos.rows.length > 0) {
            const faturamento = faturamentos.rows[0];
            valorFaturado = parseFloat(faturamento.valor_faturado) || 0;
            valorAFaturar = parseFloat(faturamento.valor_a_faturar) || valorTotal;
          }
          
          // Retornar pedido com campos adicionais
          return {
            ...pedido,
            valor_total: valorTotal,
            valor_faturado: valorFaturado,
            valor_a_faturar: valorAFaturar
          };
        } catch (error) {
          console.error(`Erro ao processar pedido de locação ID=${pedido.id}:`, error);
          return pedido; // Em caso de erro, manter o pedido original
        }
      }));
      
      res.json(pedidosEnriquecidos);
    } catch (error) {
      console.error('Erro ao listar pedidos:', error);
      res.status(400).json({ error: error.message });
    }
  }

  static async findById(req, res) {
    try {
      const pedido = await PedidoLocacaoModel.findById(req.params.id);
      if (!pedido) {
        return res.status(404).json({ error: 'Pedido não encontrado' });
      }
      
      // Usar o valor total do próprio pedido
      let valorTotal = parseFloat(pedido.total_final) || 0;
      
      // Buscar informações de faturamento
      const faturamentos = await db.query(
        'SELECT * FROM faturamento WHERE id_type = $1 AND id_number = $2 ORDER BY created_at DESC LIMIT 1',
        ['locacao', pedido.id]
      );
      
      let valorFaturado = 0;
      let valorAFaturar = valorTotal;
      
      if (faturamentos.rows.length > 0) {
        const faturamento = faturamentos.rows[0];
        valorFaturado = parseFloat(faturamento.valor_faturado) || 0;
        valorAFaturar = parseFloat(faturamento.valor_a_faturar) || valorTotal;
      }
      
      // Retornar pedido com campos adicionais
      const pedidoEnriquecido = {
        ...pedido,
        valor_total: valorTotal,
        valor_faturado: valorFaturado,
        valor_a_faturar: valorAFaturar
      };
      
      res.json(pedidoEnriquecido);
    } catch (error) {
      console.error('Erro ao buscar pedido:', error);
      res.status(400).json({ error: error.message });
    }
  }

  static async downloadPdf(req, res) {
    try {
      const pedido = await PedidoLocacaoModel.findById(req.params.id);
      if (!pedido) {
        return res.status(404).json({ error: 'Pedido não encontrado' });
      }

      // Se não houver pdf_uid, gera um novo PDF
      if (!pedido.pdf_uid) {
        console.log('PDF não encontrado, gerando novo PDF...');
        try {
          const pdfUid = await PedidoLocacaoPdfService.generatePdf(pedido);
          await PedidoLocacaoModel.updatePdfUid(pedido.id, pdfUid);
          pedido.pdf_uid = pdfUid;
        } catch (error) {
          console.error('Erro ao gerar PDF:', error);
          return res.status(500).json({ error: 'Erro ao gerar PDF' });
        }
      }

      const pdfPath = path.join(__dirname, `../../uploads/pdfs/${pedido.pdf_uid}.pdf`);
      
      try {
        await fs.access(pdfPath);
        const fileBuffer = await fs.readFile(pdfPath);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=pedido-locacao-${pedido.id}.pdf`);
        res.send(fileBuffer);
      } catch (error) {
        console.error('Erro ao acessar arquivo:', error);
        
        // Se o arquivo não existe, tenta gerar novamente
        try {
          console.log('Arquivo não encontrado, gerando novo PDF...');
          const pdfUid = await PedidoLocacaoPdfService.generatePdf(pedido);
          await PedidoLocacaoModel.updatePdfUid(pedido.id, pdfUid);
          
          const newPdfPath = path.join(__dirname, `../../uploads/pdfs/${pdfUid}.pdf`);
          const fileBuffer = await fs.readFile(newPdfPath);
          
          res.setHeader('Content-Type', 'application/pdf');
          res.setHeader('Content-Disposition', `attachment; filename=pedido-locacao-${pedido.id}.pdf`);
          res.send(fileBuffer);
        } catch (genError) {
          console.error('Erro ao gerar novo PDF:', genError);
          res.status(500).json({ error: 'Erro ao gerar PDF' });
        }
      }
    } catch (error) {
      console.error('Erro ao baixar PDF:', error);
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = PedidoLocacaoController; 