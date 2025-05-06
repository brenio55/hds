const db = require('../config/database');

class HHRegistroModel {
  static async create(data) {
    const query = `
      INSERT INTO hh_registros (
        funcionario_id, 
        obra_id, 
        data_registro, 
        horas_normais, 
        horas_60, 
        horas_100, 
        observacao
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;

    const values = [
      data.funcionario_id,
      data.obra_id,
      data.data_registro || new Date(),
      data.horas_normais || 0,
      data.horas_60 || 0,
      data.horas_100 || 0,
      data.observacao || null
    ];

    try {
      const result = await db.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Erro ao criar registro de HH: ${error.message}`);
    }
  }

  static async findAll(filtros = {}) {
    let query = `
      SELECT r.*, 
             f.id as funcionario_id, 
             f.dados->>'nome' as funcionario_nome,
             c.valor_hh as valor_hh_normal
      FROM hh_registros r
      JOIN funcionarios f ON r.funcionario_id = f.id
      LEFT JOIN cargos c ON f.cargo_id = c.id
      WHERE 1=1
    `;
    
    const values = [];
    let paramCount = 1;
    
    // Adicionar filtros se fornecidos
    if (filtros.funcionario_id) {
      query += ` AND r.funcionario_id = $${paramCount++}`;
      values.push(filtros.funcionario_id);
    }
    
    if (filtros.obra_id) {
      query += ` AND r.obra_id = $${paramCount++}`;
      values.push(filtros.obra_id);
    }
    
    if (filtros.data_inicio && filtros.data_fim) {
      query += ` AND r.data_registro BETWEEN $${paramCount++} AND $${paramCount++}`;
      values.push(filtros.data_inicio, filtros.data_fim);
    } else if (filtros.data_inicio) {
      query += ` AND r.data_registro >= $${paramCount++}`;
      values.push(filtros.data_inicio);
    } else if (filtros.data_fim) {
      query += ` AND r.data_registro <= $${paramCount++}`;
      values.push(filtros.data_fim);
    }
    
    query += ' ORDER BY r.data_registro DESC, r.id DESC';
    
    try {
      const result = await db.query(query, values);
      return result.rows;
    } catch (error) {
      throw new Error(`Erro ao buscar registros de HH: ${error.message}`);
    }
  }

  static async findById(id) {
    const query = `
      SELECT r.*, 
             f.id as funcionario_id, 
             f.dados->>'nome' as funcionario_nome,
             c.valor_hh as valor_hh_normal
      FROM hh_registros r
      JOIN funcionarios f ON r.funcionario_id = f.id
      LEFT JOIN cargos c ON f.cargo_id = c.id
      WHERE r.id = $1
    `;
    
    try {
      const result = await db.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Erro ao buscar registro de HH: ${error.message}`);
    }
  }

  static async update(id, data) {
    const query = `
      UPDATE hh_registros
      SET funcionario_id = $1,
          obra_id = $2,
          data_registro = $3,
          horas_normais = $4,
          horas_60 = $5,
          horas_100 = $6,
          observacao = $7,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $8
      RETURNING *
    `;

    const values = [
      data.funcionario_id,
      data.obra_id,
      data.data_registro || new Date(),
      data.horas_normais || 0,
      data.horas_60 || 0,
      data.horas_100 || 0,
      data.observacao || null,
      id
    ];

    try {
      const result = await db.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Erro ao atualizar registro de HH: ${error.message}`);
    }
  }

  static async delete(id) {
    const query = 'DELETE FROM hh_registros WHERE id = $1 RETURNING *';
    try {
      const result = await db.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Erro ao excluir registro de HH: ${error.message}`);
    }
  }

  // Método para gerar relatório de custos por obra
  static async gerarRelatorioPorObra(obra_id, periodo = {}) {
    let query = `
      SELECT 
        r.obra_id,
        f.id as funcionario_id,
        f.dados->>'nome' as funcionario_nome,
        c.nome as cargo_nome,
        c.valor_hh as valor_hh_normal,
        SUM(r.horas_normais) as total_horas_normais,
        SUM(r.horas_60) as total_horas_60,
        SUM(r.horas_100) as total_horas_100,
        SUM(r.horas_normais * c.valor_hh) as custo_horas_normais,
        SUM(r.horas_60 * c.valor_hh * 1.6) as custo_horas_60,
        SUM(r.horas_100 * c.valor_hh * 2) as custo_horas_100,
        SUM(r.horas_normais * c.valor_hh + r.horas_60 * c.valor_hh * 1.6 + r.horas_100 * c.valor_hh * 2) as custo_total
      FROM hh_registros r
      JOIN funcionarios f ON r.funcionario_id = f.id
      JOIN cargos c ON f.cargo_id = c.id
      WHERE r.obra_id = $1
    `;
    
    const values = [obra_id];
    let paramCount = 2;
    
    // Adicionar filtro de período se fornecido
    if (periodo.data_inicio && periodo.data_fim) {
      query += ` AND r.data_registro BETWEEN $${paramCount++} AND $${paramCount++}`;
      values.push(periodo.data_inicio, periodo.data_fim);
    }
    
    query += `
      GROUP BY r.obra_id, f.id, f.dados->>'nome', c.nome, c.valor_hh
      ORDER BY f.dados->>'nome'
    `;
    
    try {
      const result = await db.query(query, values);
      
      // Calcular totalizadores
      let totalGeral = {
        total_horas_normais: 0,
        total_horas_60: 0,
        total_horas_100: 0,
        custo_horas_normais: 0,
        custo_horas_60: 0,
        custo_horas_100: 0,
        custo_total: 0
      };
      
      result.rows.forEach(row => {
        totalGeral.total_horas_normais += parseFloat(row.total_horas_normais);
        totalGeral.total_horas_60 += parseFloat(row.total_horas_60);
        totalGeral.total_horas_100 += parseFloat(row.total_horas_100);
        totalGeral.custo_horas_normais += parseFloat(row.custo_horas_normais);
        totalGeral.custo_horas_60 += parseFloat(row.custo_horas_60);
        totalGeral.custo_horas_100 += parseFloat(row.custo_horas_100);
        totalGeral.custo_total += parseFloat(row.custo_total);
      });
      
      return {
        detalhes: result.rows,
        totais: totalGeral
      };
    } catch (error) {
      throw new Error(`Erro ao gerar relatório de HH: ${error.message}`);
    }
  }
}

module.exports = HHRegistroModel; 