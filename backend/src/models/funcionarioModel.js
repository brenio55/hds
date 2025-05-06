const db = require('../config/database');

class FuncionarioModel {
  static async create(data) {
    const client = await db.getClient();
    
    try {
      // Iniciar transação
      await client.query('BEGIN');
      
      // Inserir funcionário
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

      const result = await client.query(query, values);
      const funcionario = result.rows[0];
      
      // Se houver propostas associadas, inserir na tabela intermediária
      if (data.propostas && Array.isArray(data.propostas) && data.propostas.length > 0) {
        const propostaValues = data.propostas.map(propostaId => {
          return `(${funcionario.id}, ${propostaId}, CURRENT_DATE, NULL)`;
        }).join(', ');
        
        const interQuery = `
          INSERT INTO inter_func_proposta (funcionario_id, proposta_id, data_inicio, data_fim)
          VALUES ${propostaValues}
          RETURNING *
        `;
        
        await client.query(interQuery);
      }
      
      // Commit da transação
      await client.query('COMMIT');
      
      return funcionario;
    } catch (error) {
      // Rollback em caso de erro
      await client.query('ROLLBACK');
      throw new Error(`Erro ao criar funcionário: ${error.message}`);
    } finally {
      // Liberar o cliente
      client.release();
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
      const funcionarios = result.rows.map(funcionario => {
        // Se o funcionário tiver um cargo associado com valor_hh
        if (funcionario.valor_hh) {
          const valorHH = parseFloat(funcionario.valor_hh);
          funcionario.valor_hh_60 = (valorHH * 1.6).toFixed(2);
          funcionario.valor_hh_100 = (valorHH * 2).toFixed(2);
        }
        return funcionario;
      });
      
      // Buscar as propostas associadas a cada funcionário
      for (const funcionario of funcionarios) {
        const propostasQuery = `
          SELECT p.id, p.descricao, ifp.data_inicio, ifp.data_fim
          FROM inter_func_proposta ifp
          JOIN propostas p ON ifp.proposta_id = p.id
          WHERE ifp.funcionario_id = $1
        `;
        
        const propostasResult = await db.query(propostasQuery, [funcionario.id]);
        funcionario.propostas = propostasResult.rows;
      }
      
      return funcionarios;
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
      
      if (result.rows.length === 0) {
        return null;
      }
      
      const funcionario = result.rows[0];
      
      // Se encontrou o funcionário e ele tem valor_hh, adicionar valores com acréscimos
      if (funcionario.valor_hh) {
        const valorHH = parseFloat(funcionario.valor_hh);
        funcionario.valor_hh_60 = (valorHH * 1.6).toFixed(2);
        funcionario.valor_hh_100 = (valorHH * 2).toFixed(2);
      }
      
      // Buscar propostas associadas ao funcionário
      const propostasQuery = `
        SELECT p.id, p.descricao, ifp.data_inicio, ifp.data_fim
        FROM inter_func_proposta ifp
        JOIN propostas p ON ifp.proposta_id = p.id
        WHERE ifp.funcionario_id = $1
      `;
      
      const propostasResult = await db.query(propostasQuery, [id]);
      funcionario.propostas = propostasResult.rows;
      
      return funcionario;
    } catch (error) {
      throw new Error(`Erro ao buscar funcionário: ${error.message}`);
    }
  }

