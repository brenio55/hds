CREATE TABLE IF NOT EXISTS public.propostas (
  id BIGSERIAL PRIMARY KEY,
  descricao VARCHAR(500) NOT NULL,
  data_criacao DATE DEFAULT CURRENT_DATE,
  data_emissao DATE,
  client_info JSONB,
  versao DECIMAL(10,2) DEFAULT 1.0,
  documento_text TEXT DEFAULT '[padrao]',
  especificacoes_html VARCHAR,
  afazer_hds VARCHAR DEFAULT '[]',
  afazer_contratante VARCHAR DEFAULT '[]',
  naofazer_hds VARCHAR DEFAULT '[]',
  valor_final DECIMAL(10,2),
  user_id BIGINT REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
); 