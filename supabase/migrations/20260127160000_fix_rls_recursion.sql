-- Create a secure function to access user claims without triggering RLS recursion
CREATE OR REPLACE FUNCTION public.get_my_claims()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    claims jsonb;
BEGIN
    SELECT jsonb_build_object(
        'role', role,
        'company_id', company_id,
        'is_super_admin', is_super_admin
    ) INTO claims
    FROM public.profiles
    WHERE id = auth.uid();
    
    RETURN claims;
END;
$$;

-- Grant access to the function
GRANT EXECUTE ON FUNCTION public.get_my_claims TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_my_claims TO service_role;

-- Fix Profiles Policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Company Admins and Super Admins view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Super Admin can update all" ON public.profiles;
DROP POLICY IF EXISTS "Company Admin can update own company users" ON public.profiles;

CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins and Super Admins view profiles" ON public.profiles
    FOR SELECT USING (
        (public.get_my_claims()->>'is_super_admin')::boolean = true
        OR 
        (
            (public.get_my_claims()->>'role')::text = 'ADMIN' 
            AND 
            company_id = (public.get_my_claims()->>'company_id')::uuid
        )
    );

CREATE POLICY "Super Admin can update all" ON public.profiles
    FOR UPDATE USING (
        (public.get_my_claims()->>'is_super_admin')::boolean = true
    );

CREATE POLICY "Company Admin can update own company users" ON public.profiles
    FOR UPDATE USING (
        (public.get_my_claims()->>'role')::text = 'ADMIN' 
        AND 
        company_id = (public.get_my_claims()->>'company_id')::uuid
    );

-- Fix Empresas Policies
ALTER TABLE public.empresas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Super Admin sees all companies" ON public.empresas;
DROP POLICY IF EXISTS "Users see their own company" ON public.empresas;

CREATE POLICY "Super Admin sees all companies" ON public.empresas
    FOR ALL
    USING (
        (public.get_my_claims()->>'is_super_admin')::boolean = true
    );

CREATE POLICY "Users see their own company" ON public.empresas
    FOR SELECT
    USING (
        id = (public.get_my_claims()->>'company_id')::uuid
    );

-- Fix Isolation Policies for data tables
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
        
        -- Drop old policies
        EXECUTE format('DROP POLICY IF EXISTS "Isolation Policy %I" ON public.%I', t, t);
        
        -- Create new safe policy using get_my_claims
        EXECUTE format('
            CREATE POLICY "Isolation Policy %I" ON public.%I
            FOR ALL
            USING (
                company_id = (public.get_my_claims()->>''company_id'')::uuid
                OR
                (public.get_my_claims()->>''is_super_admin'')::boolean = true
            )
        ', t, t);
    END LOOP;
END $$;
