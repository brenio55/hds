const db = require('../config/database');

class InterFuncPropostaModel {
  static async create(data) {
    const query = `
      INSERT INTO inter_func_proposta (funcionario_id, proposta_id, data_inicio, data_fim)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;

    const values = [
      data.funcionario_id,
      data.proposta_id,
      data.data_inicio || new Date(),
      data.data_fim || null
    ];

    try {
      const result = await db.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Erro ao criar relacionamento: ${error.message}`);
    }
  }

  static async findAll(filtros = {}) {
    let query = `
      SELECT ifp.*, 
             f.contato AS funcionario_contato,
             p.descricao AS proposta_descricao
      FROM inter_func_proposta ifp
      JOIN funcionarios f ON ifp.funcionario_id = f.id
      JOIN propostas p ON ifp.proposta_id = p.id
      WHERE 1=1
    `;
    
    const values = [];
    let paramCount = 1;
    
    // Adicionar filtros se fornecidos
    if (filtros.funcionario_id) {
      query += ` AND ifp.funcionario_id = $${paramCount++}`;
      values.push(filtros.funcionario_id);
    }
    
    if (filtros.proposta_id) {
      query += ` AND ifp.proposta_id = $${paramCount++}`;
      values.push(filtros.proposta_id);
    }
    
    query += ' ORDER BY ifp.data_inicio DESC, ifp.id DESC';
    
    try {
      const result = await db.query(query, values);
      return result.rows;
    } catch (error) {
      throw new Error(`Erro ao buscar relacionamentos: ${error.message}`);
    }
  }

  static async findByIds(funcionarioId, propostaId) {
    const query = `
      SELECT * FROM inter_func_proposta
      WHERE funcionario_id = $1 AND proposta_id = $2
    `;
    
    try {
      const result = await db.query(query, [funcionarioId, propostaId]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Erro ao buscar relacionamento: ${error.message}`);
    }
  }

  static async update(id, data) {
    const query = `
      UPDATE inter_func_proposta
      SET funcionario_id = $1,
          proposta_id = $2,
          data_inicio = $3,
          data_fim = $4,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $5
      RETURNING *
    `;

    const values = [
      data.funcionario_id,
      data.proposta_id,
      data.data_inicio || null,
      data.data_fim || null,
      id
    ];

    try {
      const result = await db.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Erro ao atualizar relacionamento: ${error.message}`);
    }
  }

  static async delete(id) {
    const query = 'DELETE FROM inter_func_proposta WHERE id = $1 RETURNING *';
    try {
      const result = await db.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Erro ao excluir relacionamento: ${error.message}`);
    }
  }

  static async deleteByFuncionarioId(funcionarioId) {
    const query = 'DELETE FROM inter_func_proposta WHERE funcionario_id = $1 RETURNING *';
    try {
      const result = await db.query(query, [funcionarioId]);
      return result.rows;
    } catch (error) {
      throw new Error(`Erro ao excluir relacionamentos do funcionário: ${error.message}`);
    }
  }

  static async deleteByPropostaId(propostaId) {
    const query = 'DELETE FROM inter_func_proposta WHERE proposta_id = $1 RETURNING *';
    try {
      const result = await db.query(query, [propostaId]);
      return result.rows;
    } catch (error) {
      throw new Error(`Erro ao excluir relacionamentos da proposta: ${error.message}`);
    }
  }

  static async getFuncionariosByProposta(propostaId) {
    const query = `
      SELECT f.*, ifp.data_inicio, ifp.data_fim
      FROM inter_func_proposta ifp
      JOIN funcionarios f ON ifp.funcionario_id = f.id
      WHERE ifp.proposta_id = $1
      ORDER BY f.id
    `;
    
    try {
      const result = await db.query(query, [propostaId]);
      return result.rows;
    } catch (error) {
      throw new Error(`Erro ao buscar funcionários da proposta: ${error.message}`);
    }
  }

  static async getPropostasByFuncionario(funcionarioId) {
    const query = `
      SELECT p.*, ifp.data_inicio, ifp.data_fim
      FROM inter_func_proposta ifp
      JOIN propostas p ON ifp.proposta_id = p.id
      WHERE ifp.funcionario_id = $1
      ORDER BY p.id
    `;
    
    try {
      const result = await db.query(query, [funcionarioId]);
      return result.rows;
    } catch (error) {
      throw new Error(`Erro ao buscar propostas do funcionário: ${error.message}`);
    }
  }
}

module.exports = InterFuncPropostaModel; 