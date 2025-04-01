-- Função que será executada pelo trigger
CREATE OR REPLACE FUNCTION atualizar_valor_a_faturar()
RETURNS TRIGGER AS $$
BEGIN
    -- Sempre define o valor_a_faturar como valor_total_pedido - valor_faturado
    NEW.valor_a_faturar := COALESCE(NEW.valor_total_pedido, 0) - COALESCE(NEW.valor_faturado, 0);
    
    -- Se o resultado for negativo, ajusta para zero
    IF NEW.valor_a_faturar < 0 THEN
        NEW.valor_a_faturar := 0;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar o trigger para INSERT e UPDATE
DO $$
BEGIN
    -- Remove o trigger se já existir
    DROP TRIGGER IF EXISTS calcular_valor_a_faturar ON faturamento;
    
    -- Cria o trigger
    CREATE TRIGGER calcular_valor_a_faturar
    BEFORE INSERT OR UPDATE OF valor_total_pedido, valor_faturado
    ON faturamento
    FOR EACH ROW
    EXECUTE FUNCTION atualizar_valor_a_faturar();
END $$;

-- Atualiza os registros existentes
UPDATE faturamento
SET valor_a_faturar = 
    GREATEST(0, COALESCE(valor_total_pedido, 0) - COALESCE(valor_faturado, 0)); 