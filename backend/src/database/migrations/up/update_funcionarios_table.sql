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

-- Criar tabela de relacionamento entre funcionários e propostas (obras)
CREATE TABLE IF NOT EXISTS inter_func_proposta (
    id SERIAL PRIMARY KEY,
    funcionario_id INTEGER NOT NULL REFERENCES funcionarios(id) ON DELETE CASCADE,
    proposta_id INTEGER NOT NULL REFERENCES propostas(id) ON DELETE CASCADE,
    data_inicio DATE,
    data_fim DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(funcionario_id, proposta_id) -- Garantir que não haja duplicidade na relação
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_inter_func_proposta_funcionario ON inter_func_proposta(funcionario_id);
CREATE INDEX IF NOT EXISTS idx_inter_func_proposta_proposta ON inter_func_proposta(proposta_id);

-- Comentários para documentação
COMMENT ON TABLE inter_func_proposta IS 'Tabela de relacionamento entre funcionários e propostas/obras';
COMMENT ON COLUMN inter_func_proposta.id IS 'Identificador único do relacionamento';
COMMENT ON COLUMN inter_func_proposta.funcionario_id IS 'ID do funcionário relacionado';
COMMENT ON COLUMN inter_func_proposta.proposta_id IS 'ID da proposta/obra relacionada';
COMMENT ON COLUMN inter_func_proposta.data_inicio IS 'Data de início da alocação do funcionário na obra';
COMMENT ON COLUMN inter_func_proposta.data_fim IS 'Data de término da alocação do funcionário na obra';
COMMENT ON COLUMN inter_func_proposta.created_at IS 'Data de criação do registro';
COMMENT ON COLUMN inter_func_proposta.updated_at IS 'Data da última atualização do registro'; 