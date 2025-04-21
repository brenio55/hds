-- Add total column to servico table if not exists
ALTER TABLE public.servico
ADD COLUMN IF NOT EXISTS total DECIMAL(15,2) DEFAULT 0;

-- Criar index para melhor performance
CREATE INDEX IF NOT EXISTS idx_servico_total ON servico(total);

-- Atualizar totais com uma abordagem simples e direta, garantindo que o frete seja adicionado apenas uma vez
UPDATE servico
SET total = subquery.total_calculado
FROM (
    WITH itens_processados AS (
        SELECT 
            id, 
            -- Calcular valores para cada item
            COALESCE(SUM(
                -- Base: valor_total
                COALESCE(NULLIF((value->>'valor_total'), '')::DECIMAL(15,2), 0) + 
                -- Adicionar IPI
                (COALESCE(NULLIF((value->>'valor_total'), '')::DECIMAL(15,2), 0) * 
                 COALESCE(NULLIF((value->>'ipi'), '')::DECIMAL(15,2), 0) / 100) -
                -- Subtrair desconto
                ((COALESCE(NULLIF((value->>'valor_total'), '')::DECIMAL(15,2), 0) + 
                  (COALESCE(NULLIF((value->>'valor_total'), '')::DECIMAL(15,2), 0) * 
                   COALESCE(NULLIF((value->>'ipi'), '')::DECIMAL(15,2), 0) / 100)) *
                 COALESCE(NULLIF((value->>'desconto'), '')::DECIMAL(15,2), 0) / 100)
            ), 0) AS subtotal_itens,
            
            -- Obter frete (primeiro não-zero) - será adicionado apenas uma vez
            COALESCE((
                SELECT COALESCE(NULLIF((value->>'valor_frete'), '')::DECIMAL(15,2), 0)
                FROM jsonb_each(itens) 
                WHERE key ~ '^[0-9]+$' 
                  AND NULLIF((value->>'valor_frete'), '') IS NOT NULL
                  AND NULLIF((value->>'valor_frete'), '0') IS NOT NULL
                ORDER BY key::integer
                LIMIT 1
            ), 0) AS frete,
            
            -- Obter outras despesas (primeiro não-zero) - será adicionado apenas uma vez
            COALESCE((
                SELECT COALESCE(NULLIF((value->>'outras_despesas'), '')::DECIMAL(15,2), 0)
                FROM jsonb_each(itens) 
                WHERE key ~ '^[0-9]+$' 
                  AND NULLIF((value->>'outras_despesas'), '') IS NOT NULL
                  AND NULLIF((value->>'outras_despesas'), '0') IS NOT NULL
                ORDER BY key::integer
                LIMIT 1
            ), 0) AS outras_despesas
        FROM servico, jsonb_each(itens)
        WHERE jsonb_typeof(itens) = 'object'
        AND key ~ '^[0-9]+$'
        GROUP BY id
    )
    SELECT 
        id,
        -- Soma do subtotal dos itens + frete (uma vez) + outras despesas (uma vez)
        GREATEST(subtotal_itens + frete + outras_despesas, 0.01) AS total_calculado
    FROM itens_processados
) AS subquery
WHERE servico.id = subquery.id;

-- Garantir que nenhum serviço tenha total zero ou NULL
UPDATE servico 
SET total = 0.01 
WHERE total IS NULL OR total <= 0;

-- Adicionar comentário explicando a fórmula correta
COMMENT ON COLUMN servico.total IS 'Total calculado: soma de (valor_total + IPI - desconto) para todos os itens, mais frete e outras despesas';

-- NOTA: Esta migração apenas adiciona a coluna total.
-- Para corrigir os valores, execute o script 'fix_servico_calculations.sql' na pasta scripts.