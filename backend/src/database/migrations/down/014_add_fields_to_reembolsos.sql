-- Remover os novos campos adicionados à tabela reembolsos
ALTER TABLE IF EXISTS public.reembolsos 
DROP COLUMN IF EXISTS comprovante,
DROP COLUMN IF EXISTS centro_custo_id;

-- Remover índice criado
DROP INDEX IF EXISTS idx_reembolsos_centro_custo; 