-- Add access control column to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS can_access_evaluation BOOLEAN DEFAULT FALSE;

-- Create Base Price Configuration Table
CREATE TABLE IF NOT EXISTS public.config_precos_base (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    modelo TEXT NOT NULL UNIQUE,
    preco_base NUMERIC(10, 2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create Peripheral Discount Configuration Table
CREATE TABLE IF NOT EXISTS public.config_descontos_perifericos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    valor_desconto NUMERIC(10, 2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create Evaluations History Table
CREATE TABLE IF NOT EXISTS public.avaliacoes_iphone (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id),
    modelo TEXT NOT NULL,
    serial_number TEXT,
    checklist_data JSONB DEFAULT '{}'::jsonb,
    valor_final NUMERIC(10, 2),
    descontos_aplicados JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.config_precos_base ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.config_descontos_perifericos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.avaliacoes_iphone ENABLE ROW LEVEL SECURITY;

-- Policies
-- Configs: Read for all auth users, Write for admins only (enforced by app logic + backend trigger if needed, keeping simple for now)
CREATE POLICY "Enable read access for authenticated users" ON public.config_precos_base FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enable write access for admins" ON public.config_precos_base FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Enable read access for authenticated users" ON public.config_descontos_perifericos FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enable write access for admins" ON public.config_descontos_perifericos FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Evaluations: Read/Write for own user, Read for admins
CREATE POLICY "Users can insert their own evaluations" ON public.avaliacoes_iphone FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view their own evaluations or admins can view all" ON public.avaliacoes_iphone FOR SELECT TO authenticated USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Seed Data
INSERT INTO public.config_precos_base (modelo, preco_base) VALUES
('iPhone 11 64GB', 1500.00),
('iPhone 11 128GB', 1700.00),
('iPhone 12 64GB', 2000.00),
('iPhone 12 128GB', 2200.00),
('iPhone 13 128GB', 2800.00),
('iPhone 14 128GB', 3200.00),
('iPhone 15 Pro Max 256GB', 6000.00)
ON CONFLICT (modelo) DO NOTHING;

INSERT INTO public.config_descontos_perifericos (nome, valor_desconto) VALUES
('Tela Trocada/Paralela', 400.00),
('Vidro Traseiro Quebrado', 300.00),
('Bateria < 80%', 200.00),
('Face ID Inoperante', 500.00),
('Câmera Traseira com defeito', 350.00),
('Conector de Carga', 150.00),
('Sem Caixa/Acessórios', 100.00)
ON CONFLICT DO NOTHING;
