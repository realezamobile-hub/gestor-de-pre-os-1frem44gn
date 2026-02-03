ALTER TABLE public.avaliacoes_iphone
ADD COLUMN IF NOT EXISTS url_pesquisa_1 TEXT,
ADD COLUMN IF NOT EXISTS url_pesquisa_2 TEXT,
ADD COLUMN IF NOT EXISTS url_pesquisa_3 TEXT,
ADD COLUMN IF NOT EXISTS url_pesquisa_4 TEXT;
