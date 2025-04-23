-- Remover coluna tipo_frete da tabela pedido_locacao
ALTER TABLE IF EXISTS public.pedido_locacao DROP COLUMN IF EXISTS tipo_frete;

-- Remover o tipo enum se não tiver outras referências
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE data_type = 'USER-DEFINED' AND udt_name = 'tipo_frete'
    ) THEN
        DROP TYPE IF EXISTS public.tipo_frete;
    END IF;
END
$$; 