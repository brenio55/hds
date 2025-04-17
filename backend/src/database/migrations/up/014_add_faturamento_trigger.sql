-- Este arquivo foi modificado porque não precisamos mais calcular o valor_a_faturar
-- Como não temos mais esse campo na tabela, o trigger não é necessário

-- Se por algum motivo o trigger ou a função ainda existirem, vamos removê-los
DO $$
BEGIN
    -- Remover o trigger se existir
    DROP TRIGGER IF EXISTS calcular_valor_a_faturar ON faturamento;
    
    -- Remover a função se existir
    DROP FUNCTION IF EXISTS atualizar_valor_a_faturar();
END $$; 