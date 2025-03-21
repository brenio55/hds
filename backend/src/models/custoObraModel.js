const db = require('../config/database');

class CustoObraModel {
  static async create(data) {
    const query = `
      INSERT INTO custoobra (valor, obra, duracao)
      VALUES ($1, $2, $3)
      RETURNING *
    `;

    const values = [
      data.valor,
      data.obra,
      data.duracao
    ];

    try {
      const result = await db.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Erro ao criar custo obra: ${error.message}`);
    }
  }

  static async findAll() {
    const query = 'SELECT * FROM custoobra ORDER BY created_at DESC';
    const result = await db.query(query);
    return result.rows;
  }

  static async findById(id) {
    const query = 'SELECT * FROM custoobra WHERE id = $1';
    const result = await db.query(query, [id]);
    return result.rows[0];
  }

  static async update(id, data) {
    const query = `
      UPDATE custoobra
      SET valor = $1,
          obra = $2,
          duracao = $3
      WHERE id = $4
      RETURNING *
    `;

    const values = [
      data.valor,
      data.obra,
      data.duracao,
      id
    ];

    const result = await db.query(query, values);
    return result.rows[0];
  }

  static async delete(id) {
    const query = 'DELETE FROM custoobra WHERE id = $1 RETURNING *';
    const result = await db.query(query, [id]);
    return result.rows[0];
  }

  static async findByField(campo, valor) {
    try {
      let query = 'SELECT * FROM custoobra';

      // Tratamento para diferentes tipos de campos
      if (campo === 'duracao' || campo === 'created_at') {
        query += ` WHERE ${campo}::text LIKE $1`;
      } else if (campo === 'valor') {
        query += ` WHERE ${campo} = $1`;
      } else if (campo === 'obra') {
        query += ` WHERE ${campo} ILIKE $1`;
        valor = `%${valor}%`; // Busca parcial para texto
      } else {
        throw new Error('Campo de busca inválido');
      }

      query += ' ORDER BY created_at DESC';
      
      const result = await db.query(query, [valor]);
      return result.rows;
    } catch (error) {
      throw new Error(`Erro ao buscar por ${campo}: ${error.message}`);
    }
  }
}

module.exports = CustoObraModel; 