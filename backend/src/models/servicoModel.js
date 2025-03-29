const db = require('../config/database');

class ServicoModel {
  static async create(data) {
    console.log("========== INÍCIO - CREATE SERVIÇO MODEL ==========");
    console.log("Dados recebidos para criar serviço:", JSON.stringify(data, null, 2));
    
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
    
    console.log("Query SQL:", query);
    console.log("Valores para a query:", JSON.stringify(values, null, 2));

    try {
      const result = await db.query(query, values);
      console.log("Resultado da inserção:", JSON.stringify(result.rows[0], null, 2));
      console.log("========== FIM - CREATE SERVIÇO MODEL ==========");
      return result.rows[0];
    } catch (error) {
      console.error("Erro ao criar serviço no banco de dados:", error);
      console.error("Stack trace:", error.stack);
      throw error;
    }
  }

  static async findById(id) {
    console.log(`========== INÍCIO - FIND SERVIÇO BY ID: ${id} ==========`);
    
    const query = 'SELECT * FROM servico WHERE id = $1';
    console.log("Query SQL:", query);
    console.log("Valores:", [id]);
    
    try {
      const result = await db.query(query, [id]);
      
      if (result.rows.length === 0) {
        console.log(`Nenhum serviço encontrado com ID: ${id}`);
        console.log("========== FIM - FIND SERVIÇO BY ID ==========");
        return null;
      }
      
      console.log("Serviço encontrado:", JSON.stringify(result.rows[0], null, 2));
      console.log("========== FIM - FIND SERVIÇO BY ID ==========");
      return result.rows[0];
    } catch (error) {
      console.error(`Erro ao buscar serviço com ID ${id}:`, error);
      console.error("Stack trace:", error.stack);
      throw error;
    }
  }

  static async findAll() {
    console.log("========== INÍCIO - FIND ALL SERVIÇOS ==========");
    
    const query = 'SELECT * FROM servico ORDER BY created_at DESC';
    console.log("Query SQL:", query);
    
    try {
      const result = await db.query(query);
      console.log(`Encontrados ${result.rows.length} serviços`);
      console.log("========== FIM - FIND ALL SERVIÇOS ==========");
      return result.rows;
    } catch (error) {
      console.error("Erro ao listar serviços:", error);
      console.error("Stack trace:", error.stack);
      throw error;
    }
  }

  static async update(id, data) {
    console.log(`========== INÍCIO - UPDATE SERVIÇO ID: ${id} ==========`);
    console.log("Dados recebidos para atualização:", JSON.stringify(data, null, 2));
    
    const query = `
      UPDATE servico
      SET 
        fornecedor_id = $1,
        data_vencimento = $2,
        proposta_id = $3,
        itens = $4,
        pdf_uid = $5
      WHERE id = $6
      RETURNING *
    `;

    const values = [
      data.fornecedor_id,
      data.data_vencimento,
      data.proposta_id,
      data.itens,
      data.pdf_uid,
      id
    ];
    
    console.log("Query SQL:", query);
    console.log("Valores para a query:", JSON.stringify(values, null, 2));

    try {
      const result = await db.query(query, values);
      
      if (result.rows.length === 0) {
        console.log(`Nenhum serviço encontrado com ID: ${id} para atualizar`);
        console.log("========== FIM - UPDATE SERVIÇO ==========");
        return null;
      }
      
      console.log("Serviço atualizado:", JSON.stringify(result.rows[0], null, 2));
      console.log("========== FIM - UPDATE SERVIÇO ==========");
      return result.rows[0];
    } catch (error) {
      console.error(`Erro ao atualizar serviço com ID ${id}:`, error);
      console.error("Stack trace:", error.stack);
      throw error;
    }
  }

  static async delete(id) {
    console.log(`========== INÍCIO - DELETE SERVIÇO ID: ${id} ==========`);
    
    const query = 'DELETE FROM servico WHERE id = $1 RETURNING *';
    console.log("Query SQL:", query);
    console.log("Valores:", [id]);
    
    try {
      const result = await db.query(query, [id]);
      
      if (result.rows.length === 0) {
        console.log(`Nenhum serviço encontrado com ID: ${id} para deletar`);
        console.log("========== FIM - DELETE SERVIÇO ==========");
        return null;
      }
      
      console.log("Serviço deletado:", JSON.stringify(result.rows[0], null, 2));
      console.log("========== FIM - DELETE SERVIÇO ==========");
      return result.rows[0];
    } catch (error) {
      console.error(`Erro ao deletar serviço com ID ${id}:`, error);
      console.error("Stack trace:", error.stack);
      throw error;
    }
  }

  static async findByField(campo, valor) {
    console.log(`========== INÍCIO - FIND SERVIÇO BY FIELD: ${campo} = ${valor} ==========`);
    
    try {
      let query = 'SELECT * FROM servico WHERE ';
      let params = [];
      
      if (campo === 'itens') {
        // Busca em campos JSON
        query += `itens::text ILIKE '%${valor}%'`;
        console.log("Busca em campo JSON");
      } else if (['id', 'fornecedor_id', 'proposta_id'].includes(campo)) {
        // Busca exata para IDs
        query += `${campo} = $1`;
        params.push(valor);
        console.log("Busca exata por ID");
      } else if (campo === 'data_vencimento') {
        // Busca exata para data
        query += `${campo}::text = $1`;
        params.push(valor);
        console.log("Busca por data");
      } else {
        console.log(`Campo de busca inválido: ${campo}`);
        throw new Error('Campo de busca inválido');
      }

      query += ' ORDER BY created_at DESC';
      console.log("Query SQL:", query);
      console.log("Parâmetros:", params);
      
      const result = await db.query(query, params);
      console.log(`Encontrados ${result.rows.length} serviços com ${campo} = ${valor}`);
      console.log("========== FIM - FIND SERVIÇO BY FIELD ==========");
      
      return result.rows;
    } catch (error) {
      console.error(`Erro ao buscar por ${campo}:`, error);
      console.error("Stack trace:", error.stack);
      throw new Error(`Erro ao buscar por ${campo}: ${error.message}`);
    }
  }
}

module.exports = ServicoModel; 