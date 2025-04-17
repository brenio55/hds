-- Migração para restaurar a restrição check_valor_faturado na tabela faturamento
-- Esta migração restaura a restrição original que limitava o valor_faturado a percentuais (0-100)

-- Remover as novas restrições
DO $$
BEGIN
    -- Remover a restrição para valor_faturado
    IF EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'check_valor_faturado_min' AND conrelid = 'faturamento'::regclass
    ) THEN
        ALTER TABLE faturamento DROP CONSTRAINT check_valor_faturado_min;
    END IF;
    
    -- Remover a restrição para valor_total_pedido se existir
    IF EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'check_valor_total_pedido_min' AND conrelid = 'faturamento'::regclass
    ) THEN
        ALTER TABLE faturamento DROP CONSTRAINT check_valor_total_pedido_min;
    END IF;
    
    -- Remover a restrição para valor_a_faturar se existir
    IF EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'check_valor_a_faturar_min' AND conrelid = 'faturamento'::regclass
    ) THEN
        ALTER TABLE faturamento DROP CONSTRAINT check_valor_a_faturar_min;
    END IF;
    
    -- Recriar a restrição original
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'check_valor_faturado' AND conrelid = 'faturamento'::regclass
    ) THEN
        -- Recriar a restrição com sua definição original (limitando a 0-100 para percentuais)
        ALTER TABLE faturamento ADD CONSTRAINT check_valor_faturado 
            CHECK (valor_faturado >= 0 AND valor_faturado <= 100);
    END IF;
END $$;

-- Migração 022 revertida: Restrição check_valor_faturado restaurada para valores percentuais 