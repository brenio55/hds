-- Migration to remove propostaItens column from propostas table

-- Remove the index first
DROP INDEX IF EXISTS idx_propostas_proposta_itens;

-- Then remove the column
ALTER TABLE public.propostas
DROP COLUMN IF EXISTS proposta_itens; 