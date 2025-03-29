const ServicoModel = require('../models/servicoModel');
const ServicoPdfService = require('../services/servicoPdfService');
const { validationResult } = require('express-validator');
const path = require('path');
const fs = require('fs').promises;

class ServicoController {
  static async create(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const servico = await ServicoModel.create(req.body);
      res.status(201).json(servico);
    } catch (error) {
      console.error('Erro ao criar serviço:', error);
      res.status(400).json({ error: error.message });
    }
  }

  static async findById(req, res) {
    try {
      const servico = await ServicoModel.findById(req.params.id);
      if (!servico) {
        return res.status(404).json({ error: 'Serviço não encontrado' });
      }
      res.json(servico);
    } catch (error) {
      console.error('Erro ao buscar serviço:', error);
      res.status(400).json({ error: error.message });
    }
  }

  static async findAll(req, res) {
    try {
      const { campo, valor } = req.query;

      if (campo && valor) {
        const servicos = await ServicoModel.findByField(campo, valor);
        return res.json(servicos);
      }

      const servicos = await ServicoModel.findAll();
      res.json(servicos);
    } catch (error) {
      console.error('Erro ao listar serviços:', error);
      res.status(400).json({ error: error.message });
    }
  }

  static async update(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const servico = await ServicoModel.update(req.params.id, req.body);
      if (!servico) {
        return res.status(404).json({ error: 'Serviço não encontrado' });
      }
      res.json(servico);
    } catch (error) {
      console.error('Erro ao atualizar serviço:', error);
      res.status(400).json({ error: error.message });
    }
  }

  static async delete(req, res) {
    try {
      const servico = await ServicoModel.delete(req.params.id);
      if (!servico) {
        return res.status(404).json({ error: 'Serviço não encontrado' });
      }
      res.json({ message: 'Serviço removido com sucesso' });
    } catch (error) {
      console.error('Erro ao deletar serviço:', error);
      res.status(400).json({ error: error.message });
    }
  }

  static async generatePdf(req, res) {
    try {
      const { id } = req.params;
      const servico = await ServicoModel.findById(id);
      
      if (!servico) {
        return res.status(404).json({ error: 'Serviço não encontrado' });
      }

      const pdfUid = await ServicoPdfService.generatePdf(servico);
      
      // Atualiza o registro com o UID do PDF
      await ServicoModel.update(id, { ...servico, pdf_uid: pdfUid });

      res.json({ 
        message: 'PDF gerado com sucesso',
        pdf_uid: pdfUid
      });
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      res.status(500).json({ error: error.message });
    }
  }

  static async downloadPdf(req, res) {
    try {
      const { id } = req.params;
      const servico = await ServicoModel.findById(id);
      
      if (!servico) {
        return res.status(404).json({ error: 'Serviço não encontrado' });
      }

      // Se não houver PDF, gera um novo
      if (!servico.pdf_uid) {
        const pdfUid = await ServicoPdfService.generatePdf(servico);
        await ServicoModel.update(id, { ...servico, pdf_uid: pdfUid });
        servico.pdf_uid = pdfUid;
      }

      const pdfPath = path.join(__dirname, `../../uploads/pdfs/${servico.pdf_uid}.pdf`);
      
      try {
        await fs.access(pdfPath);
        const fileBuffer = await fs.readFile(pdfPath);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=servico-${id}.pdf`);
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

module.exports = ServicoController; 