CREATE TABLE IF NOT EXISTS public.servico (
    id SERIAL PRIMARY KEY,
    fornecedor_id INTEGER REFERENCES public.fornecedores(id),
    data_vencimento DATE,
    proposta_id INTEGER,
    itens JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_servico_fornecedor ON servico(fornecedor_id);
CREATE INDEX IF NOT EXISTS idx_servico_itens ON servico USING GIN (itens);

-- Comentários
COMMENT ON TABLE servico IS 'Tabela para armazenar serviços';
COMMENT ON COLUMN servico.itens IS 'Detalhes do serviço em formato JSON';

ALTER TABLE public.servico
ADD COLUMN IF NOT EXISTS pdf_uid TEXT; 