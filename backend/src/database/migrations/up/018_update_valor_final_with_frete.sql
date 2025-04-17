-- Migration to update valor_final in itens to include freight value
-- This migration updates the valor_final field in each item within the itens JSON
-- to be consistent with the calculation in ServicoModel.js

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
BEGIN
    -- Loop through all records in the servico table
    FOR servico_record IN SELECT id, itens FROM servico WHERE itens IS NOT NULL AND jsonb_typeof(itens) = 'object' LOOP
        -- Initialize the updated itens JSON and totals
        updated_itens := '{}'::JSONB;
        total_servico := 0;
        
        -- Loop through each key-value pair in the itens JSON
        FOR item_key, item_value IN SELECT key, value FROM jsonb_each(servico_record.itens) WHERE key ~ '^[0-9]+$' LOOP
            -- Extract values from the item with COALESCE to handle NULL values
            valor_total := COALESCE((item_value->>'valor_total')::NUMERIC, 0);
            ipi := COALESCE((item_value->>'ipi')::NUMERIC, 0);
            desconto := COALESCE((item_value->>'desconto')::NUMERIC, 0);
            valor_frete := COALESCE((item_value->>'valor_frete')::NUMERIC, 0);
            outras_despesas := COALESCE((item_value->>'outras_despesas')::NUMERIC, 0);
            
            -- Calculate exactly like in ServicoModel.js:
            -- 1. Calculate IPI value
            valor_ipi := valor_total * (ipi / 100);
            
            -- 2. Calculate value with IPI
            valor_com_ipi := valor_total + valor_ipi;
            
            -- 3. Calculate discount on (PRODUCTS + IPI)
            valor_desconto := valor_com_ipi * (desconto / 100);
            
            -- 4. Calculate final value: (PRODUCTS + IPI) - DISCOUNT
            valor_final := valor_com_ipi - valor_desconto;
            
            -- Add to the total
            total_servico := total_servico + valor_final;
            
            -- Update the item with all calculated values
            item_value := item_value || jsonb_build_object(
                'valor_ipi', valor_ipi,
                'valor_com_ipi', valor_com_ipi,
                'valor_desconto', valor_desconto,
                'valor_final', valor_final
            );
            
            -- Add the updated item to the new itens JSON
            updated_itens := updated_itens || jsonb_build_object(item_key, item_value);
        END LOOP;
        
        -- Add frete and outras_despesas to the total - only once per servico
        -- (This matches the logic in ServicoModel.js)
        FOR item_key, item_value IN SELECT key, value FROM jsonb_each(servico_record.itens) WHERE key ~ '^[0-9]+$' LIMIT 1 LOOP
            valor_frete := COALESCE((item_value->>'valor_frete')::NUMERIC, 0);
            outras_despesas := COALESCE((item_value->>'outras_despesas')::NUMERIC, 0);
            total_servico := total_servico + valor_frete + outras_despesas;
        END LOOP;
        
        -- Update the servico record with the new itens JSON and recalculated total
        UPDATE servico 
        SET itens = updated_itens,
            total = total_servico
        WHERE id = servico_record.id;
    END LOOP;
END $$;

-- Update the comment to reflect the correct calculation
COMMENT ON COLUMN servico.total IS 'Total do serviço calculado como a soma dos valores_finais dos itens [valor_final = (valor_total + valor_ipi) - desconto%] mais valores de frete e outras despesas'; 