const db = require('../config/database');

class ServicoModel {
  static async create(data) {
    const query = `
      INSERT INTO servico (
        fornecedor_id,
        data_vencimento,
        proposta_id,
        itens
      )
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;

    const values = [
      data.fornecedor_id,
      data.data_vencimento,
      data.proposta_id,
      data.itens
    ];

    const result = await db.query(query, values);
    return result.rows[0];
  }

  static async findById(id) {
    const query = 'SELECT * FROM servico WHERE id = $1';
    const result = await db.query(query, [id]);
    return result.rows[0];
  }

  static async findAll() {
    const query = 'SELECT * FROM servico ORDER BY created_at DESC';
    const result = await db.query(query);
    return result.rows;
  }

  static async update(id, data) {
    const query = `
      UPDATE servico
      SET 
        fornecedor_id = $1,
        data_vencimento = $2,
        proposta_id = $3,
        itens = $4
      WHERE id = $5
      RETURNING *
    `;

    const values = [
      data.fornecedor_id,
      data.data_vencimento,
      data.proposta_id,
      data.itens,
      id
    ];

    const result = await db.query(query, values);
    return result.rows[0];
  }

  static async delete(id) {
    const query = 'DELETE FROM servico WHERE id = $1 RETURNING *';
    const result = await db.query(query, [id]);
    return result.rows[0];
  }

  static async findByField(campo, valor) {
    try {
      let query = 'SELECT * FROM servico WHERE ';
      
      if (campo === 'itens') {
        // Busca em campos JSON
        query += `itens::text ILIKE '%${valor}%'`;
      } else if (['id', 'fornecedor_id', 'proposta_id'].includes(campo)) {
        // Busca exata para IDs
        query += `${campo} = $1`;
      } else if (campo === 'data_vencimento') {
        // Busca exata para data
        query += `${campo}::text = $1`;
      } else {
        throw new Error('Campo de busca inválido');
      }

      query += ' ORDER BY created_at DESC';
      
      const result = await db.query(query, ['id', 'fornecedor_id', 'proposta_id', 'data_vencimento'].includes(campo) ? [valor] : []);
      return result.rows;
    } catch (error) {
      throw new Error(`Erro ao buscar por ${campo}: ${error.message}`);
    }
  }
}

module.exports = ServicoModel; 