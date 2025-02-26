-- Criar tabela de funcionários
CREATE TABLE IF NOT EXISTS funcionarios (
    id SERIAL PRIMARY KEY,
    cargo VARCHAR(100),
    contato JSON,
    dados JSON
);

-- Criar índices para melhor performance em buscas
CREATE INDEX IF NOT EXISTS idx_funcionarios_cargo ON funcionarios(cargo);
CREATE INDEX IF NOT EXISTS idx_funcionarios_contato ON funcionarios USING GIN (contato);
CREATE INDEX IF NOT EXISTS idx_funcionarios_dados ON funcionarios USING GIN (dados);

-- Comentários para documentação
COMMENT ON TABLE funcionarios IS 'Tabela para armazenar informações dos funcionários';
COMMENT ON COLUMN funcionarios.id IS 'Identificador único do funcionário';
COMMENT ON COLUMN funcionarios.cargo IS 'Cargo/função do funcionário';
COMMENT ON COLUMN funcionarios.contato IS 'Informações de contato em formato JSON (email, telefone, etc)';
COMMENT ON COLUMN funcionarios.dados IS 'Dados adicionais do funcionário em formato JSON'; 