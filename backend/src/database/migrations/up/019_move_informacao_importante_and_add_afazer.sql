-- Migration to move informacao_importante out of numeric items and add afazer arrays
-- This migration:
-- 1. Moves informacao_importante from the last numeric item to the root level
-- 2. Adds afazer_contratada and afazer_contratante arrays if they don't exist

DO $$
DECLARE
    servico_record RECORD;
    updated_itens JSONB;
    item_key TEXT;
    item_value JSONB;
    last_numeric_key TEXT;
    last_numeric_value JSONB;
    informacao_importante TEXT;
    afazer_contratada JSONB;
    afazer_contratante JSONB;
BEGIN
    -- Loop through all records in the servico table
    FOR servico_record IN SELECT id, itens FROM servico WHERE itens IS NOT NULL AND jsonb_typeof(itens) = 'object' LOOP
        -- Initialize the updated itens JSON
        updated_itens := '{}'::JSONB;
        
        -- Find the last numeric key and its value
        last_numeric_key := NULL;
        last_numeric_value := NULL;
        
        FOR item_key, item_value IN SELECT key, value FROM jsonb_each(servico_record.itens) WHERE key ~ '^[0-9]+$' ORDER BY key::INTEGER DESC LIMIT 1 LOOP
            last_numeric_key := item_key;
            last_numeric_value := item_value;
        END LOOP;
        
        -- Extract informacao_importante from the last numeric item if it exists
        IF last_numeric_value IS NOT NULL AND last_numeric_value ? 'informacao_importante' THEN
            informacao_importante := last_numeric_value->>'informacao_importante';
            
            -- Remove informacao_importante from the last numeric item
            last_numeric_value := last_numeric_value - 'informacao_importante';
            
            -- Update the last numeric item in the itens JSON
            updated_itens := jsonb_set(servico_record.itens, ARRAY[last_numeric_key], last_numeric_value);
        ELSE
            updated_itens := servico_record.itens;
            informacao_importante := NULL;
        END IF;
        
        -- Check if afazer arrays already exist
        IF updated_itens ? 'afazer_contratada' THEN
            afazer_contratada := updated_itens->'afazer_contratada';
        ELSE
            afazer_contratada := '["- Fazer o que esta acordado em contrato", "- Ser responsavel"]'::JSONB;
        END IF;
        
        IF updated_itens ? 'afazer_contratante' THEN
            afazer_contratante := updated_itens->'afazer_contratante';
        ELSE
            afazer_contratante := '["- Ser responsavel", "- cumprir acordo"]'::JSONB;
        END IF;
        
        -- Add informacao_importante and afazer arrays to the root level
        updated_itens := updated_itens || 
                         jsonb_build_object(
                             'afazer_contratada', afazer_contratada,
                             'afazer_contratante', afazer_contratante
                         );
        
        -- Add informacao_importante only if it exists
        IF informacao_importante IS NOT NULL THEN
            updated_itens := updated_itens || jsonb_build_object('informacao_importante', informacao_importante);
        END IF;
        
        -- Update the servico record with the new itens JSON
        UPDATE servico 
        SET itens = updated_itens
        WHERE id = servico_record.id;
    END LOOP;
END $$; 