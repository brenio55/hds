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

  static async create(dados) {
    try {
      // Garantir que temos todos os campos obrigatórios
      if (!dados.valor_total_pedido) {
        throw new Error('O campo valor_total_pedido é obrigatório');
      }
      
      // Calcular valor_a_faturar como (valor_total - (valor_faturado/100 * valor_total))
      const valorTotalPedido = parseFloat(dados.valor_total_pedido);
      const percentualFaturado = parseFloat(dados.valor_faturado);
      const valorAFaturar = Math.max(0, valorTotalPedido - (percentualFaturado / 100 * valorTotalPedido));
      
      const result = await db.query(
        'INSERT INTO faturamento (id_number, id_type, valor_total_pedido, valor_faturado, valor_a_faturar, data_vencimento, nf, nf_anexo, pagamento) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id',
        [
          dados.id_number, 
          dados.id_type, 
          valorTotalPedido,
          percentualFaturado, 
          valorAFaturar,
          dados.data_vencimento, 
          dados.nf, 
          dados.nf_anexo, 
          dados.pagamento
        ]
      );
      
      const id = result.rows[0].id;
      return { id, ...dados, valor_a_faturar: valorAFaturar };
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
      const count = await db('faturamento')
        .where({ id })
        .update({
          id_number: dados.id_number,
          id_type: dados.id_type,
          valor_faturado: dados.valor_faturado,
          data_vencimento: dados.data_vencimento,
          nf: dados.nf,
          nf_anexo: dados.nf_anexo,
          pagamento: dados.pagamento
        });
      if (count === 0) return null;
      return { id, ...dados };
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
}

module.exports = FaturamentoModel; 