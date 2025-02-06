CREATE TABLE IF NOT EXISTS fornecedores (
    id SERIAL PRIMARY KEY,
    razao_social VARCHAR(255) NOT NULL,
    cnpj VARCHAR(14) NOT NULL,
    inscricao_estadual VARCHAR(20),
    inscricao_municipal VARCHAR(20),
    telefone VARCHAR(20),
    celular VARCHAR(20),
    endereco TEXT,
    cep VARCHAR(8),
    municipio_uf VARCHAR(100),
    email VARCHAR(255),
    contato VARCHAR(255),
    obs TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
); 