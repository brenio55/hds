CREATE TABLE IF NOT EXISTS public.funcionarios (
    id SERIAL PRIMARY KEY,
    cargo VARCHAR(100),
    contato JSON,
    dados JSON
);

-- Comentários para documentação
COMMENT ON TABLE funcionarios IS 'Tabela para armazenar informações dos funcionários';
COMMENT ON COLUMN funcionarios.id IS 'Identificador único do funcionário';
COMMENT ON COLUMN funcionarios.cargo IS 'Cargo/função do funcionário';
COMMENT ON COLUMN funcionarios.contato IS 'Informações de contato em formato JSON';
COMMENT ON COLUMN funcionarios.dados IS 'Dados adicionais do funcionário em formato JSON'; 