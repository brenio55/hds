CREATE TABLE IF NOT EXISTS fornecedores (
    id SERIAL PRIMARY KEY,
    razao_social VARCHAR(255) NOT NULL,
    cnpj VARCHAR(50) NOT NULL,
    inscricao_estadual VARCHAR(50),
    inscricao_municipal VARCHAR(50),
    telefone VARCHAR(50),
    celular VARCHAR(50),
    endereco TEXT,
    cep VARCHAR(50),
    municipio_uf VARCHAR(100),
    email VARCHAR(255),
    contato VARCHAR(255),
    obs TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
); 