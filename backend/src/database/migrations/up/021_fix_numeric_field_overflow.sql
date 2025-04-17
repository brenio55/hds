-- Migração para corrigir o problema de numeric field overflow
-- Aumenta a precisão de todos os campos numéricos para suportar valores maiores

-- Tabela pedido_compra
ALTER TABLE pedido_compra 
    ALTER COLUMN desconto TYPE NUMERIC(19,4),
    ALTER COLUMN valor_frete TYPE NUMERIC(19,4),
    ALTER COLUMN despesas_adicionais TYPE NUMERIC(19,4);

-- Tabela servico
ALTER TABLE servico 
    ALTER COLUMN total TYPE NUMERIC(19,4);

-- Tabela pedido_locacao
ALTER TABLE pedido_locacao
    ALTER COLUMN total_bruto TYPE NUMERIC(19,4),
    ALTER COLUMN total_ipi TYPE NUMERIC(19,4),
    ALTER COLUMN total_descontos TYPE NUMERIC(19,4),
    ALTER COLUMN valor_frete TYPE NUMERIC(19,4),
    ALTER COLUMN outras_despesas TYPE NUMERIC(19,4),
    ALTER COLUMN total_final TYPE NUMERIC(19,4),
    ALTER COLUMN frete TYPE NUMERIC(19,4);

-- Tabela faturamento (verificar se existe a coluna valor_total_pedido)
DO $$
BEGIN
    IF EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'faturamento' AND column_name = 'valor_total_pedido'
    ) THEN
        ALTER TABLE faturamento
            ALTER COLUMN valor_total_pedido TYPE NUMERIC(19,4),
            ALTER COLUMN valor_faturado TYPE NUMERIC(19,4),
            ALTER COLUMN valor_a_faturar TYPE NUMERIC(19,4);
    END IF;
END $$;

-- Migração 021: Precisão dos campos numéricos alterada com sucesso para evitar numeric field overflow! 