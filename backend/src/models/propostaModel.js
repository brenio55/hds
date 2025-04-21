const db = require('../config/database');

class PropostaModel {
  static async create(propostaData) {
    const query = `
      INSERT INTO propostas (
        descricao, data_emissao, client_info, versao,
        documento_text, especificacoes_html, afazer_hds,
        afazer_contratante, naofazer_hds, valor_final, user_id,
        proposta_itens
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `;

    const values = [
      propostaData.descricao,
      propostaData.data_emissao,
      typeof propostaData.client_info === 'string' 
        ? propostaData.client_info 
        : JSON.stringify(propostaData.client_info),
      propostaData.versao,
      propostaData.documento_text || '[padrao]',
      propostaData.especificacoes_html,
      typeof propostaData.afazer_hds === 'string'
        ? propostaData.afazer_hds
        : JSON.stringify(propostaData.afazer_hds || []),
      typeof propostaData.afazer_contratante === 'string'
        ? propostaData.afazer_contratante
        : JSON.stringify(propostaData.afazer_contratante || []),
      typeof propostaData.naofazer_hds === 'string'
        ? propostaData.naofazer_hds
        : JSON.stringify(propostaData.naofazer_hds || []),
      typeof propostaData.valor_final === 'string' 
        ? parseFloat(propostaData.valor_final.replace(/\./g, '').replace(',', '.'))
        : propostaData.valor_final,
      propostaData.user_id,
      typeof propostaData.proposta_itens === 'string'
        ? propostaData.proposta_itens
        : JSON.stringify(propostaData.proposta_itens || [])
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

  static async updatePdfVersion(id, versao, pdfUid) {
    const query = `
      UPDATE propostas 
      SET pdf_versions = pdf_versions || $1
      WHERE id = $2
      RETURNING *
    `;

    const pdfVersions = {};
    pdfVersions[versao] = pdfUid;

    const result = await db.query(query, [pdfVersions, id]);
    return result.rows[0];
  }

  static async findAll() {
    const query = 'SELECT * FROM propostas ORDER BY created_at DESC';
    const result = await db.query(query);
    return result.rows;
  }

  static async findByParams(params) {
    let conditions = [];
    let values = [];
    let paramIndex = 1;

    for (const [key, value] of Object.entries(params)) {
      if (key.includes('client_info.')) {
        // Busca em campos JSON
        const field = key.split('.')[1];
        conditions.push(`client_info->>'${field}' ILIKE $${paramIndex}`);
      } else if (key.includes('proposta_itens.')) {
        // Busca em campos do array proposta_itens
        const field = key.split('.')[1];
        conditions.push(`EXISTS (
          SELECT 1 FROM jsonb_array_elements(proposta_itens) as item
          WHERE item->>'${field}' ILIKE $${paramIndex}
        )`);
      } else {
        // Busca em campos normais
        conditions.push(`${key}::text ILIKE $${paramIndex}`);
      }
      values.push(`%${value}%`);
      paramIndex++;
    }

    const query = `
      SELECT * FROM propostas 
      WHERE ${conditions.join(' AND ')}
      ORDER BY created_at DESC
    `;

    const result = await db.query(query, values);
    return result.rows;
  }
  
  static async update(id, propostaData) {
    const fieldsToUpdate = [];
    const values = [];
    let paramIndex = 1;

    // Adicionar campos para atualização
    for (const [key, value] of Object.entries(propostaData)) {
      if (key === 'id' || key === 'created_at') continue; // Pular campos que não devem ser atualizados
      
      // Tratar campos específicos
      if (key === 'client_info' || key === 'afazer_hds' || key === 'afazer_contratante' || key === 'naofazer_hds' || key === 'proposta_itens') {
        fieldsToUpdate.push(`${key} = $${paramIndex}`);
        values.push(typeof value === 'string' ? value : JSON.stringify(value || []));
      } else if (key === 'valor_final' && typeof value === 'string') {
        fieldsToUpdate.push(`${key} = $${paramIndex}`);
        values.push(parseFloat(value.replace(/\./g, '').replace(',', '.')));
      } else {
        fieldsToUpdate.push(`${key} = $${paramIndex}`);
        values.push(value);
      }
      
      paramIndex++;
    }

    // Adicionar o ID como último parâmetro
    values.push(id);

    // Construir a query
    const query = `
      UPDATE propostas 
      SET ${fieldsToUpdate.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await db.query(query, values);
    return result.rows[0];
  }
}

module.exports = PropostaModel; 