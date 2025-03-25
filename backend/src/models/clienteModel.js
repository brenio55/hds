static async findAll() {
  const query = 'SELECT * FROM "clientInfo" ORDER BY nome';
  const result = await db.query(query);
  return result.rows;
}

static async findById(id) {
  const query = 'SELECT * FROM "clientInfo" WHERE id = $1';
  const result = await db.query(query, [id]);
  return result.rows[0];
}

static async create(cliente) {
  const query = `
    INSERT INTO "clientInfo" (nome, endereco, telefone, email, cnpj, contato)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *
  `;
  
  const values = [
    cliente.nome,
    cliente.endereco,
    cliente.telefone,
    cliente.email,
    cliente.cnpj,
    cliente.contato
  ];
  
  const result = await db.query(query, values);
  return result.rows[0];
} 