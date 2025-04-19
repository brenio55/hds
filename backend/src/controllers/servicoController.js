const ServicoModel = require('../models/servicoModel');
const ServicoPdfService = require('../services/servicoPdfService');
const { validationResult } = require('express-validator');
const path = require('path');
const fs = require('fs').promises;
const db = require('../config/database');

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
      
      // Buscar informações de faturamento, se disponíveis
      const faturamentos = await db.query(
        'SELECT * FROM faturamento WHERE id_type = $1 AND id_number = $2 ORDER BY created_at DESC LIMIT 1',
        ['servico', servico.id]
      );
      
      let valorFaturado = 0;
      let valorAFaturar = servico.total || 0;
      
      if (faturamentos.rows.length > 0) {
        const faturamento = faturamentos.rows[0];
        valorFaturado = parseFloat(faturamento.valor_faturado) || 0;
        valorAFaturar = Math.max(0, parseFloat(servico.total || 0) - valorFaturado);
      }
      
      // Retornar serviço com campos adicionais
      const servicoEnriquecido = {
        ...servico,
        valor_total: servico.total || 0,
        valor_faturado: valorFaturado,
        valor_a_faturar: valorAFaturar
      };
      
      res.json(servicoEnriquecido);
    } catch (error) {
      console.error('Erro ao buscar serviço:', error);
      res.status(400).json({ error: error.message });
    }
  }

  static async findAll(req, res) {
    try {
      const { campo, valor } = req.query;

      let servicos = [];
      if (campo && valor) {
        servicos = await ServicoModel.findByField(campo, valor);
      } else {
        servicos = await ServicoModel.findAll();
      }

      // Buscar informações de faturamento para cada serviço
      const servicosEnriquecidos = await Promise.all(servicos.map(async (servico) => {
        try {
          // Buscar informações de faturamento, se disponíveis
          const faturamentos = await db.query(
            'SELECT * FROM faturamento WHERE id_type = $1 AND id_number = $2 ORDER BY created_at DESC LIMIT 1',
            ['servico', servico.id]
          );
          
          let valorFaturado = 0;
          let valorAFaturar = servico.total || 0;
          
          if (faturamentos.rows.length > 0) {
            const faturamento = faturamentos.rows[0];
            valorFaturado = parseFloat(faturamento.valor_faturado) || 0;
            valorAFaturar = Math.max(0, parseFloat(servico.total || 0) - valorFaturado);
          }
          
          // Retornar serviço com campos adicionais
          return {
            ...servico,
            valor_total: servico.total || 0,
            valor_faturado: valorFaturado,
            valor_a_faturar: valorAFaturar
          };
        } catch (error) {
          console.error(`Erro ao processar serviço ID=${servico.id}:`, error);
          return servico; // Em caso de erro, manter o serviço original
        }
      }));
      
      res.json(servicosEnriquecidos);
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
      console.log("========== INÍCIO - CONTROLLER GENERATE PDF ==========");
      console.log("Parâmetros da requisição:", req.params);
      
      const { id } = req.params;
      console.log(`Buscando serviço com ID: ${id}`);
      
      const servico = await ServicoModel.findById(id);
      
      if (!servico) {
        console.log(`Serviço com ID ${id} não encontrado na base de dados`);
        return res.status(404).json({ error: 'Serviço não encontrado' });
      }
      
      console.log("Serviço encontrado:", JSON.stringify(servico, null, 2));
      console.log("Chamando serviço de geração de PDF");

      const pdfUid = await ServicoPdfService.generatePdf(servico);
      console.log(`PDF gerado com sucesso. UID: ${pdfUid}`);
      
      // Atualiza o registro com o UID do PDF
      console.log("Atualizando registro do serviço com o UID do PDF");
      await ServicoModel.update(id, { ...servico, pdf_uid: pdfUid });
      console.log("Registro atualizado com sucesso");

      console.log("Enviando resposta para o cliente");
      console.log("========== FIM - CONTROLLER GENERATE PDF ==========");
      res.json({ 
        message: 'PDF gerado com sucesso',
        pdf_uid: pdfUid
      });
    } catch (error) {
      console.error('Erro ao gerar PDF no controller:', error);
      console.error('Stack trace:', error.stack);
      res.status(500).json({ error: error.message });
    }
  }

  static async downloadPdf(req, res) {
    try {
      console.log("========== INÍCIO - CONTROLLER DOWNLOAD PDF ==========");
      console.log("Parâmetros da requisição:", req.params);
      
      const { id } = req.params;
      console.log(`Buscando serviço com ID: ${id}`);
      
      const servico = await ServicoModel.findById(id);
      
      if (!servico) {
        console.log(`Serviço com ID ${id} não encontrado na base de dados`);
        return res.status(404).json({ error: 'Serviço não encontrado' });
      }
      
      console.log("Serviço encontrado:", JSON.stringify(servico, null, 2));

      let pdfUid = servico.pdf_uid;
      let needToGeneratePdf = false;

      // Verificar se o PDF existe no servidor
      if (pdfUid) {
        const pdfPath = path.join(__dirname, `../../uploads/pdfs/${pdfUid}.pdf`);
        try {
          console.log("Verificando se o arquivo PDF existe no servidor");
          await fs.access(pdfPath);
          console.log("Arquivo PDF encontrado no servidor");
        } catch (error) {
          console.log("Arquivo PDF não encontrado no servidor, será gerado um novo PDF");
          needToGeneratePdf = true;
        }
      } else {
        console.log("PDF UID não encontrado. Será gerado um novo PDF");
        needToGeneratePdf = true;
      }

      // Gerar um novo PDF se necessário
      if (needToGeneratePdf) {
        console.log("Gerando novo PDF...");
        pdfUid = await ServicoPdfService.generatePdf(servico);
        console.log(`Novo PDF gerado. UID: ${pdfUid}`);
        
        console.log("Atualizando registro do serviço com o novo PDF UID");
        await ServicoModel.update(id, { ...servico, pdf_uid: pdfUid });
        console.log("Registro atualizado com sucesso");
      }

      const pdfPath = path.join(__dirname, `../../uploads/pdfs/${pdfUid}.pdf`);
      console.log(`Caminho do arquivo PDF: ${pdfPath}`);
      
      try {
        console.log("Lendo conteúdo do arquivo PDF");
        const fileBuffer = await fs.readFile(pdfPath);
        console.log(`Arquivo lido com sucesso. Tamanho: ${fileBuffer.length} bytes`);
        
        console.log("Configurando headers da resposta");
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=servico-${id}.pdf`);
        
        console.log("Enviando arquivo para o cliente");
        console.log("========== FIM - CONTROLLER DOWNLOAD PDF ==========");
        res.send(fileBuffer);
      } catch (error) {
        console.error('Erro ao ler arquivo PDF:', error);
        console.error('Stack trace:', error.stack);
        res.status(500).json({ error: 'Erro ao ler arquivo PDF' });
      }
    } catch (error) {
      console.error('Erro ao baixar PDF no controller:', error);
      console.error('Stack trace:', error.stack);
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = ServicoController; 