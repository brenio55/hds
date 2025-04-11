-- Add total column to servico table
ALTER TABLE public.servico
ADD COLUMN IF NOT EXISTS total DECIMAL(15,2) DEFAULT 0;

-- Update existing records to calculate total from itens
UPDATE public.servico
SET total = (
  SELECT COALESCE(SUM((value->>'valor_total')::DECIMAL(15,2)), 0)
  FROM jsonb_each(itens) AS items(key, value)
  WHERE key ~ '^[0-9]+$' -- Only process numeric keys
)
WHERE itens IS NOT NULL 
AND jsonb_typeof(itens) = 'object'; -- Only process if itens is a JSON object

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_servico_total ON servico(total);

-- Add comment
COMMENT ON COLUMN servico.total IS 'Total calculado da soma dos valores totais dos itens'; 