  static async update(id, data) {
    const client = await db.getClient();
    
    try {
      // Iniciar transação
      await client.query('BEGIN');
      
      // Atualizar funcionário
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

      const result = await client.query(query, values);
      
      if (result.rows.length === 0) {
        // Rollback e retornar null se o funcionário não existir
        await client.query('ROLLBACK');
        return null;
      }
      
      const funcionario = result.rows[0];
      
      // Se houver propostas associadas, atualizar as relações
      if (data.propostas && Array.isArray(data.propostas)) {
        // Primeiro, remover todas as relações existentes
        await client.query('DELETE FROM inter_func_proposta WHERE funcionario_id = $1', [id]);
        
        // Depois, inserir as novas relações se houver propostas
        if (data.propostas.length > 0) {
          const propostaValues = data.propostas.map(propostaId => {
            return `(${funcionario.id}, ${propostaId}, CURRENT_DATE, NULL)`;
          }).join(', ');
          
          const interQuery = `
            INSERT INTO inter_func_proposta (funcionario_id, proposta_id, data_inicio, data_fim)
            VALUES ${propostaValues}
            RETURNING *
          `;
          
          await client.query(interQuery);
        }
      }
      
      // Commit da transação
      await client.query('COMMIT');
      
      return funcionario;
    } catch (error) {
      // Rollback em caso de erro
      await client.query('ROLLBACK');
      throw new Error(`Erro ao atualizar funcionário: ${error.message}`);
    } finally {
      // Liberar o cliente
      client.release();
    }
  }

  static async delete(id) {
    const client = await db.getClient();
    
    try {
      // Iniciar transação
      await client.query('BEGIN');
      
      // Primeiro, remover as relações da tabela intermediária
      await client.query('DELETE FROM inter_func_proposta WHERE funcionario_id = $1', [id]);
      
      // Verificar se o funcionário tem registros de HH
      const checkQuery = 'SELECT COUNT(*) FROM hh_registros WHERE funcionario_id = $1';
      const checkResult = await client.query(checkQuery, [id]);
      
      if (parseInt(checkResult.rows[0].count) > 0) {
        // Excluir registros relacionados primeiro
        await client.query('DELETE FROM hh_registros WHERE funcionario_id = $1', [id]);
      }
      
      // Excluir o funcionário
      const query = 'DELETE FROM funcionarios WHERE id = $1 RETURNING *';
      const result = await client.query(query, [id]);
      
      // Commit da transação
      await client.query('COMMIT');
      
      return result.rows[0];
    } catch (error) {
      // Rollback em caso de erro
      await client.query('ROLLBACK');
      throw new Error(`Erro ao excluir funcionário: ${error.message}`);
    } finally {
      // Liberar o cliente
      client.release();
    }
  }
  
  // Novo método para associar um funcionário a uma proposta
  static async associarProposta(funcionarioId, propostaId, dataInicio = null) {
    const query = `
      INSERT INTO inter_func_proposta (funcionario_id, proposta_id, data_inicio)
      VALUES ($1, $2, $3)
      ON CONFLICT (funcionario_id, proposta_id) DO UPDATE
      SET data_inicio = $3, data_fim = NULL, updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `;
    
    const values = [
      funcionarioId,
      propostaId,
      dataInicio || new Date()
    ];
    
    try {
      const result = await db.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Erro ao associar funcionário à proposta: ${error.message}`);
    }
  }
  
  // Novo método para desassociar um funcionário de uma proposta
  static async desassociarProposta(funcionarioId, propostaId, dataFim = null) {
    const query = `
      UPDATE inter_func_proposta
      SET data_fim = $3, updated_at = CURRENT_TIMESTAMP
      WHERE funcionario_id = $1 AND proposta_id = $2
      RETURNING *
    `;
    
    const values = [
      funcionarioId,
      propostaId,
      dataFim || new Date()
    ];
    
    try {
      const result = await db.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Erro ao desassociar funcionário da proposta: ${error.message}`);
    }
  }
  
  // Método para listar as propostas de um funcionário
  static async listarPropostas(funcionarioId) {
    const query = `
      SELECT p.*, ifp.data_inicio, ifp.data_fim
      FROM inter_func_proposta ifp
      JOIN propostas p ON ifp.proposta_id = p.id
      WHERE ifp.funcionario_id = $1
      ORDER BY ifp.data_inicio DESC
    `;
    
    try {
      const result = await db.query(query, [funcionarioId]);
      return result.rows;
    } catch (error) {
      throw new Error(`Erro ao listar propostas do funcionário: ${error.message}`);
    }
  }
}

module.exports = FuncionarioModel; 