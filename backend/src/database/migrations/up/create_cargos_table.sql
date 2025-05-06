-- Criar tabela de cargos
CREATE TABLE IF NOT EXISTS cargos (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    valor_hh DECIMAL(10, 2) NOT NULL, -- Valor do HH normal
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Criar índices para melhor performance em buscas
CREATE INDEX IF NOT EXISTS idx_cargos_nome ON cargos(nome);

-- Comentários para documentação
COMMENT ON TABLE cargos IS 'Tabela para armazenar informações sobre cargos disponíveis';
COMMENT ON COLUMN cargos.id IS 'Identificador único do cargo';
COMMENT ON COLUMN cargos.nome IS 'Nome do cargo';
COMMENT ON COLUMN cargos.descricao IS 'Descrição do cargo';
COMMENT ON COLUMN cargos.valor_hh IS 'Valor do Homem-Hora (HH) para o cargo';
COMMENT ON COLUMN cargos.created_at IS 'Data de criação do registro';
COMMENT ON COLUMN cargos.updated_at IS 'Data da última atualização do registro'; 