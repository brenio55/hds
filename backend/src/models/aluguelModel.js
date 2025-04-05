const db = require('../config/database');

class AluguelModel {
  static async create(data) {
    const query = `
      INSERT INTO aluguel (
        valor,
        detalhes
      )
      VALUES ($1, $2)
      RETURNING *
    `;

    const values = [
      data.valor,
      data.detalhes
    ];

    try {
      const result = await db.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error('Erro ao criar aluguel:', error);
      throw error;
    }
  }

  static async findById(id) {
    const query = `
      SELECT a.*, c.descricao as obra_descricao
      FROM aluguel a
      LEFT JOIN custoobra c ON (a.detalhes->>'obra_id')::integer = c.id
      WHERE a.id = $1
    `;
    
    const result = await db.query(query, [id]);
    return result.rows[0];
  }

  static async findAll() {
    const query = 'SELECT * FROM aluguel ORDER BY created_at DESC';
    const result = await db.query(query);
    return result.rows;
  }

  static async update(id, data) {
    const query = `
      UPDATE aluguel
      SET valor = $1,
          detalhes = $2
      WHERE id = $3
      RETURNING *
    `;

    const values = [
      data.valor,
      data.detalhes,
      id
    ];

    const result = await db.query(query, values);
    return result.rows[0];
  }

  static async delete(id) {
    const query = 'DELETE FROM aluguel WHERE id = $1 RETURNING *';
    const result = await db.query(query, [id]);
    return result.rows[0];
  }

  static async findByParams(params) {
    try {
      let query = `
        SELECT a.*
        FROM aluguel a
        WHERE 1=1
      `;
      
      const values = [];
      let paramCount = 1;

      // Filtro por data inicial
      if (params.data_inicial) {
        query += ` AND a.created_at >= $${paramCount}`;
        values.push(params.data_inicial);
        paramCount++;
      }

      // Filtro por campo específico
      if (params.campo && params.valor) {
        switch (params.campo) {
          case 'id':
            query += ` AND a.id = $${paramCount}`;
            values.push(params.valor);
            break;
          case 'valor':
            query += ` AND a.valor::text LIKE $${paramCount}`;
            values.push(`%${params.valor}%`);
            break;
          case 'obra_id':
            // Busca específica no campo JSONB
            query += ` AND (a.detalhes->>'obra_id')::integer = $${paramCount}`;
            values.push(params.valor);
            break;
          case 'dia_vencimento':
            query += ` AND (a.detalhes->>'dia_vencimento')::integer = $${paramCount}`;
            values.push(params.valor);
            break;
          case 'pagamento':
            query += ` AND a.detalhes->>'pagamento' ILIKE $${paramCount}`;
            values.push(`%${params.valor}%`);
            break;
          case 'observacoes':
            query += ` AND a.detalhes->>'observacoes' ILIKE $${paramCount}`;
            values.push(`%${params.valor}%`);
            break;
          default:
            throw new Error('Campo de busca inválido');
        }
      }

      query += ' ORDER BY a.created_at DESC';

      console.log('Query:', query);
      console.log('Values:', values);

      const result = await db.query(query, values);
      return result.rows;
    } catch (error) {
      console.error('Erro ao buscar aluguéis:', error);
      throw error;
    }
  }
}

module.exports = AluguelModel; 