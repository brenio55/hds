const db = require('../config/database');

class PedidoCompraModel {
  static async create(data) {
    const query = `
      INSERT INTO pedido_compra (
        clientinfo_id, fornecedores_id, ddl, data_vencimento,
        proposta_id, materiais, desconto, valor_frete,
        despesas_adicionais, dados_adicionais, frete
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `;

    // Garantir que os campos JSON sejam strings JSON válidas
    const materiais = Array.isArray(data.materiais) ? JSON.stringify(data.materiais) : '[]';
    const frete = typeof data.frete === 'object' ? JSON.stringify(data.frete) : '{}';

    const values = [
      data.clientinfo_id,
      data.fornecedores_id,
      data.ddl,
      data.data_vencimento,
      data.proposta_id,
      materiais,  // Agora é uma string JSON
      data.desconto,
      data.valor_frete,
      data.despesas_adicionais,
      data.dados_adicionais,
      frete  // Agora é uma string JSON
    ];

    try {
      const result = await db.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error('Erro SQL:', error);
      throw error;
    }
  }

  static async findAll() {
    const query = `
      SELECT pc.*, f.razao_social as fornecedor_nome
      FROM pedido_compra pc
      LEFT JOIN fornecedores f ON pc.fornecedores_id = f.id
      ORDER BY pc.created_at DESC
    `;
    const result = await db.query(query);
    return result.rows;
  }

  static async findById(id) {
    const query = `
      SELECT pc.*, f.razao_social as fornecedor_nome
      FROM pedido_compra pc
      LEFT JOIN fornecedores f ON pc.fornecedores_id = f.id
      WHERE pc.id = $1
    `;
    const result = await db.query(query, [id]);
    return result.rows[0];
  }

  static async update(id, data) {
    const query = `
      UPDATE pedido_compra
      SET clientinfo_id = $1, fornecedores_id = $2, ddl = $3,
          data_vencimento = $4, proposta_id = $5, materiais = $6,
          desconto = $7, valor_frete = $8, despesas_adicionais = $9,
          dados_adicionais = $10, frete = $11
      WHERE id = $12
      RETURNING *
    `;

    const values = [
      data.clientinfo_id,
      data.fornecedores_id,
      data.ddl,
      data.data_vencimento,
      data.proposta_id,
      data.materiais,
      data.desconto,
      data.valor_frete,
      data.despesas_adicionais,
      data.dados_adicionais,
      data.frete,
      id
    ];

    const result = await db.query(query, values);
    return result.rows[0];
  }

  static async findByField(campo, valor) {
    try {
      let query = `
        SELECT pc.*, f.razao_social as fornecedor_nome
        FROM pedido_compra pc
        LEFT JOIN fornecedores f ON pc.fornecedores_id = f.id
      `;

      // Tratamento especial para campos que são JSON
      if (campo === 'materiais' || campo === 'frete') {
        query += `WHERE pc.${campo}::text ILIKE $1`;
        const result = await db.query(query, [`%${valor}%`]);
        return result.rows;
      }

      // Tratamento para campos de data
      if (campo === 'data_vencimento' || campo === 'created_at') {
        query += `WHERE pc.${campo}::text LIKE $1`;
        const result = await db.query(query, [`%${valor}%`]);
        return result.rows;
      }

      // Busca case-insensitive para campos de texto
      if (typeof valor === 'string') {
        query += `WHERE CAST(pc.${campo} AS TEXT) ILIKE $1`;
        const result = await db.query(query, [`%${valor}%`]);
        return result.rows;
      }

      // Busca exata para números e outros tipos
      query += `WHERE pc.${campo} = $1`;
      const result = await db.query(query, [valor]);
      return result.rows;
    } catch (error) {
      console.error('Erro ao buscar pedidos por campo:', error);
      throw new Error(`Erro ao buscar pedidos por ${campo}: ${error.message}`);
    }
  }
}

module.exports = PedidoCompraModel; 