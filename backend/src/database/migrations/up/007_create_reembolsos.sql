CREATE TABLE IF NOT EXISTS public.reembolsos (
    id SERIAL PRIMARY KEY,
    id_funcionarios INTEGER REFERENCES public.funcionarios(id),
    valor DECIMAL(10,2),
    prazo DATE,
    descricao TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Criar índice para melhor performance em buscas por funcionário
CREATE INDEX IF NOT EXISTS idx_reembolsos_funcionario ON reembolsos(id_funcionarios);

-- Comentários para documentação
COMMENT ON TABLE reembolsos IS 'Tabela para armazenar reembolsos dos funcionários';
COMMENT ON COLUMN reembolsos.id IS 'Identificador único do reembolso';
COMMENT ON COLUMN reembolsos.id_funcionarios IS 'ID do funcionário associado ao reembolso';
COMMENT ON COLUMN reembolsos.valor IS 'Valor do reembolso';
COMMENT ON COLUMN reembolsos.prazo IS 'Data limite para o reembolso';
COMMENT ON COLUMN reembolsos.descricao IS 'Descrição do motivo do reembolso';
COMMENT ON COLUMN reembolsos.created_at IS 'Data de criação do registro'; 