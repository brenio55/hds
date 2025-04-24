const db = require('../config/database');

class FuncionarioModel {
  static async create(data) {
    const query = `
      INSERT INTO funcionarios (cargo, contato, dados, cargo_id)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;

    const values = [
      data.cargo,
      JSON.stringify(data.contato || {}),
      JSON.stringify(data.dados || {}),
      data.cargo_id || null
    ];

    try {
      const result = await db.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Erro ao criar funcionário: ${error.message}`);
    }
  }

  static async findAll() {
    const query = `
      SELECT f.*, c.nome AS cargo_nome, c.valor_hh
      FROM funcionarios f
      LEFT JOIN cargos c ON f.cargo_id = c.id
      ORDER BY f.id
    `;
    try {
      const result = await db.query(query);
      
      // Processar os resultados para incluir valores de HH com acréscimos
      return result.rows.map(funcionario => {
        // Se o funcionário tiver um cargo associado com valor_hh
        if (funcionario.valor_hh) {
          const valorHH = parseFloat(funcionario.valor_hh);
          funcionario.valor_hh_60 = (valorHH * 1.6).toFixed(2);
          funcionario.valor_hh_100 = (valorHH * 2).toFixed(2);
        }
        return funcionario;
      });
    } catch (error) {
      throw new Error(`Erro ao buscar funcionários: ${error.message}`);
    }
  }

  static async findById(id) {
    const query = `
      SELECT f.*, c.nome AS cargo_nome, c.valor_hh 
      FROM funcionarios f
      LEFT JOIN cargos c ON f.cargo_id = c.id
      WHERE f.id = $1
    `;
    try {
      const result = await db.query(query, [id]);
      
      // Se encontrou o funcionário e ele tem valor_hh, adicionar valores com acréscimos
      if (result.rows.length > 0 && result.rows[0].valor_hh) {
        const funcionario = result.rows[0];
        const valorHH = parseFloat(funcionario.valor_hh);
        funcionario.valor_hh_60 = (valorHH * 1.6).toFixed(2);
        funcionario.valor_hh_100 = (valorHH * 2).toFixed(2);
      }
      
      return result.rows[0];
    } catch (error) {
      throw new Error(`Erro ao buscar funcionário: ${error.message}`);
    }
  }

  static async update(id, data) {
    const query = `
      UPDATE funcionarios
      SET cargo = $1, contato = $2, dados = $3, cargo_id = $4, updated_at = CURRENT_TIMESTAMP
      WHERE id = $5
      RETURNING *
    `;

    const values = [
      data.cargo,
      JSON.stringify(data.contato || {}),
      JSON.stringify(data.dados || {}),
      data.cargo_id || null,
      id
    ];

    try {
      const result = await db.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Erro ao atualizar funcionário: ${error.message}`);
    }
  }

  static async delete(id) {
    try {
      // Primeiro, verificar se o funcionário tem registros de HH
      const checkQuery = 'SELECT COUNT(*) FROM hh_registros WHERE funcionario_id = $1';
      const checkResult = await db.query(checkQuery, [id]);
      
      if (parseInt(checkResult.rows[0].count) > 0) {
        // Opção 1: Impedir a exclusão
        // throw new Error('Não é possível excluir funcionário com registros de horas');
        
        // Opção 2: Excluir registros relacionados primeiro
        await db.query('DELETE FROM hh_registros WHERE funcionario_id = $1', [id]);
      }
      
      // Excluir o funcionário
      const query = 'DELETE FROM funcionarios WHERE id = $1 RETURNING *';
      const result = await db.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Erro ao excluir funcionário: ${error.message}`);
    }
  }
}

module.exports = FuncionarioModel; 