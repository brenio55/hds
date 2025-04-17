-- Migração para corrigir a restrição check_valor_faturado na tabela faturamento
-- Esta migração remove a restrição que está limitando o campo valor_faturado a valores percentuais (0-100)

-- Primeiro, vamos verificar se a restrição existe e removê-la
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'check_valor_faturado' AND conrelid = 'faturamento'::regclass
    ) THEN
        -- Remover a restrição existente que limita valores a 0-100
        ALTER TABLE faturamento DROP CONSTRAINT check_valor_faturado;
        
        -- Adicionar uma nova restrição que apenas garante que o valor seja não-negativo
        ALTER TABLE faturamento ADD CONSTRAINT check_valor_faturado_min 
            CHECK (valor_faturado >= 0);
    END IF;
END $$;

-- Também verificar e adicionar restrições para outros campos monetários se existirem
DO $$
BEGIN
    IF EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'faturamento' AND column_name = 'valor_total_pedido'
    ) THEN
        -- Garantir que valor_total_pedido seja não-negativo
        IF NOT EXISTS (
            SELECT 1 FROM pg_constraint 
            WHERE conname = 'check_valor_total_pedido_min' AND conrelid = 'faturamento'::regclass
        ) THEN
            ALTER TABLE faturamento ADD CONSTRAINT check_valor_total_pedido_min 
                CHECK (valor_total_pedido >= 0);
        END IF;
    END IF;
    
    IF EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'faturamento' AND column_name = 'valor_a_faturar'
    ) THEN
        -- Garantir que valor_a_faturar seja não-negativo
        IF NOT EXISTS (
            SELECT 1 FROM pg_constraint 
            WHERE conname = 'check_valor_a_faturar_min' AND conrelid = 'faturamento'::regclass
        ) THEN
            ALTER TABLE faturamento ADD CONSTRAINT check_valor_a_faturar_min 
                CHECK (valor_a_faturar >= 0);
        END IF;
    END IF;
END $$;

-- Migração 022: Restrição check_valor_faturado ajustada - agora permite valores monetários reais em vez de percentuais 