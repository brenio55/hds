DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'propostas' 
        AND column_name = 'pdf_versions'
    ) THEN
        ALTER TABLE public.propostas
        ADD COLUMN pdf_versions JSONB DEFAULT '{}';
    END IF;
END $$; 