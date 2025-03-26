-- Remove a chave primária
ALTER TABLE public."clientInfo"
DROP CONSTRAINT IF EXISTS clientinfo_pkey;

-- Remove a coluna id
ALTER TABLE public."clientInfo"
DROP COLUMN IF EXISTS id; 