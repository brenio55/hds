const db = require('../config/database');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

class FaturamentoModel {
  static async validatePedido(id_type, id_number) {
    let table;
    switch (id_type) {
      case 'compra':
        table = 'pedido_compra';
        break;
      case 'locacao':
        table = 'pedido_locacao';
        break;
      case 'servico':
        table = 'servico';
        break;
      default:
        throw new Error('Tipo de pedido inválido');
    }

    const query = `SELECT id FROM ${table} WHERE id = $1`;
    const result = await db.query(query, [id_number]);
    return result.rows.length > 0;
  }
  
  // Função para salvar arquivo de anexo
  static async saveAnexoFile(base64Data, fileExtension = '.pdf') {
    try {
      if (!base64Data) return null;
      
      // Gerar UUID para o nome do arquivo
      const fileName = `anexo_${uuidv4()}${fileExtension}`;
      
      // Determinar o caminho do diretório de anexos (relativo à raiz do projeto)
      const uploadsDir = path.join('uploads', 'anexos');
      
      // Garantir que o diretório existe
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      
      // Caminho completo do arquivo
      const filePath = path.join(uploadsDir, fileName);
      
      // Remover o prefixo "data:..." se presente
      let dataToSave = base64Data;
      if (base64Data.includes(';base64,')) {
        dataToSave = base64Data.split(';base64,').pop();
      }
      
      // Salvar o arquivo
      fs.writeFileSync(filePath, dataToSave, { encoding: 'base64' });
      
      return fileName;
    } catch (error) {
      console.error('Erro ao salvar arquivo de anexo:', error);
      throw new Error(`Erro ao salvar arquivo de anexo: ${error.message}`);
    }
  }

  static async create(dados) {
    try {
      if (!dados.valor_total_pedido) {
        throw new Error('O campo valor_total_pedido é obrigatório');
      }
  
      const valorTotalPedido = parseFloat(dados.valor_total_pedido);
      const novoValorFaturado = parseFloat(dados.valor_faturado);
  
      let detalhesPagamento = {};
  
      if (dados.pagamento === 'boleto') {
        detalhesPagamento.numero_boleto = dados.numero_boleto || '';
      } else if (dados.pagamento === 'pix' || dados.pagamento === 'ted') {
        detalhesPagamento.dados_conta = dados.dados_conta || '';
      }
  
      if (dados.recebimento_anexo) {
        const anexoFileName = await this.saveAnexoFile(dados.recebimento_anexo);
        detalhesPagamento.anexo_id = anexoFileName;
      }
  
      const existingRecords = await db.query(
        'SELECT * FROM faturamento WHERE id_number = $1 AND id_type = $2 ORDER BY created_at DESC LIMIT 1',
        [dados.id_number, dados.id_type]
      );
  
      if (existingRecords.rows.length > 0) {
        const existing = existingRecords.rows[0];
  
        const acumuladoFaturado = parseFloat(existing.valor_faturado) + novoValorFaturado;
        const valorAFaturar = Math.max(0, valorTotalPedido - (acumuladoFaturado / 100 * valorTotalPedido));
  
        if (acumuladoFaturado >= 100) {
          // Quitado: apenas atualiza agendamento = FALSE
          await db.query(
            'UPDATE faturamento SET agendamento = FALSE WHERE id = $1',
            [existing.id]
          );
          return { ...existing, agendamento: false };
        } else {
          // Atualiza registro existente com novos valores acumulados
          await db.query(
            `UPDATE faturamento 
             SET valor_faturado = $1, 
                 valor_total_pedido = $2, 
                 valor_a_faturar = $3, 
                 agendamento = FALSE 
             WHERE id = $4`,
            [acumuladoFaturado, valorTotalPedido, valorAFaturar, existing.id]
          );
  
          // Cria novo com agendamento = TRUE
          const novo = await db.query(
            'INSERT INTO faturamento (id_number, id_type, valor_total_pedido, valor_faturado, valor_a_faturar, data_vencimento, nf, nf_anexo, pagamento, detalhes_pagamento, agendamento) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, TRUE) RETURNING *',
            [
              dados.id_number,
              dados.id_type,
              valorTotalPedido,
              novoValorFaturado,
              Math.max(0, valorTotalPedido - (novoValorFaturado / 100 * valorTotalPedido)),
              dados.data_vencimento,
              dados.nf,
              dados.nf_anexo,
              dados.pagamento,
              JSON.stringify(detalhesPagamento)
            ]
          );
  
          return novo.rows[0];
        }
      } else {
        // Nenhum registro anterior — criar novo com agendamento = TRUE
        const valorAFaturar = Math.max(0, valorTotalPedido - (novoValorFaturado / 100 * valorTotalPedido));
        const novo = await db.query(
          'INSERT INTO faturamento (id_number, id_type, valor_total_pedido, valor_faturado, valor_a_faturar, data_vencimento, nf, nf_anexo, pagamento, detalhes_pagamento, agendamento) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, TRUE) RETURNING *',
          [
            dados.id_number,
            dados.id_type,
            valorTotalPedido,
            novoValorFaturado,
            valorAFaturar,
            dados.data_vencimento,
            dados.nf,
            dados.nf_anexo,
            dados.pagamento,
            JSON.stringify(detalhesPagamento)
          ]
        );
  
        return novo.rows[0];
      }
  
    } catch (error) {
      throw new Error(`Erro ao criar faturamento: ${error.message}`);
    }
  }    

