CREATE TABLE IF NOT EXISTS public.aluguel (
    id SERIAL PRIMARY KEY,
    valor DECIMAL(15,2) NOT NULL,
    detalhes JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Criar índice para o campo detalhes
CREATE INDEX IF NOT EXISTS idx_aluguel_detalhes ON aluguel USING GIN (detalhes);

-- Criar função para validar obra_id
CREATE OR REPLACE FUNCTION check_obra_id() RETURNS trigger AS $$ 
BEGIN
    IF (NEW.detalhes->>'obra_id') IS NOT NULL THEN
        IF NOT EXISTS (
            SELECT 1 FROM custoobra WHERE id = (NEW.detalhes->>'obra_id')::integer
        ) THEN
            RAISE EXCEPTION 'obra_id inválido: %', NEW.detalhes->>'obra_id';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Remover trigger se existir
DROP TRIGGER IF EXISTS validate_obra_id ON aluguel;

-- Criar trigger
CREATE TRIGGER validate_obra_id
    BEFORE INSERT OR UPDATE ON aluguel
    FOR EACH ROW
    EXECUTE FUNCTION check_obra_id();

-- Comentários
COMMENT ON TABLE aluguel IS 'Tabela para armazenar informações de aluguéis';
COMMENT ON COLUMN aluguel.detalhes IS 'Detalhes do aluguel em formato JSON (dia_vencimento, pagamento, obra_id, observacoes)'; 