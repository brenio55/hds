-- Adiciona o campo valor_final a cada item no JSON itens e atualiza o total
DO $$
DECLARE
    servico_record RECORD;
    itens_json JSONB;
    updated_itens JSONB;
    key TEXT;
    item JSONB;
    valor_total NUMERIC;
    desconto NUMERIC;
    valor_final NUMERIC;
    total_final NUMERIC;
BEGIN
    -- Loop através de todos os registros na tabela servico
    FOR servico_record IN SELECT id, itens FROM servico WHERE itens IS NOT NULL AND jsonb_typeof(itens) = 'object' LOOP
        -- Inicializa o total_final
        total_final := 0;
        
        -- Cria um novo JSONB para armazenar os itens atualizados
        updated_itens := '{}'::JSONB;
        
        -- Loop através de cada chave no JSON itens
        FOR key IN SELECT jsonb_object_keys(servico_record.itens) LOOP
            -- Verifica se a chave é numérica
            IF key ~ '^[0-9]+$' THEN
                -- Obtém o item atual
                item := servico_record.itens->key;
                
                -- Extrai valor_total e desconto
                valor_total := (item->>'valor_total')::NUMERIC;
                desconto := (item->>'desconto')::NUMERIC;
                
                -- Calcula o valor_final (valor_total - desconto%)
                IF valor_total IS NOT NULL AND desconto IS NOT NULL THEN
                    valor_final := valor_total * (1 - (desconto / 100));
                ELSE
                    valor_final := valor_total;
                END IF;
                
                -- Adiciona o valor_final ao item
                item := item || jsonb_build_object('valor_final', valor_final);
                
                -- Adiciona o item atualizado ao JSONB atualizado
                updated_itens := updated_itens || jsonb_build_object(key, item);
                
                -- Adiciona ao total_final
                total_final := total_final + COALESCE(valor_final, 0);
            END IF;
        END LOOP;
        
        -- Atualiza o registro com os itens atualizados e o novo total
        UPDATE servico 
        SET itens = updated_itens,
            total = total_final
        WHERE id = servico_record.id;
    END LOOP;
END $$;

-- Adiciona um comentário à coluna total
COMMENT ON COLUMN servico.total IS 'Soma dos valores finais (após desconto) de todos os itens do serviço'; 