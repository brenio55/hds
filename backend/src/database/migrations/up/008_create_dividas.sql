CREATE TABLE IF NOT EXISTS public.dividas (
    id SERIAL PRIMARY KEY,
    valor DECIMAL(15,2),
    detalhes JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Criar índice para busca em JSON
CREATE INDEX IF NOT EXISTS idx_dividas_detalhes ON dividas USING GIN (detalhes);

-- Comentários para documentação
COMMENT ON TABLE dividas IS 'Tabela para armazenar dívidas';
COMMENT ON COLUMN dividas.id IS 'Identificador único da dívida';
COMMENT ON COLUMN dividas.valor IS 'Valor da dívida';
COMMENT ON COLUMN dividas.detalhes IS 'Detalhes adicionais em formato JSON'; 