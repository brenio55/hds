DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tipo_pedido') THEN
        CREATE TYPE tipo_pedido AS ENUM ('compra', 'locacao', 'servico');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tipo_pagamento') THEN
        CREATE TYPE tipo_pagamento AS ENUM ('pix', 'boleto', 'ted');
    END IF;
END$$;

CREATE TABLE IF NOT EXISTS public.faturamento (
    id SERIAL PRIMARY KEY,
    id_number INTEGER NOT NULL,
    id_type tipo_pedido NOT NULL,
    valor_total_pedido DECIMAL(15,2) NOT NULL,
    valor_faturado DECIMAL(5,2) NOT NULL, -- Porcentagem
    valor_a_faturar DECIMAL(15,2) NOT NULL,
    data_vencimento DATE NOT NULL,
    nf NUMERIC(50),
    nf_anexo TEXT, -- Para armazenar base64
    pagamento tipo_pagamento NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_valor_faturado CHECK (valor_faturado >= 0 AND valor_faturado <= 100)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_faturamento_id_type_number ON faturamento(id_type, id_number);
CREATE INDEX IF NOT EXISTS idx_faturamento_data_vencimento ON faturamento(data_vencimento);

-- Comentários
COMMENT ON TABLE faturamento IS 'Tabela para controle de faturamento dos pedidos';
COMMENT ON COLUMN faturamento.id_type IS 'Tipo do pedido (compra, locacao, servico)';
COMMENT ON COLUMN faturamento.valor_faturado IS 'Porcentagem já faturada (0-100)'; 