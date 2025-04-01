const PedidoCompraModel = require('../models/pedidoCompraModel');
const { validationResult } = require('express-validator');
const PedidoCompraService = require('../services/pedidoCompraPdfService');
const PropostaModel = require('../models/propostaModel');
const FornecedorModel = require('../models/fornecedorModel');
const path = require('path');
const fs = require('fs').promises;
const db = require('../config/database');


class PedidoCompraController {
  static async create(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const pedido = await PedidoCompraModel.create(req.body);
      res.status(201).json(pedido);
    } catch (error) {
      console.error('Erro ao criar pedido:', error);
      res.status(400).json({ error: error.message });
    }
  }

  static async findAll(req, res) {
    try {
      const { campo, valor } = req.query;

      // Se não houver parâmetros de busca, retorna todos os pedidos
      let pedidos = [];
      if (!campo || !valor) {
        pedidos = await PedidoCompraModel.findAll();
      } else {
        // Validar campos permitidos para busca (apenas colunas da tabela)
        const camposPermitidos = [
          'id',
          'clientinfo_id',
          'fornecedores_id',
          'ddl',
          'data_vencimento',
          'proposta_id',
          'materiais',
          'desconto',
          'valor_frete',
          'despesas_adicionais',
          'dados_adicionais',
          'frete',
          'created_at',
          'ativo'
        ];

        if (!camposPermitidos.includes(campo)) {
          return res.status(400).json({ 
            error: `Campo de busca inválido. Campos permitidos: ${camposPermitidos.join(', ')}`,
            exemplo: 'Use /api/pedidos-compra?campo=id&valor=1'
          });
        }

        // Busca pedidos com o filtro
        pedidos = await PedidoCompraModel.findByField(campo, valor);
        
        if (!pedidos || pedidos.length === 0) {
          return res.status(404).json({ 
            message: 'Nenhum pedido encontrado com os critérios informados',
            exemplo: 'Tente outro valor ou verifique se o campo está correto'
          });
        }
      }

      // Buscar informações de faturamento para cada pedido
      const pedidosEnriquecidos = await Promise.all(pedidos.map(async (pedido) => {
        try {
          // Calcular valor total
          let valorTotal = 0;
          if (pedido.materiais && typeof pedido.materiais === 'string') {
            try {
              const materiais = JSON.parse(pedido.materiais);
              if (Array.isArray(materiais)) {
                valorTotal = materiais.reduce((sum, item) => 
                  sum + (parseFloat(item.valor_total) || 0), 0);
              }
            } catch (e) {
              console.error(`Erro ao parsear materiais para pedido ID=${pedido.id}:`, e);
            }
          } else if (Array.isArray(pedido.materiais)) {
            valorTotal = pedido.materiais.reduce((sum, item) => 
              sum + (parseFloat(item.valor_total) || 0), 0);
          }
          
          // Buscar informações de faturamento
          const faturamentos = await db.query(
            'SELECT * FROM faturamento WHERE id_type = $1 AND id_number = $2 ORDER BY created_at DESC LIMIT 1',
            ['compra', pedido.id]
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
          console.error(`Erro ao processar pedido ID=${pedido.id}:`, error);
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
      const pedido = await PedidoCompraModel.findById(req.params.id);
      if (!pedido) {
        return res.status(404).json({ error: 'Pedido não encontrado' });
      }
      
      // Calcular valor total
      let valorTotal = 0;
      if (pedido.materiais && typeof pedido.materiais === 'string') {
        try {
          const materiais = JSON.parse(pedido.materiais);
          if (Array.isArray(materiais)) {
            valorTotal = materiais.reduce((sum, item) => 
              sum + (parseFloat(item.valor_total) || 0), 0);
          }
        } catch (e) {
          console.error(`Erro ao parsear materiais para pedido ID=${pedido.id}:`, e);
        }
      } else if (Array.isArray(pedido.materiais)) {
        valorTotal = pedido.materiais.reduce((sum, item) => 
          sum + (parseFloat(item.valor_total) || 0), 0);
      }
      
      // Buscar informações de faturamento
      const faturamentos = await db.query(
        'SELECT * FROM faturamento WHERE id_type = $1 AND id_number = $2 ORDER BY created_at DESC LIMIT 1',
        ['compra', pedido.id]
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

  static async update(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const pedido = await PedidoCompraModel.update(req.params.id, req.body);
      if (!pedido) {
        return res.status(404).json({ error: 'Pedido não encontrado' });
      }
      res.json(pedido);
    } catch (error) {
      console.error('Erro ao atualizar pedido:', error);
      res.status(400).json({ error: error.message });
    }
  }
  static async generatePdf(req, res) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({ error: 'ID do pedido de compra é obrigatório' });
      }

      // Busca o pedido de compra
      const pedido = await PedidoCompraModel.findById(id);
      if (!pedido) {
        return res.status(404).json({ error: 'Pedido de compra não encontrado' });
      }

      // Busca a proposta associada ao pedido
      const proposta = await PropostaModel.findById(pedido.proposta_id);
      if (!proposta) {
        return res.status(404).json({ error: 'Proposta associada ao pedido não encontrada' });
      }

      // Busca o fornecedor associado ao pedido
      const fornecedor = await FornecedorModel.findById(pedido.fornecedores_id);
      if (!fornecedor) {
        return res.status(404).json({ error: 'Fornecedor associado ao pedido não encontrado' });
      }

      // Gera o PDF
      console.log(fornecedor)
      const result = await PedidoCompraService.generatePdf(pedido, proposta, fornecedor);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async downloadPdf(req, res) {
    try {
      const { id } = req.params;
      console.log('Iniciando download do PDF para pedido:', id);

      // Busca o pedido de compra
      let pedido = await PedidoCompraModel.findById(id);
      if (!pedido) {
        return res.status(404).json({ error: 'Pedido de compra não encontrado' });
      }
      console.log('Pedido encontrado:', pedido);

      // Verifica se existe PDF gerado
      if (!pedido.pdf_uid) {
        // Se não existir, gera o PDF
        const proposta = await PropostaModel.findById(pedido.proposta_id);
        console.log('Proposta ID:', pedido.proposta_id);
        console.log('Proposta encontrada:', proposta);

        const fornecedor = await FornecedorModel.findById(pedido.fornecedores_id);
        console.log('Fornecedor ID:', pedido.fornecedores_id);
        console.log('Fornecedor encontrado:', fornecedor);
        
        if (!proposta) {
          return res.status(404).json({ error: 'Proposta não encontrada' });
        }
        if (!fornecedor) {
          return res.status(404).json({ error: 'Fornecedor não encontrado' });
        }

        // Gera o PDF e atualiza APENAS o pdf_uid do pedido
        const pdf_uid = await PedidoCompraService.generatePdf(pedido, proposta, fornecedor);
        
        // Prepara os dados para atualização
        const dadosAtualizacao = {
          id: pedido.id,
          clientinfo_id: pedido.clientinfo_id,
          fornecedores_id: pedido.fornecedores_id,
          ddl: pedido.ddl,
          data_vencimento: pedido.data_vencimento,
          proposta_id: pedido.proposta_id,
          materiais: Array.isArray(pedido.materiais) ? JSON.stringify(pedido.materiais) : pedido.materiais,
          desconto: pedido.desconto,
          valor_frete: pedido.valor_frete,
          despesas_adicionais: pedido.despesas_adicionais,
          dados_adicionais: pedido.dados_adicionais,
          frete: typeof pedido.frete === 'object' ? JSON.stringify(pedido.frete) : pedido.frete,
          pdf_uid
        };

        console.log('Dados adicionais antes da atualização:', pedido.dados_adicionais);
        await PedidoCompraModel.update(id, dadosAtualizacao);
        pedido.pdf_uid = pdf_uid;
      }

      // Caminho do arquivo
      let pdfPath = path.join(__dirname, `../../uploads/pdfs/${pedido.pdf_uid}.pdf`);

      console.log('Caminho do arquivo:', pdfPath);
      console.log('PDF UID:', pedido.pdf_uid);

      // Verifica se o arquivo existe
      try {
        await fs.access(pdfPath);
      } catch (error) {
        console.error('Erro ao acessar arquivo:', error);
        // Se o arquivo não existe, tenta gerar novamente
        const proposta = await PropostaModel.findById(pedido.proposta_id);
        const fornecedor = await FornecedorModel.findById(pedido.fornecedores_id);
        
        const pdf_uid = await PedidoCompraService.generatePdf(pedido, proposta, fornecedor);
        
        // Prepara os dados para atualização (mesmo código de antes)
        const dadosAtualizacao = {
          id: pedido.id,
          clientinfo_id: pedido.clientinfo_id,
          fornecedores_id: pedido.fornecedores_id,
          ddl: pedido.ddl,
          data_vencimento: pedido.data_vencimento,
          proposta_id: pedido.proposta_id,
          materiais: Array.isArray(pedido.materiais) ? JSON.stringify(pedido.materiais) : pedido.materiais,
          desconto: pedido.desconto,
          valor_frete: pedido.valor_frete,
          despesas_adicionais: pedido.despesas_adicionais,
          dados_adicionais: pedido.dados_adicionais,
          frete: typeof pedido.frete === 'object' ? JSON.stringify(pedido.frete) : pedido.frete,
          pdf_uid
        };

        await PedidoCompraModel.update(id, dadosAtualizacao);
        pedido.pdf_uid = pdf_uid;
        
        // Verifica novamente se o arquivo foi criado
        try {
          const newPdfPath = path.join(__dirname, `../../uploads/pdfs/${pdf_uid}.pdf`);
          await fs.access(newPdfPath);
          // Se chegou aqui, atualiza o pdfPath
          pdfPath = newPdfPath;
        } catch (error) {
          console.error('Erro ao gerar novo PDF:', error);
          return res.status(500).json({ error: 'Erro ao gerar PDF' });
        }
      }

      // Lê o arquivo e envia como download
      const fileBuffer = await fs.readFile(pdfPath);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=pedido-compra-${id}.pdf`);
      res.send(fileBuffer);
    } catch (error) {
      console.error('Erro detalhado:', error);
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = PedidoCompraController;
