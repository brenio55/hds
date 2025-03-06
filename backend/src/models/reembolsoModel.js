const db = require('../config/database');

class ReembolsoModel {
  static async create(data) {
    const query = `
      INSERT INTO reembolsos (
        id_funcionarios,
        valor,
        prazo,
        descricao
      )
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;

    const values = [
      data.id_funcionarios,
      data.valor,
      data.prazo,
      data.descricao
    ];

    try {
      const result = await db.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Erro ao criar reembolso: ${error.message}`);
    }
  }

  static async update(id, data) {
    const query = `
      UPDATE reembolsos
      SET id_funcionarios = $1,
          valor = $2,
          prazo = $3,
          descricao = $4
      WHERE id = $5
      RETURNING *
    `;

    const values = [
      data.id_funcionarios,
      data.valor,
      data.prazo,
      data.descricao,
      id
    ];

    const result = await db.query(query, values);
    return result.rows[0];
  }

  static async findByField(campo, valor) {
    try {
      let query = `
        SELECT 
            r.*,
            f.cargo,
            f.contato,
            f.dados
        FROM reembolsos r
        LEFT JOIN funcionarios f ON r.id_funcionarios = f.id
      `;

      // Tratamento para campos de data
      if (campo === 'prazo' || campo === 'created_at') {
        query += `WHERE r.${campo}::text LIKE $1`;
        const result = await db.query(query, [`%${valor}%`]);
        return result.rows;
      }

      // Busca case-insensitive para campos de texto
      if (campo === 'descricao') {
        query += `WHERE r.${campo} ILIKE $1`;
        const result = await db.query(query, [`%${valor}%`]);
        return result.rows;
      }

      // Busca exata para números e outros tipos
      query += `WHERE r.${campo} = $1`;
      const result = await db.query(query, [valor]);
      
      // Formatar o resultado
      return result.rows.map(row => {
        const funcionario = {
          cargo: row.cargo,
          contato: row.contato,
          dados: row.dados
        };
        
        delete row.cargo;
        delete row.contato;
        delete row.dados;
        
        return {
          ...row,
          funcionario
        };
      });
    } catch (error) {
      throw new Error(`Erro ao buscar reembolsos por ${campo}: ${error.message}`);
    }
  }

  static async findAll() {
    const query = `
        SELECT 
            r.*,
            f.cargo as funcionario_cargo,
            f.contato->>'nome' as funcionario_nome,
            f.contato->>'email' as funcionario_email
        FROM reembolsos r
        LEFT JOIN funcionarios f ON r.id_funcionarios = f.id
        ORDER BY r.created_at DESC
    `;
    const result = await db.query(query);
    return result.rows;
  }
}

module.exports = ReembolsoModel; 