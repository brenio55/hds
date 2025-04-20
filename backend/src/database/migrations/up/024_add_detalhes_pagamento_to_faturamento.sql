-- Migração para adicionar a coluna detalhes_pagamento à tabela faturamento
-- Esta coluna armazenará detalhes específicos para cada tipo de pagamento

-- Adicionar a coluna detalhes_pagamento se não existir
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'faturamento' AND column_name = 'detalhes_pagamento'
    ) THEN
        ALTER TABLE faturamento ADD COLUMN detalhes_pagamento JSONB DEFAULT '{}';
    END IF;
END $$;

-- Adicionar índice para busca eficiente no campo JSONB
CREATE INDEX IF NOT EXISTS idx_faturamento_detalhes_pagamento ON faturamento USING GIN (detalhes_pagamento);

-- Adicionar comentário explicativo sobre a estrutura e propósito do campo
COMMENT ON COLUMN faturamento.detalhes_pagamento IS 'Detalhes específicos do pagamento em formato JSON. Para boleto: número do boleto. Para pix e ted: dados da conta. Inclui também anexo_id para referência ao arquivo anexado.'; 