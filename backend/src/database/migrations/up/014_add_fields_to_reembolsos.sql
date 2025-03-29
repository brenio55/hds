-- Adicionar novos campos à tabela reembolsos para suportar comprovantes e centro de custo
ALTER TABLE IF EXISTS public.reembolsos 
ADD COLUMN IF NOT EXISTS comprovante TEXT,
ADD COLUMN IF NOT EXISTS centro_custo_id INTEGER;

-- Criar índice para melhorar performance das buscas por centro de custo
CREATE INDEX IF NOT EXISTS idx_reembolsos_centro_custo ON reembolsos(centro_custo_id);

-- Comentários para documentação
COMMENT ON COLUMN reembolsos.comprovante IS 'Imagem do comprovante em formato base64';
COMMENT ON COLUMN reembolsos.centro_custo_id IS 'ID do centro de custo (proposta) associado ao reembolso'; 