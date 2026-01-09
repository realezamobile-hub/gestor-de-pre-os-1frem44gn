CREATE INDEX IF NOT EXISTS idx_produtos_categoria ON public.produtos (categoria);
CREATE INDEX IF NOT EXISTS idx_produtos_modelo ON public.produtos (modelo);
CREATE INDEX IF NOT EXISTS idx_produtos_criado_em ON public.produtos (criado_em);
