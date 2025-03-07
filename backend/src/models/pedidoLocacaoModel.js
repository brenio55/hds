const db = require('../config/database');

class PedidoLocacaoModel {
  static async create(data) {
    const query = `
      INSERT INTO pedido_locacao (
        fornecedor_id, itens, total_bruto, total_ipi,
        total_descontos, valor_frete, outras_despesas,
        total_final, informacoes_importantes, cond_pagto,
        prazo_entrega, frete
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `;

    const values = [
      data.fornecedor_id,
      data.itens,
      data.total_bruto,
      data.total_ipi,
      data.total_descontos,
      data.valor_frete,
      data.outras_despesas,
      data.total_final,
      data.informacoes_importantes,
      data.cond_pagto,
      data.prazo_entrega,
      data.frete
    ];

    try {
      console.log('Query:', query);
      console.log('Values:', values);
      const result = await db.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error('Erro SQL:', error);
      throw new Error(`Erro ao criar pedido de locação: ${error.message}`);
    }
  }

  static async update(id, data) {
    const query = `
      UPDATE pedido_locacao
      SET fornecedor_id = $1,
          itens = $2,
          total_bruto = $3,
          total_ipi = $4,
          total_descontos = $5,
          valor_frete = $6,
          outras_despesas = $7,
          total_final = $8,
          informacoes_importantes = $9,
          cond_pagto = $10,
          prazo_entrega = $11,
          frete = $12
      WHERE id = $13
      RETURNING *
    `;

    const values = [
      data.fornecedor_id,
      JSON.stringify(data.itens),
      data.total_bruto,
      data.total_ipi,
      data.total_descontos,
      data.valor_frete,
      data.outras_despesas,
      data.total_final,
      data.informacoes_importantes,
      data.cond_pagto,
      data.prazo_entrega,
      data.frete,
      id
    ];

    const result = await db.query(query, values);
    return result.rows[0];
  }

  static async delete(id) {
    const query = 'DELETE FROM pedido_locacao WHERE id = $1 RETURNING *';
    const result = await db.query(query, [id]);
    return result.rows[0];
  }

  static async findById(id) {
    const query = `
        SELECT 
            pl.*,
            f.razao_social as fornecedor_nome,
            f.cnpj as fornecedor_cnpj,
            f.inscricao_estadual as fornecedor_ie,
            f.inscricao_municipal as fornecedor_im,
            f.endereco as fornecedor_endereco,
            f.telefone as fornecedor_telefone,
            f.email as fornecedor_email,
            f.contato as fornecedor_contato,
            c.nome as cliente_nome,
            c.endereco as cliente_endereco,
            p.descricao as proposta_descricao,
            p.valor_final as proposta_valor
        FROM pedido_locacao pl
        LEFT JOIN fornecedores f ON pl.fornecedor_id = f.id
        LEFT JOIN clientinfo c ON pl.clientinfo_id = c.id
        LEFT JOIN propostas p ON pl.proposta_id = p.id
        WHERE pl.id = $1
    `;
    const result = await db.query(query, [id]);
    return result.rows[0];
  }

  static async findAll() {
    const query = `
        SELECT 
            pl.*,
            f.razao_social as fornecedor_nome,
            f.cnpj as fornecedor_cnpj,
            f.inscricao_estadual as fornecedor_ie,
            f.inscricao_municipal as fornecedor_im,
            f.endereco as fornecedor_endereco,
            f.telefone as fornecedor_telefone,
            f.email as fornecedor_email,
            f.contato as fornecedor_contato,
            c.nome as cliente_nome,
            c.endereco as cliente_endereco,
            p.descricao as proposta_descricao,
            p.valor_final as proposta_valor
        FROM pedido_locacao pl
        LEFT JOIN fornecedores f ON pl.fornecedor_id = f.id
        LEFT JOIN clientinfo c ON pl.clientinfo_id = c.id
        LEFT JOIN propostas p ON pl.proposta_id = p.id
        ORDER BY pl.created_at DESC
    `;
    const result = await db.query(query);
    return result.rows;
  }

  static async updatePdfUid(id, pdfUid) {
    const query = `
      UPDATE pedido_locacao
      SET pdf_uid = $1
      WHERE id = $2
      RETURNING *
    `;
    const result = await db.query(query, [pdfUid, id]);
    return result.rows[0];
  }
}

module.exports = PedidoLocacaoModel; 