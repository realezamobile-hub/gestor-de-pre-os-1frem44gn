-- Migration: Create Evaluation Module Tables and Policies

-- 1. Add permission column to profiles if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'can_access_evaluation') THEN
        ALTER TABLE public.profiles ADD COLUMN can_access_evaluation BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- 2. Create Base Price Config Table
CREATE TABLE IF NOT EXISTS public.config_precos_base (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    modelo TEXT NOT NULL UNIQUE,
    preco_base NUMERIC(10, 2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create Peripheral Discounts Config Table
CREATE TABLE IF NOT EXISTS public.config_descontos_perifericos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    valor_desconto NUMERIC(10, 2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Create Evaluations Table
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

-- 5. Enable Row Level Security
ALTER TABLE public.config_precos_base ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.config_descontos_perifericos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.avaliacoes_iphone ENABLE ROW LEVEL SECURITY;

-- 6. Create Policies

-- config_precos_base policies
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.config_precos_base;
CREATE POLICY "Enable read access for authenticated users" ON public.config_precos_base
    FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Enable write access for admins" ON public.config_precos_base;
CREATE POLICY "Enable write access for admins" ON public.config_precos_base
    FOR ALL TO authenticated USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- config_descontos_perifericos policies
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.config_descontos_perifericos;
CREATE POLICY "Enable read access for authenticated users" ON public.config_descontos_perifericos
    FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Enable write access for admins" ON public.config_descontos_perifericos;
CREATE POLICY "Enable write access for admins" ON public.config_descontos_perifericos
    FOR ALL TO authenticated USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- avaliacoes_iphone policies
DROP POLICY IF EXISTS "Users can insert their own evaluations" ON public.avaliacoes_iphone;
CREATE POLICY "Users can insert their own evaluations" ON public.avaliacoes_iphone
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own or admins view all" ON public.avaliacoes_iphone;
CREATE POLICY "Users can view own or admins view all" ON public.avaliacoes_iphone
    FOR SELECT TO authenticated USING (
        auth.uid() = user_id OR 
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- 7. Seed Initial Data
INSERT INTO public.config_precos_base (modelo, preco_base) VALUES
('iPhone 11 64GB', 1400.00),
('iPhone 11 128GB', 1600.00),
('iPhone 12 64GB', 1800.00),
('iPhone 12 128GB', 2000.00),
('iPhone 13 128GB', 2600.00),
('iPhone 13 Pro Max 128GB', 3800.00),
('iPhone 14 128GB', 3100.00),
('iPhone 14 Pro 128GB', 4200.00),
('iPhone 15 128GB', 4000.00)
ON CONFLICT (modelo) DO NOTHING;

INSERT INTO public.config_descontos_perifericos (nome, valor_desconto) VALUES
('Tela Trocada (Não Genuína)', 350.00),
('Tela Quebrada', 500.00),
('Vidro Traseiro Quebrado', 300.00),
('Bateria < 80% (Manutenção)', 250.00),
('Face ID Inoperante', 450.00),
('Câmera Traseira c/ Manchas', 300.00),
('Câmera Tremendo (Estabilizador)', 400.00),
('Sem Caixa/Acessórios', 80.00),
('Carcaça Muito Arranhada', 150.00),
('Wi-Fi / Bluetooth Falhando', 600.00)
ON CONFLICT DO NOTHING;
