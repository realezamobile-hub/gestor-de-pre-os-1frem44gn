-- Create table for excluded suppliers
CREATE TABLE IF NOT EXISTS public.fornecedores_excluidos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT,
    telefone TEXT,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.fornecedores_excluidos ENABLE ROW LEVEL SECURITY;

-- Policies for fornecedores_excluidos
CREATE POLICY "Admins can manage excluded suppliers" ON public.fornecedores_excluidos
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Anyone can read excluded suppliers" ON public.fornecedores_excluidos
    FOR SELECT
    USING (true);

-- Create View for Visible Products (Filtering excluded suppliers)
CREATE OR REPLACE VIEW public.v_produtos_visiveis AS
SELECT p.*
FROM public.produtos p
LEFT JOIN public.fornecedores_excluidos fe_nome ON p.fornecedor = fe_nome.nome
LEFT JOIN public.fornecedores_excluidos fe_tel ON p.telefone = fe_tel.telefone
WHERE fe_nome.id IS NULL AND fe_tel.id IS NULL;

-- Create View for Price Monitor (Best Price per Model)
CREATE OR REPLACE VIEW public.v_monitor_precos AS
SELECT DISTINCT ON (modelo)
    id,
    modelo,
    categoria,
    valor,
    fornecedor,
    telefone,
    criado_em
FROM public.v_produtos_visiveis
WHERE valor IS NOT NULL
ORDER BY modelo, valor ASC;
