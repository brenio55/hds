const db = require('../config/database');

class FornecedorModel {
  static async create(data) {
    const query = `
      INSERT INTO fornecedores (
        razao_social, cnpj, inscricao_estadual, inscricao_municipal,
        telefone, celular, endereco, cep, municipio_uf, email, contato, obs
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `;

    const values = [
      data.razao_social,
      data.cnpj,
      data.inscricao_estadual,
      data.inscricao_municipal,
      data.telefone,
      data.celular,
      data.endereco,
      data.cep,
      data.municipio_uf,
      data.email,
      data.contato,
      data.obs
    ];

    const result = await db.query(query, values);
    return result.rows[0];
  }

  static async findAll() {
    const query = 'SELECT * FROM fornecedores ORDER BY razao_social';
    const result = await db.query(query);
    return result.rows;
  }

  static async findById(id) {
    const query = 'SELECT * FROM fornecedores WHERE id = $1';
    const result = await db.query(query, [id]);
    return result.rows[0];
  }

  static async update(id, data) {
    const query = `
      UPDATE fornecedores
      SET razao_social = $1, cnpj = $2, inscricao_estadual = $3,
          inscricao_municipal = $4, telefone = $5, celular = $6,
          endereco = $7, cep = $8, municipio_uf = $9,
          email = $10, contato = $11, obs = $12
      WHERE id = $13
      RETURNING *
    `;

    const values = [
      data.razao_social,
      data.cnpj,
      data.inscricao_estadual,
      data.inscricao_municipal,
      data.telefone,
      data.celular,
      data.endereco,
      data.cep,
      data.municipio_uf,
      data.email,
      data.contato,
      data.obs,
      id
    ];

    const result = await db.query(query, values);
    return result.rows[0];
  }
}

module.exports = FornecedorModel; 