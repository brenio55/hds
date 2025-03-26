const PedidoLocacaoModel = require('../models/pedidoLocacaoModel');
const PedidoLocacaoPdfService = require('../services/pedidoLocacaoPdfService');
const { validationResult } = require('express-validator');
const path = require('path');
const fs = require('fs').promises;

class PedidoLocacaoController {
  static async create(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      // Garante que itens seja um JSON string
      const data = {
        ...req.body,
        itens: JSON.stringify(req.body.itens)
      };

      console.log('Dados recebidos:', data); // Log para debug

      const pedido = await PedidoLocacaoModel.create(data);
      
      // Gera o PDF
      const pdfUid = await PedidoLocacaoPdfService.generatePdf(pedido);
      await PedidoLocacaoModel.updatePdfUid(pedido.id, pdfUid);

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
      res.json(pedidos);
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
      res.json(pedido);
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