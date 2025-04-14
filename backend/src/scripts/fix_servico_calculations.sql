-- Script para corrigir cálculos de valores e totais de serviços existentes
-- Execute este script para recalcular todos os serviços

-- Gera logs para acompanhamento
\echo 'Iniciando correção de cálculos de serviços...';

DO $$
DECLARE
    servico_record RECORD;
    updated_itens JSONB;
    item_key TEXT;
    item_value JSONB;
    valor_total NUMERIC;
    ipi NUMERIC;
    desconto NUMERIC;
    valor_frete NUMERIC;
    outras_despesas NUMERIC;
    valor_ipi NUMERIC;
    valor_com_ipi NUMERIC;
    valor_desconto NUMERIC;
    valor_final NUMERIC;
    total_servico NUMERIC;
    servico_count INTEGER := 0;
BEGIN
    -- Loop através de todos os registros na tabela servico
    FOR servico_record IN SELECT id, itens FROM servico WHERE itens IS NOT NULL AND jsonb_typeof(itens) = 'object' LOOP
        servico_count := servico_count + 1;
        
        -- Inicializa variáveis
        updated_itens := '{}'::JSONB;
        total_servico := 0;
        
        -- Processa os itens numérais do serviço
        FOR item_key, item_value IN SELECT key, value FROM jsonb_each(servico_record.itens) WHERE key ~ '^[0-9]+$' LOOP
            -- Extrai valores do item (com tratamento de NULL)
            valor_total := COALESCE((item_value->>'valor_total')::NUMERIC, 0);
            ipi := COALESCE((item_value->>'ipi')::NUMERIC, 0);
            desconto := COALESCE((item_value->>'desconto')::NUMERIC, 0);
            valor_frete := COALESCE((item_value->>'valor_frete')::NUMERIC, 0);
            outras_despesas := COALESCE((item_value->>'outras_despesas')::NUMERIC, 0);
            
            -- Cálculos exatamente como em ServicoModel.js:
            -- 1. Calcular valor do IPI
            valor_ipi := valor_total * (ipi / 100);
            
            -- 2. Valor com IPI
            valor_com_ipi := valor_total + valor_ipi;
            
            -- 3. Calcular desconto sobre (PRODUTOS + IPI)
            valor_desconto := valor_com_ipi * (desconto / 100);
            
            -- 4. Calcular valor final: (PRODUTOS + IPI) - DESCONTO
            valor_final := valor_com_ipi - valor_desconto;
            
            -- Adiciona ao total
            total_servico := total_servico + valor_final;
            
            -- Atualiza o item com todos os valores calculados
            item_value := item_value || jsonb_build_object(
                'valor_ipi', valor_ipi,
                'valor_com_ipi', valor_com_ipi,
                'valor_desconto', valor_desconto,
                'valor_final', valor_final
            );
            
            -- Adiciona o item atualizado ao novo JSON de itens
            updated_itens := updated_itens || jsonb_build_object(item_key, item_value);
        END LOOP;
        
        -- Copia as chaves não-numéricas (como afazer_contratada, afazer_contratante, informacao_importante)
        FOR item_key, item_value IN SELECT key, value FROM jsonb_each(servico_record.itens) WHERE key !~ '^[0-9]+$' LOOP
            updated_itens := updated_itens || jsonb_build_object(item_key, item_value);
        END LOOP;
        
        -- Adiciona frete e outras_despesas ao total - apenas uma vez por serviço
        -- (Isso corresponde à lógica em ServicoModel.js)
        FOR item_key, item_value IN SELECT key, value FROM jsonb_each(servico_record.itens) WHERE key ~ '^[0-9]+$' LIMIT 1 LOOP
            valor_frete := COALESCE((item_value->>'valor_frete')::NUMERIC, 0);
            outras_despesas := COALESCE((item_value->>'outras_despesas')::NUMERIC, 0);
            total_servico := total_servico + valor_frete + outras_despesas;
        END LOOP;
        
        -- Atualiza o registro com os novos itens e o total recalculado
        UPDATE servico 
        SET itens = updated_itens,
            total = total_servico
        WHERE id = servico_record.id;
        
        -- Log para cada 10 serviços processados
        IF servico_count % 10 = 0 THEN
            RAISE NOTICE 'Processados % serviços', servico_count;
        END IF;
    END LOOP;
    
    RAISE NOTICE 'Correção de cálculos concluída. Total de % serviços processados.', servico_count;
END $$;

-- Verifica se há algum serviço com total inconsistente
\echo 'Verificando se há serviços com totais inconsistentes...';

SELECT 
    id, 
    total as total_atual,
    (
        SELECT COALESCE(SUM((value->>'valor_final')::NUMERIC), 0) + 
               COALESCE((itens->'0'->>'valor_frete')::NUMERIC, 0) + 
               COALESCE((itens->'0'->>'outras_despesas')::NUMERIC, 0)
        FROM jsonb_each(itens)
        WHERE key ~ '^[0-9]+$'
    ) as total_calculado
FROM servico
WHERE itens IS NOT NULL AND jsonb_typeof(itens) = 'object'
AND ABS(total - (
    SELECT COALESCE(SUM((value->>'valor_final')::NUMERIC), 0) + 
           COALESCE((itens->'0'->>'valor_frete')::NUMERIC, 0) + 
           COALESCE((itens->'0'->>'outras_despesas')::NUMERIC, 0)
    FROM jsonb_each(itens)
    WHERE key ~ '^[0-9]+$'
)) > 0.01;

 