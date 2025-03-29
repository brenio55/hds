const db = require('../config/database');

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

  static async create(data) {
    // Valida se o pedido existe
    const pedidoExists = await this.validatePedido(data.id_type, data.id_number);
    if (!pedidoExists) {
      throw new Error(`Pedido do tipo ${data.id_type} com ID ${data.id_number} não encontrado`);
    }

    const query = `
      INSERT INTO faturamento (
        id_number, id_type, valor_total_pedido, valor_faturado,
        valor_a_faturar, data_vencimento, nf, nf_anexo, pagamento
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;

    const values = [
      data.id_number,
      data.id_type,
      data.valor_total_pedido,
      data.valor_faturado,
      data.valor_a_faturar,
      data.data_vencimento,
      data.nf,
      data.nf_anexo,
      data.pagamento
    ];

    const result = await db.query(query, values);
    return result.rows[0];
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

  static async update(id, data) {
    if (data.id_type && data.id_number) {
      const pedidoExists = await this.validatePedido(data.id_type, data.id_number);
      if (!pedidoExists) {
        throw new Error(`Pedido do tipo ${data.id_type} com ID ${data.id_number} não encontrado`);
      }
    }

    const query = `
      UPDATE faturamento
      SET 
        id_number = $1,
        id_type = $2,
        valor_total_pedido = $3,
        valor_faturado = $4,
        valor_a_faturar = $5,
        data_vencimento = $6,
        nf = $7,
        nf_anexo = $8,
        pagamento = $9
      WHERE id = $10
      RETURNING *
    `;

    const values = [
      data.id_number,
      data.id_type,
      data.valor_total_pedido,
      data.valor_faturado,
      data.valor_a_faturar,
      data.data_vencimento,
      data.nf,
      data.nf_anexo,
      data.pagamento,
      id
    ];

    const result = await db.query(query, values);
    return result.rows[0];
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
}

module.exports = FaturamentoModel; 