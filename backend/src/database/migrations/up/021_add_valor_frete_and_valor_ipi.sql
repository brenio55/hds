-- Migration to add valor_frete and valor_ipi fields to itens
-- This migration calculates valor_frete and valor_ipi as monetary values
-- based on the percentages of frete and ipi applied to valor_total

DO $$
DECLARE
    servico_record RECORD;
    updated_itens JSONB;
    item_key TEXT;
    item_value JSONB;
    valor_total NUMERIC;
    desconto NUMERIC;
    frete NUMERIC;
    ipi NUMERIC;
    outras_despesas NUMERIC;
    valor_frete NUMERIC;
    valor_ipi NUMERIC;
    valor_final NUMERIC;
BEGIN
    -- Loop through all records in the servico table
    FOR servico_record IN SELECT id, itens FROM servico WHERE itens IS NOT NULL AND jsonb_typeof(itens) = 'object' LOOP
        -- Initialize the updated itens JSON
        updated_itens := '{}'::JSONB;
        
        -- Loop through each key-value pair in the itens JSON
        FOR item_key, item_value IN SELECT key, value FROM jsonb_each(servico_record.itens) WHERE key ~ '^[0-9]+$' LOOP
            -- Extract values from the item
            valor_total := (item_value->>'valor_total')::NUMERIC;
            desconto := (item_value->>'desconto')::NUMERIC;
            frete := (item_value->>'frete')::NUMERIC;
            ipi := (item_value->>'ipi')::NUMERIC;
            outras_despesas := (item_value->>'outras_despesas')::NUMERIC;
            
            -- Calculate valor_frete and valor_ipi as monetary values based on percentages
            valor_frete := (valor_total * (frete / 100));
            valor_ipi := (valor_total * (ipi / 100));
            
            -- Calculate the new valor_final including freight and outras_despesas
            valor_final := (valor_total * (1 - (desconto / 100))) + valor_frete + outras_despesas;
            
            -- Update the item with the new valor_frete, valor_ipi, and valor_final
            item_value := item_value || jsonb_build_object(
                'valor_frete', valor_frete,
                'valor_ipi', valor_ipi,
                'valor_final', valor_final
            );
            
            -- Add the updated item to the new itens JSON
            updated_itens := updated_itens || jsonb_build_object(item_key, item_value);
        END LOOP;
        
        -- Copy non-numeric keys (like afazer_contratada, afazer_contratante, informacao_importante)
        FOR item_key, item_value IN SELECT key, value FROM jsonb_each(servico_record.itens) WHERE key !~ '^[0-9]+$' LOOP
            updated_itens := updated_itens || jsonb_build_object(item_key, item_value);
        END LOOP;
        
        -- Update the servico record with the new itens JSON
        UPDATE servico 
        SET itens = updated_itens
        WHERE id = servico_record.id;
        
        -- Recalculate the total based on the new valor_final values
        UPDATE servico
        SET total = (
            SELECT COALESCE(SUM((value->>'valor_final')::NUMERIC), 0)
            FROM jsonb_each(updated_itens)
            WHERE key ~ '^[0-9]+$'
        )
        WHERE id = servico_record.id;
    END LOOP;
END $$; 