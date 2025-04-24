-- Adicionar colunas na tabela de funcionários para relacionamento com cargos e informações de HH
ALTER TABLE funcionarios
    -- Adicionar referência para tabela de cargos
    ADD COLUMN IF NOT EXISTS cargo_id INTEGER REFERENCES cargos(id) ON DELETE SET NULL,
    -- Adicionar timestamp para controle de criação/atualização
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

-- Criar índice para a coluna cargo_id
CREATE INDEX IF NOT EXISTS idx_funcionarios_cargo_id ON funcionarios(cargo_id);

-- Comentários para documentação
COMMENT ON COLUMN funcionarios.cargo_id IS 'Referência ao cargo do funcionário na tabela cargos';
COMMENT ON COLUMN funcionarios.created_at IS 'Data de criação do registro';
COMMENT ON COLUMN funcionarios.updated_at IS 'Data da última atualização do registro'; 