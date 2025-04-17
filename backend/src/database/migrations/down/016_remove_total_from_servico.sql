-- Remove index
DROP INDEX IF EXISTS idx_servico_total;

-- Remove total column
ALTER TABLE public.servico
DROP COLUMN IF EXISTS total; 