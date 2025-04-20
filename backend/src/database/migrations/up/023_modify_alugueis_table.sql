-- Migração para modificar a tabela de aluguéis

-- Primeiro, vamos remover todos os triggers dependentes

-- Remover o trigger de validação do proposta_id (se existir)
DROP TRIGGER IF EXISTS aluguel_validate_proposta_id ON aluguel;

-- Remover o trigger de validação do obra_id (se existir)
DROP TRIGGER IF EXISTS validate_obra_id ON aluguel;

-- Agora podemos remover as funções com segurança
DROP FUNCTION IF EXISTS validate_proposta_id_aluguel();
DROP FUNCTION IF EXISTS check_obra_id();

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

-- 2. Adicionar a chave estrangeira se não existir
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'fk_aluguel_proposta' AND table_name = 'aluguel'
    ) THEN
        ALTER TABLE aluguel ADD CONSTRAINT fk_aluguel_proposta FOREIGN KEY (proposta_id) REFERENCES propostas(id);
    END IF;
END $$;

-- 3. Atualizar os registros existentes para extrair o obra_id da coluna detalhes e definir o proposta_id
DO $$
DECLARE
    aluguel_record RECORD;
    detalhes_json JSONB;
    obra_id INTEGER;
BEGIN
    -- Loop através de todos os registros na tabela aluguel que ainda não têm proposta_id
    FOR aluguel_record IN SELECT id, detalhes FROM aluguel WHERE detalhes IS NOT NULL AND (proposta_id IS NULL) LOOP
        -- Verificar se detalhes é um JSON válido
        IF jsonb_typeof(aluguel_record.detalhes) = 'object' THEN
            -- Extrair o obra_id do JSON
            obra_id := (aluguel_record.detalhes->>'obra_id')::INTEGER;
            
            -- Se obra_id existe, atualizar o registro com o valor
            IF obra_id IS NOT NULL THEN
                -- Atualizar o registro com o obra_id como proposta_id
                UPDATE aluguel SET proposta_id = obra_id WHERE id = aluguel_record.id;
                
                -- Remover o campo obra_id do JSON
                detalhes_json := aluguel_record.detalhes - 'obra_id';
                
                -- Atualizar o registro com o JSON modificado
                UPDATE aluguel SET detalhes = detalhes_json WHERE id = aluguel_record.id;
            END IF;
        END IF;
    END LOOP;
END $$;

-- 4. Adicionar um comentário à coluna proposta_id
COMMENT ON COLUMN aluguel.proposta_id IS 'Referência à proposta associada ao aluguel';

-- 6. Criar uma nova função para validar proposta_id
CREATE FUNCTION validate_proposta_id_aluguel()
RETURNS TRIGGER AS $$
BEGIN
    -- Verificar se proposta_id está presente
    IF NEW.proposta_id IS NULL THEN
        RAISE EXCEPTION 'O campo proposta_id é obrigatório';
    END IF;
    
    -- Verificar se a proposta existe
    IF NOT EXISTS (SELECT 1 FROM propostas WHERE id = NEW.proposta_id) THEN
        RAISE EXCEPTION 'A proposta com ID % não existe', NEW.proposta_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. Criar nova trigger para validação do proposta_id
CREATE TRIGGER aluguel_validate_proposta_id
BEFORE INSERT OR UPDATE ON aluguel
FOR EACH ROW
EXECUTE FUNCTION validate_proposta_id_aluguel(); 