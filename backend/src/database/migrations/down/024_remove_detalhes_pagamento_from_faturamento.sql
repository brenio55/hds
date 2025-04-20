-- Migração para remover a coluna detalhes_pagamento da tabela faturamento

-- Remover o índice se existir
DROP INDEX IF EXISTS idx_faturamento_detalhes_pagamento;

-- Remover a coluna se existir
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'faturamento' AND column_name = 'detalhes_pagamento'
    ) THEN
        ALTER TABLE faturamento DROP COLUMN detalhes_pagamento;
    END IF;
END $$; 