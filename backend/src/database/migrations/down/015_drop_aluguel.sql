-- Remover trigger
DROP TRIGGER IF EXISTS validate_obra_id ON aluguel;

-- Remover função
DROP FUNCTION IF EXISTS check_obra_id();

-- Remover tabela
DROP TABLE IF EXISTS public.aluguel; 