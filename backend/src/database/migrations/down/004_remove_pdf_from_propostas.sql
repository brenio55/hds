DO $$
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'propostas' 
        AND column_name = 'pdf_versions'
    ) THEN
        ALTER TABLE public.propostas
        DROP COLUMN pdf_versions;
    END IF;
END $$; 