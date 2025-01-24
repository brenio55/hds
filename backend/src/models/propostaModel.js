const db = require('../config/database');

class PropostaModel {
  static async create(propostaData) {
    const query = `
      INSERT INTO propostas (
        descricao, data_emissao, client_info, versao,
        documento_text, especificacoes_html, afazer_hds,
        afazer_contratante, naofazer_hds, valor_final, user_id
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `;

    const valor_final = typeof propostaData.valor_final === 'string' 
      ? parseFloat(propostaData.valor_final.replace(/\./g, '').replace(',', '.'))
      : propostaData.valor_final;

    const values = [
      propostaData.descricao,
      propostaData.data_emissao,
      JSON.stringify(propostaData.client_info),
      propostaData.versao,
      propostaData.documento_text || '[padrao]',
      propostaData.especificacoes_html,
      JSON.stringify(propostaData.afazer_hds || []),
      JSON.stringify(propostaData.afazer_contratante || []),
      JSON.stringify(propostaData.naofazer_hds || []),
      valor_final,
      propostaData.user_id
    ];

    const result = await db.query(query, values);
    return result.rows[0];
  }

  static async findByField(field, value) {
    const query = `
      SELECT * FROM propostas 
      WHERE ${field}::text ILIKE $1
    `;
    
    const result = await db.query(query, [`%${value}%`]);
    return result.rows;
  }

  static async findById(id) {
    const query = 'SELECT * FROM propostas WHERE id = $1';
    const result = await db.query(query, [id]);
    return result.rows[0];
  }
}

module.exports = PropostaModel; 