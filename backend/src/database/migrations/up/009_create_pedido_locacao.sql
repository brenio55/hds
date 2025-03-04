CREATE TABLE IF NOT EXISTS public.pedido_locacao (
    id SERIAL PRIMARY KEY,
    fornecedor_id INTEGER REFERENCES public.fornecedores(id),
    itens JSONB,
    total_bruto DECIMAL(15,2),
    total_ipi DECIMAL(15,2),
    total_descontos DECIMAL(15,2),
    valor_frete DECIMAL(15,2),
    outras_despesas DECIMAL(15,2),
    total_final DECIMAL(15,2),
    informacoes_importantes TEXT,
    cond_pagto TEXT,
    prazo_entrega DATE,
    frete DECIMAL(15,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    pdf_uid TEXT
);

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_pedido_locacao_fornecedor ON pedido_locacao(fornecedor_id);
CREATE INDEX IF NOT EXISTS idx_pedido_locacao_itens ON pedido_locacao USING GIN (itens);

-- Comentários
COMMENT ON TABLE pedido_locacao IS 'Tabela para armazenar pedidos de locação';
COMMENT ON COLUMN pedido_locacao.itens IS 'Lista de itens do pedido em formato JSON'; 