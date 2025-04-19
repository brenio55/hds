-- Migração de rollback para reverter as alterações na tabela de aluguéis
-- 1. Remover a nova trigger e função de validação
DROP TRIGGER IF EXISTS aluguel_validate_proposta_id ON aluguel;
DROP FUNCTION IF EXISTS validate_proposta_id_aluguel();

-- 2. Restaurar a antiga função de validação do obra_id
CREATE OR REPLACE FUNCTION check_obra_id()
RETURNS TRIGGER AS $$
BEGIN
    -- Verificar se o campo obra_id está presente no JSON detalhes
    IF NEW.detalhes->>'obra_id' IS NULL THEN
        RAISE EXCEPTION 'O campo obra_id é obrigatório nos detalhes do aluguel';
    END IF;
    
    -- Verificar se o valor é um número inteiro válido
    IF NOT (NEW.detalhes->>'obra_id' ~ '^[0-9]+$') THEN
        RAISE EXCEPTION 'O campo obra_id deve ser um número inteiro válido';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Restaurar a antiga trigger
CREATE TRIGGER validate_obra_id
BEFORE INSERT OR UPDATE ON aluguel
FOR EACH ROW
EXECUTE FUNCTION check_obra_id();

-- 4. Remover a chave estrangeira
ALTER TABLE aluguel DROP CONSTRAINT IF EXISTS fk_aluguel_proposta;

-- 5. Restaurar o campo obra_id na coluna detalhes
DO $$
DECLARE
    aluguel_record RECORD;
    detalhes_json JSONB;
BEGIN
    -- Loop através de todos os registros na tabela aluguel que têm proposta_id
    FOR aluguel_record IN SELECT id, detalhes, proposta_id FROM aluguel WHERE proposta_id IS NOT NULL LOOP
        -- Verificar se detalhes é um JSON válido
        IF jsonb_typeof(aluguel_record.detalhes) = 'object' THEN
            -- Adicionar o obra_id ao JSON
            detalhes_json := aluguel_record.detalhes || jsonb_build_object('obra_id', aluguel_record.proposta_id);
            
            -- Atualizar o registro com o JSON modificado
            UPDATE aluguel SET detalhes = detalhes_json WHERE id = aluguel_record.id;
        END IF;
    END LOOP;
END $$;

-- 6. Remover a coluna proposta_id
ALTER TABLE aluguel DROP COLUMN IF EXISTS proposta_id;

-- 1. Adicionar a coluna proposta_id se não existir
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'aluguel' AND column_name = 'proposta_id'
    ) THEN
        ALTER TABLE aluguel ADD COLUMN proposta_id INTEGER;
    END IF;
END $$;

-- Continuar com o resto da migração... 