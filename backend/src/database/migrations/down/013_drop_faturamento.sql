DROP TABLE IF EXISTS public.faturamento;

DO $$
BEGIN
    -- Remove os tipos apenas se não estiverem sendo usados em outras tabelas
    IF NOT EXISTS (
        SELECT 1 FROM pg_type t 
        JOIN pg_class c ON (c.reltype = t.oid) 
        WHERE t.typname = 'tipo_pedido'
    ) THEN
        DROP TYPE IF EXISTS tipo_pedido;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_type t 
        JOIN pg_class c ON (c.reltype = t.oid) 
        WHERE t.typname = 'tipo_pagamento'
    ) THEN
        DROP TYPE IF EXISTS tipo_pagamento;
    END IF;
END$$; 