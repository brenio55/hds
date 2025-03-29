const db = require('../config/database');

class ClientInfoModel {
  static async findById(id) {
    const query = 'SELECT * FROM "clientInfo" WHERE id = $1';
    const result = await db.query(query, [id]);
    return result.rows[0];
  }

  static async findAll() {
    const query = 'SELECT * FROM "clientInfo" ORDER BY "RazaoSocial"';
    const result = await db.query(query);
    return result.rows;
  }

  static async create(data) {
    const query = `
      INSERT INTO "clientInfo" (
        "RazaoSocial", 
        "CNPJ", 
        "Endereço", 
        "Telefone", 
        "InscricaoEstadual", 
        "InscricaoMunicipal", 
        "clientCode"
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;

    const values = [
      data.RazaoSocial,
      data.CNPJ,
      data.Endereço,
      data.Telefone,
      data.InscricaoEstadual,
      data.InscricaoMunicipal,
      data.clientCode
    ];

    const result = await db.query(query, values);
    return result.rows[0];
  }

  static async update(id, data) {
    const query = `
      UPDATE "clientInfo"
      SET 
        "RazaoSocial" = $1,
        "CNPJ" = $2,
        "Endereço" = $3,
        "Telefone" = $4,
        "InscricaoEstadual" = $5,
        "InscricaoMunicipal" = $6,
        "clientCode" = $7
      WHERE id = $8
      RETURNING *
    `;

    const values = [
      data.RazaoSocial,
      data.CNPJ,
      data.Endereço,
      data.Telefone,
      data.InscricaoEstadual,
      data.InscricaoMunicipal,
      data.clientCode,
      id
    ];

    const result = await db.query(query, values);
    return result.rows[0];
  }

  static async delete(id) {
    const query = 'DELETE FROM "clientInfo" WHERE id = $1 RETURNING *';
    const result = await db.query(query, [id]);
    return result.rows[0];
  }

  static async findByField(field, value) {
    const query = `
      SELECT * FROM "clientInfo" 
      WHERE ${field}::text ILIKE $1
      ORDER BY "RazaoSocial"
    `;
    
    const result = await db.query(query, [`%${value}%`]);
    return result.rows;
  }
}

module.exports = ClientInfoModel; 