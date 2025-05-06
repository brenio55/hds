const db = require('../config/database');

class CargoModel {
  static async create(data) {
    const query = `
      INSERT INTO cargos (nome, descricao, valor_hh)
      VALUES ($1, $2, $3)
      RETURNING *
    `;

    const values = [
      data.nome,
      data.descricao || null,
      data.valor_hh
    ];

    try {
      const result = await db.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Erro ao criar cargo: ${error.message}`);
    }
  }

  static async findAll() {
    const query = 'SELECT * FROM cargos ORDER BY nome';
    try {
      const result = await db.query(query);
      return result.rows;
    } catch (error) {
      throw new Error(`Erro ao buscar cargos: ${error.message}`);
    }
  }

  static async findById(id) {
    const query = 'SELECT * FROM cargos WHERE id = $1';
    try {
      const result = await db.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Erro ao buscar cargo: ${error.message}`);
    }
  }

  static async update(id, data) {
    const query = `
      UPDATE cargos
      SET nome = $1, descricao = $2, valor_hh = $3, updated_at = CURRENT_TIMESTAMP
      WHERE id = $4
      RETURNING *
    `;

    const values = [
      data.nome,
      data.descricao || null,
      data.valor_hh,
      id
    ];

    try {
      const result = await db.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Erro ao atualizar cargo: ${error.message}`);
    }
  }

  static async delete(id) {
    // Verificar se o cargo está sendo usado por algum funcionário
    const checkQuery = 'SELECT COUNT(*) FROM funcionarios WHERE cargo_id = $1';
    try {
      const checkResult = await db.query(checkQuery, [id]);
      if (parseInt(checkResult.rows[0].count) > 0) {
        throw new Error('Não é possível excluir cargo em uso por funcionários');
      }

      const query = 'DELETE FROM cargos WHERE id = $1 RETURNING *';
      const result = await db.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Erro ao excluir cargo: ${error.message}`);
    }
  }
}

module.exports = CargoModel; 