  static async findById(id) {
    const query = 'SELECT * FROM faturamento WHERE id = $1';
    const result = await db.query(query, [id]);
    return result.rows[0];
  }

  static async findAll() {
    const query = 'SELECT * FROM faturamento ORDER BY created_at DESC';
    const result = await db.query(query);
    return result.rows;
  }

  static async update(id, dados) {
    try {
      // Buscar dados existentes
      const existingRecord = await this.findById(id);
      if (!existingRecord) return null;
      
      // Preparar o objeto detalhes_pagamento com base no tipo de pagamento
      let detalhesPagamento = existingRecord.detalhes_pagamento || {};
      
      if (dados.pagamento === 'boleto') {
        detalhesPagamento.numero_boleto = dados.numero_boleto || detalhesPagamento.numero_boleto || '';
      } else if (dados.pagamento === 'pix' || dados.pagamento === 'ted') {
        detalhesPagamento.dados_conta = dados.dados_conta || detalhesPagamento.dados_conta || '';
      }
      
      // Processar anexo se fornecido
      if (dados.recebimento_anexo) {
        const anexoFileName = await this.saveAnexoFile(dados.recebimento_anexo);
        detalhesPagamento.anexo_id = anexoFileName;
      }
      
      const updateQuery = `
        UPDATE faturamento 
        SET id_number = $1, 
            id_type = $2, 
            valor_faturado = $3, 
            data_vencimento = $4, 
            nf = $5, 
            nf_anexo = $6, 
            pagamento = $7,
            detalhes_pagamento = $8
        WHERE id = $9
        RETURNING *
      `;
      
      const result = await db.query(updateQuery, [
        dados.id_number,
        dados.id_type,
        dados.valor_faturado,
        dados.data_vencimento,
        dados.nf,
        dados.nf_anexo,
        dados.pagamento,
        JSON.stringify(detalhesPagamento),
        id
      ]);
      
      return result.rows[0];
    } catch (error) {
      throw new Error(`Erro ao atualizar faturamento: ${error.message}`);
    }
  }

  static async delete(id) {
    const query = 'DELETE FROM faturamento WHERE id = $1 RETURNING *';
    const result = await db.query(query, [id]);
    return result.rows[0];
  }

  static async findByField(field, value) {
    let query = 'SELECT * FROM faturamento WHERE ';
    
    switch (field) {
      case 'id_type':
        query += 'id_type = $1';
        break;
      case 'id_number':
        query += 'id_number = $1';
        break;
      case 'data_vencimento':
        query += 'data_vencimento::text LIKE $1';
        value = `%${value}%`;
        break;
      case 'nf':
        query += 'nf::text LIKE $1';
        value = `%${value}%`;
        break;
      case 'pagamento':
        query += 'pagamento = $1';
        break;
      default:
        throw new Error('Campo de busca inválido');
    }

    query += ' ORDER BY created_at DESC';
    
    const result = await db.query(query, [value]);
    return result.rows;
  }

  static async findHistorico(id_number, id_type) {
    const query = `
      SELECT * FROM faturamento 
      WHERE id_number = $1 AND id_type = $2
      ORDER BY created_at DESC
    `;
    
    const result = await db.query(query, [id_number, id_type]);
    return result.rows;
  }
}

module.exports = FaturamentoModel; 