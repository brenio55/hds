const db = require('../config/database');

class FuncionarioModel {
  static async create(data) {
    const query = `
      INSERT INTO funcionarios (cargo, contato, dados)
      VALUES ($1, $2, $3)
      RETURNING *
    `;

    const values = [
      data.cargo,
      JSON.stringify(data.contato),
      JSON.stringify(data.dados)
    ];

    try {
      const result = await db.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Erro ao criar funcionário: ${error.message}`);
    }
  }

  static async findAll() {
    const query = 'SELECT * FROM funcionarios ORDER BY id';
    const result = await db.query(query);
    return result.rows;
  }

  static async findById(id) {
    const query = 'SELECT * FROM funcionarios WHERE id = $1';
    const result = await db.query(query, [id]);
    return result.rows[0];
  }

  static async update(id, data) {
    const query = `
      UPDATE funcionarios
      SET cargo = $1, contato = $2, dados = $3
      WHERE id = $4
      RETURNING *
    `;

    const values = [
      data.cargo,
      JSON.stringify(data.contato),
      JSON.stringify(data.dados),
      id
    ];

    const result = await db.query(query, values);
    return result.rows[0];
  }

  static async delete(id) {
    const query = 'DELETE FROM funcionarios WHERE id = $1 RETURNING *';
    const result = await db.query(query, [id]);
    return result.rows[0];
  }
}

module.exports = FuncionarioModel; 