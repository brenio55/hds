-- Adicionar coluna tipo_frete na tabela pedido_locacao
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'pedido_locacao' AND column_name = 'tipo_frete'
    ) THEN
        -- Criar o tipo enum se não existir
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tipo_frete') THEN
            CREATE TYPE public.tipo_frete AS ENUM ('CIF', 'FOB');
        END IF;
        
        -- Adicionar a coluna tipo_frete com valor padrão 'CIF'
        ALTER TABLE public.pedido_locacao 
        ADD COLUMN tipo_frete public.tipo_frete NOT NULL DEFAULT 'CIF';
        
        -- Adicionar comentário para documentação
        COMMENT ON COLUMN public.pedido_locacao.tipo_frete IS 'Tipo de frete: CIF (por conta do fornecedor) ou FOB (por conta do destinatário)';
    END IF;
END
$$; 