-- Primeiro, adiciona a coluna id se não existir
DO $$ 
BEGIN
    -- Verifica se a coluna id existe
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'clientInfo' 
        AND column_name = 'id'
    ) THEN
        -- Adiciona a coluna id
        ALTER TABLE public."clientInfo"
        ADD COLUMN id SERIAL;
    END IF;

    -- Garante que todos os registros tenham um id único
    WITH numbered_rows AS (
        SELECT ctid, ROW_NUMBER() OVER () as rn
        FROM public."clientInfo"
        WHERE id IS NULL
    )
    UPDATE public."clientInfo" t
    SET id = nr.rn
    FROM numbered_rows nr
    WHERE t.ctid = nr.ctid;

    -- Adiciona a constraint de chave primária se não existir
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE table_name = 'clientInfo' 
        AND constraint_type = 'PRIMARY KEY'
    ) THEN
        -- Adiciona a chave primária
        ALTER TABLE public."clientInfo"
        ADD CONSTRAINT clientinfo_pkey PRIMARY KEY (id);
    END IF;
END $$; 