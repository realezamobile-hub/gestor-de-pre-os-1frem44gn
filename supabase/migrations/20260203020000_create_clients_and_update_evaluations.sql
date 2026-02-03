-- Create clientes table
CREATE TABLE IF NOT EXISTS public.clientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.empresas(id),
  nome TEXT NOT NULL,
  cpf TEXT NOT NULL,
  rg TEXT,
  telefone TEXT NOT NULL,
  endereco TEXT,
  nome_contato_emergencia TEXT,
  telefone_contato_emergencia TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add unique constraint for CPF per company to avoid duplicates
ALTER TABLE public.clientes ADD CONSTRAINT clientes_company_id_cpf_key UNIQUE (company_id, cpf);

-- Update avaliacoes_iphone table
ALTER TABLE public.avaliacoes_iphone 
ADD COLUMN IF NOT EXISTS cliente_id UUID REFERENCES public.clientes(id),
ADD COLUMN IF NOT EXISTS arquivos_consulta JSONB DEFAULT '[]'::jsonb;

-- Create index for faster search
CREATE INDEX IF NOT EXISTS idx_clientes_cpf ON public.clientes(cpf);
CREATE INDEX IF NOT EXISTS idx_clientes_nome ON public.clientes(nome);
