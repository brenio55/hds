-- Migration to add frete field with default value of 10
-- This migration adds the frete field to all items in the itens JSON
-- with a default value of 10 if it doesn't exist or is null

DO $$
DECLARE
    servico_record RECORD;
    updated_itens JSONB;
    item_key TEXT;
    item_value JSONB;
BEGIN
    -- Loop through all records in the servico table
    FOR servico_record IN SELECT id, itens FROM servico WHERE itens IS NOT NULL AND jsonb_typeof(itens) = 'object' LOOP
        -- Initialize the updated itens JSON
        updated_itens := '{}'::JSONB;
        
        -- Loop through each key-value pair in the itens JSON
        FOR item_key, item_value IN SELECT key, value FROM jsonb_each(servico_record.itens) WHERE key ~ '^[0-9]+$' LOOP
            -- Check if frete field exists and is not null
            IF item_value->>'frete' IS NULL THEN
                -- Add frete field with default value of 10
                item_value := item_value || jsonb_build_object('frete', 10);
            END IF;
            
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
    END LOOP;
END $$; 