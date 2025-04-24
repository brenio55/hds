-- Reverter alterações na tabela de funcionários
ALTER TABLE funcionarios
    DROP COLUMN IF EXISTS cargo_id,
    DROP COLUMN IF EXISTS created_at,
    DROP COLUMN IF EXISTS updated_at; 