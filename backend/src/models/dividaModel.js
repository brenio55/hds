const db = require('../config/database');

class DividaModel {
  static async create(data) {
    const query = `
      INSERT INTO dividas (
        valor,
        detalhes
      )
      VALUES ($1, $2)
      RETURNING *
    `;

    const values = [
      data.valor,
      JSON.stringify(data.detalhes)
    ];

    try {
      const result = await db.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Erro ao criar dívida: ${error.message}`);
    }
  }

  static async update(id, data) {
    const query = `
      UPDATE dividas
      SET valor = $1,
          detalhes = $2
      WHERE id = $3
      RETURNING *
    `;

    const values = [
      data.valor,
      JSON.stringify(data.detalhes),
      id
    ];

    const result = await db.query(query, values);
    return result.rows[0];
  }

  static async findByField(campo, valor) {
    try {
      let query = `SELECT * FROM dividas`;

      // Tratamento especial para campo JSON
      if (campo === 'detalhes') {
        query += ` WHERE detalhes::text ILIKE $1`;
        const result = await db.query(query, [`%${valor}%`]);
        return result.rows;
      }

      // Busca exata para números
      if (campo === 'valor' || campo === 'id') {
        query += ` WHERE ${campo} = $1`;
        const result = await db.query(query, [valor]);
        return result.rows;
      }

      // Busca por data de criação
      if (campo === 'created_at') {
        query += ` WHERE ${campo}::text LIKE $1`;
        const result = await db.query(query, [`%${valor}%`]);
        return result.rows;
      }

      throw new Error('Campo de busca inválido');
    } catch (error) {
      throw new Error(`Erro ao buscar dívidas por ${campo}: ${error.message}`);
    }
  }

  static async findAll() {
    const query = `SELECT * FROM dividas ORDER BY created_at DESC`;
    const result = await db.query(query);
    return result.rows;
  }
}

module.exports = DividaModel; 