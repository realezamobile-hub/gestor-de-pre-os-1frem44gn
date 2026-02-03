ALTER TABLE public.clientes ADD COLUMN IF NOT EXISTS data_nascimento DATE;
ALTER TABLE public.clientes ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.clientes ADD COLUMN IF NOT EXISTS origem TEXT;
ALTER TABLE public.clientes ADD COLUMN IF NOT EXISTS genero TEXT;
ALTER TABLE public.clientes ADD COLUMN IF NOT EXISTS url_foto TEXT;
ALTER TABLE public.clientes ADD COLUMN IF NOT EXISTS cep TEXT;
ALTER TABLE public.clientes ADD COLUMN IF NOT EXISTS rua TEXT;
ALTER TABLE public.clientes ADD COLUMN IF NOT EXISTS numero TEXT;
ALTER TABLE public.clientes ADD COLUMN IF NOT EXISTS complemento TEXT;
ALTER TABLE public.clientes ADD COLUMN IF NOT EXISTS bairro TEXT;
ALTER TABLE public.clientes ADD COLUMN IF NOT EXISTS municipio TEXT;
ALTER TABLE public.clientes ADD COLUMN IF NOT EXISTS estado TEXT;
ALTER TABLE public.clientes ADD COLUMN IF NOT EXISTS observacoes TEXT;

-- Create index for faster search on new fields if needed
CREATE INDEX IF NOT EXISTS idx_clientes_email ON public.clientes(email);
