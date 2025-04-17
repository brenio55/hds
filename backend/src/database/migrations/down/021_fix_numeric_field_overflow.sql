-- Migração para reverter as alterações de precisão dos campos numéricos
-- Volta para as definições originais

-- Tabela pedido_compra
ALTER TABLE pedido_compra 
    ALTER COLUMN desconto TYPE DECIMAL(5,2),
    ALTER COLUMN valor_frete TYPE DECIMAL(10,2),
    ALTER COLUMN despesas_adicionais TYPE DECIMAL(10,2);

-- Tabela servico
ALTER TABLE servico 
    ALTER COLUMN total TYPE DECIMAL(15,2);

-- Tabela pedido_locacao
ALTER TABLE pedido_locacao
    ALTER COLUMN total_bruto TYPE DECIMAL(15,2),
    ALTER COLUMN total_ipi TYPE DECIMAL(15,2),
    ALTER COLUMN total_descontos TYPE DECIMAL(15,2),
    ALTER COLUMN valor_frete TYPE DECIMAL(15,2),
    ALTER COLUMN outras_despesas TYPE DECIMAL(15,2),
    ALTER COLUMN total_final TYPE DECIMAL(15,2),
    ALTER COLUMN frete TYPE DECIMAL(15,2);

-- Tabela faturamento (verificar se existe a coluna valor_total_pedido)
DO $$
BEGIN
    IF EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'faturamento' AND column_name = 'valor_total_pedido'
    ) THEN
        ALTER TABLE faturamento
            ALTER COLUMN valor_total_pedido TYPE DECIMAL(15,2),
            ALTER COLUMN valor_faturado TYPE DECIMAL(15,2),
            ALTER COLUMN valor_a_faturar TYPE DECIMAL(15,2);
    END IF;
END $$;

-- Migração 021 revertida com sucesso! 