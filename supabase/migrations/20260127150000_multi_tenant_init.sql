-- 1. Create Companies Table
CREATE TABLE IF NOT EXISTS public.empresas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome_fantasia TEXT NOT NULL,
    razao_social TEXT,
    cnpj TEXT,
    modulos_ativos JSONB DEFAULT '["catalogo", "generator", "evaluation"]'::jsonb,
    configuracoes JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create Default Company (Migration Step)
-- We insert a default company to migrate existing data
INSERT INTO public.empresas (id, nome_fantasia, razao_social, modulos_ativos)
VALUES ('00000000-0000-0000-0000-000000000000', 'Matriz', 'Empresa Padrão', '["catalogo", "generator", "evaluation", "admin"]')
ON CONFLICT (id) DO NOTHING;

-- 3. Update Profiles Table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.empresas(id);
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_super_admin BOOLEAN DEFAULT FALSE;

-- FIX: Drop constraint before updating roles to avoid violation of existing check constraints
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

-- Migrate existing profiles to default company
UPDATE public.profiles SET company_id = '00000000-0000-0000-0000-000000000000' WHERE company_id IS NULL;
UPDATE public.profiles SET is_super_admin = TRUE WHERE email = 'realezamobile@gmail.com';

-- Update Role Types
-- We will just normalize existing roles to new UpperCase standard for simplicity in code
UPDATE public.profiles SET role = 'ADMIN' WHERE role = 'admin';
UPDATE public.profiles SET role = 'VENDEDOR' WHERE role = 'user';

-- Re-add constraint with new values
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('ADMIN', 'VENDEDOR', 'TECNICO', 'ADMINISTRATIVO'));

-- 4. Add company_id to other tables
DO $$
DECLARE
    t text;
BEGIN
    FOR t IN 
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name IN ('produtos', 'avaliacoes_iphone', 'whatsapp_draft_items', 'generated_lists', 'fornecedores_excluidos', 'config_precos_base', 'config_descontos_perifericos')
    LOOP
        EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.empresas(id)', t);
        EXECUTE format('UPDATE public.%I SET company_id = %L WHERE company_id IS NULL', t, '00000000-0000-0000-0000-000000000000');
    END LOOP;
END $$;

-- 5. Enable RLS and Create Policies

-- Empresas
ALTER TABLE public.empresas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Super Admin sees all companies" ON public.empresas;
CREATE POLICY "Super Admin sees all companies" ON public.empresas
    FOR ALL
    USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.is_super_admin = true)
    );

DROP POLICY IF EXISTS "Users see their own company" ON public.empresas;
CREATE POLICY "Users see their own company" ON public.empresas
    FOR SELECT
    USING (
        id = (SELECT company_id FROM public.profiles WHERE profiles.id = auth.uid())
    );

-- Profiles (Update existing or create new)
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Company Admins and Super Admins view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Super Admin can update all" ON public.profiles;
DROP POLICY IF EXISTS "Company Admin can update own company users" ON public.profiles;

CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Company Admins and Super Admins view profiles" ON public.profiles
    FOR SELECT USING (
        (SELECT is_super_admin FROM public.profiles WHERE id = auth.uid()) 
        OR 
        (
            (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'ADMIN' 
            AND 
            company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid())
        )
    );

CREATE POLICY "Super Admin can update all" ON public.profiles
    FOR UPDATE USING (
        (SELECT is_super_admin FROM public.profiles WHERE id = auth.uid())
    );

CREATE POLICY "Company Admin can update own company users" ON public.profiles
    FOR UPDATE USING (
        (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'ADMIN' 
        AND 
        company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid())
    );

-- General Data Tables Policy Generator
DO $$
DECLARE
    t text;
BEGIN
    FOR t IN 
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name IN ('produtos', 'avaliacoes_iphone', 'whatsapp_draft_items', 'generated_lists', 'fornecedores_excluidos', 'config_precos_base', 'config_descontos_perifericos')
    LOOP
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
        
        -- Drop existing policies to avoid conflicts
        EXECUTE format('DROP POLICY IF EXISTS "Isolation Policy %I" ON public.%I', t, t);
        
        -- Create isolation policy
        EXECUTE format('
            CREATE POLICY "Isolation Policy %I" ON public.%I
            FOR ALL
            USING (
                company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid())
                OR
                (SELECT is_super_admin FROM public.profiles WHERE id = auth.uid())
            )
        ', t, t);
    END LOOP;
END $$;

-- 6. Trigger to auto-assign company_id on insert for products etc if missing
CREATE OR REPLACE FUNCTION public.set_company_id()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.company_id IS NULL THEN
        NEW.company_id := (SELECT company_id FROM public.profiles WHERE id = auth.uid());
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DO $$
DECLARE
    t text;
BEGIN
    FOR t IN 
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name IN ('produtos', 'avaliacoes_iphone', 'whatsapp_draft_items', 'generated_lists', 'fornecedores_excluidos')
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS set_company_id_trigger ON public.%I', t);
        EXECUTE format('CREATE TRIGGER set_company_id_trigger BEFORE INSERT ON public.%I FOR EACH ROW EXECUTE FUNCTION public.set_company_id()', t);
    END LOOP;
END $$;
