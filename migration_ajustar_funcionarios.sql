-- 1. Primeiro, garantir que todos os funcionários tenham um cargo_id válido
-- Para funcionários que têm 'cargo' preenchido mas não têm cargo_id

-- Criar cargos para funcionários que têm apenas o nome do cargo, sem cargo_id
INSERT INTO cargos (nome, valor_hh)
SELECT DISTINCT f.cargo, 0.00
FROM funcionarios f
WHERE f.cargo_id IS NULL AND f.cargo IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM cargos c WHERE c.nome = f.cargo);

-- Atualizar os funcionários para referenciar os cargos existentes por nome
UPDATE funcionarios f
SET cargo_id = c.id
FROM cargos c
WHERE f.cargo = c.nome AND f.cargo_id IS NULL;

-- 2. Após todos os funcionários terem cargo_id atualizado, remover a coluna redundante
-- Importante: Este ALTER TABLE só deve ser executado após verificar que todos os funcionários 
-- têm um cargo_id válido ou NULL
ALTER TABLE funcionarios 
DROP COLUMN cargo;

-- 3. Adicionar constraint NOT NULL em cargo_id para garantir que todos os funcionários
-- tenham cargo_id preenchido (opcional, dependendo da regra de negócio)
-- ALTER TABLE funcionarios ALTER COLUMN cargo_id SET NOT NULL; 