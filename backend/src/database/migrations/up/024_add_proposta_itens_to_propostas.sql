-- Migration to add propostaItens column to propostas table
-- This column will store a list of items with details like name, quantity, unit price and total value

-- Add the column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'propostas' 
        AND column_name = 'proposta_itens'
    ) THEN
        -- Add the column as JSONB with default empty array
        ALTER TABLE public.propostas
        ADD COLUMN proposta_itens JSONB DEFAULT '[]';
        
        -- Add comment explaining the purpose
        COMMENT ON COLUMN propostas.proposta_itens IS 'Lista de itens da proposta com nome, quantidade, unidade de medida, valor unitário e valor total';
        
        -- Create GIN index for efficient JSON search
        CREATE INDEX idx_propostas_proposta_itens ON propostas USING GIN (proposta_itens);
    END IF;
END $$; 