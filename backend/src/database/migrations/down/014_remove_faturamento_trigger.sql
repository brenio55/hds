-- Remove o trigger
DROP TRIGGER IF EXISTS calcular_valor_a_faturar ON faturamento;

-- Remove a função
DROP FUNCTION IF EXISTS atualizar_valor_a_faturar(); 