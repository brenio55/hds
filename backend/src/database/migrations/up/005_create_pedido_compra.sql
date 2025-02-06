CREATE TABLE IF NOT EXISTS pedido_compra (
    id SERIAL PRIMARY KEY,
    clientinfo_id INTEGER,
    fornecedores_id INTEGER,
    ddl INTEGER,
    data_vencimento DATE,
    proposta_id INTEGER,
    materiais JSONB,
    desconto DECIMAL(5,2),
    valor_frete DECIMAL(10,2),
    despesas_adicionais DECIMAL(10,2),
    dados_adicionais TEXT,
    frete JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
); 