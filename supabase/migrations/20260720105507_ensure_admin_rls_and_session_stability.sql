-- Drop any remaining CHECK constraints on profiles.role and profiles.status
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN (
    SELECT conname
    FROM pg_constraint
    WHERE conrelid = 'public.profiles'::regclass
      AND contype = 'c'
      AND (
        pg_get_constraintdef(oid) ILIKE '%role%'
        OR pg_get_constraintdef(oid) ILIKE '%status%'
      )
  ) LOOP
    EXECUTE format('ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS %I', r.conname);
  END LOOP;
END $$;

ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_status_check;
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check1;
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_status_check1;

-- Ensure RLS is enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- SELECT: Admins and Super Admins can view all profiles; users can view own
DROP POLICY IF EXISTS "Admins and Super Admins view profiles" ON public.profiles;
CREATE POLICY "Admins and Super Admins view profiles" ON public.profiles
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND (p.is_super_admin = true OR p.role ILIKE 'admin')
    )
    OR auth.uid() = id
  );

DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT TO authenticated USING (auth.uid() = id);

-- INSERT: Admins and Super Admins can insert profiles
DROP POLICY IF EXISTS "Admins can insert profiles" ON public.profiles;
CREATE POLICY "Admins can insert profiles" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND (p.is_super_admin = true OR p.role ILIKE 'admin')
    )
  );

-- UPDATE: Admins can update any profile
DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;
CREATE POLICY "Admins can update any profile" ON public.profiles
  FOR UPDATE TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND (p.is_super_admin = true OR p.role ILIKE 'admin')
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND (p.is_super_admin = true OR p.role ILIKE 'admin')
    )
  );

-- UPDATE: Users can update own profile
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- UPDATE: Super Admin can update all
DROP POLICY IF EXISTS "Super Admin can update all profiles" ON public.profiles;
CREATE POLICY "Super Admin can update all profiles" ON public.profiles
  FOR UPDATE TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.is_super_admin = true
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.is_super_admin = true
    )
  );

-- UPDATE: Company Admin can update own company users
DROP POLICY IF EXISTS "Company Admin can update own company users" ON public.profiles;
CREATE POLICY "Company Admin can update own company users" ON public.profiles
  FOR UPDATE TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role ILIKE 'admin' AND p.company_id = profiles.company_id
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role ILIKE 'admin' AND p.company_id = profiles.company_id
    )
  );

-- Ensure handle_new_user trigger is robust
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id, email, name, role, status, can_create_list,
    subscription_status, access_allowed, active_modules
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'VENDEDOR'),
    'pending',
    FALSE,
    'pending',
    FALSE,
    '["melhor_preco"]'::jsonb
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Ensure block_expired_users skips admins
CREATE OR REPLACE FUNCTION public.block_expired_users()
RETURNS void AS $$
BEGIN
  UPDATE public.profiles
  SET access_allowed = false, subscription_status = 'expired'
  WHERE (
    (next_billing_date IS NOT NULL AND next_billing_date < NOW())
    OR
    (access_expires_at IS NOT NULL AND access_expires_at < NOW())
  )
  AND COALESCE(access_allowed, false) = true
  AND COALESCE(is_super_admin, false) = false
  AND COALESCE(role, '') NOT ILIKE 'admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure all existing profiles have valid values
UPDATE public.profiles SET status = COALESCE(status, 'pending') WHERE status IS NULL;
UPDATE public.profiles SET role = COALESCE(role, 'VENDEDOR') WHERE role IS NULL;
UPDATE public.profiles SET active_modules = '["melhor_preco"]'::jsonb WHERE active_modules IS NULL;

-- Fix any NULL token columns in auth.users
UPDATE auth.users
SET
  confirmation_token = COALESCE(confirmation_token, ''),
  recovery_token = COALESCE(recovery_token, ''),
  email_change_token_new = COALESCE(email_change_token_new, ''),
  email_change = COALESCE(email_change, ''),
  email_change_token_current = COALESCE(email_change_token_current, ''),
  phone_change = COALESCE(phone_change, ''),
  phone_change_token = COALESCE(phone_change_token, ''),
  reauthentication_token = COALESCE(reauthentication_token, '')
WHERE
  confirmation_token IS NULL OR recovery_token IS NULL
  OR email_change_token_new IS NULL OR email_change IS NULL
  OR email_change_token_current IS NULL
  OR phone_change IS NULL OR phone_change_token IS NULL
  OR reauthentication_token IS NULL;

-- Ensure admin seed user exists
DO $$
DECLARE
  target_user_id uuid;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'danieldocdias@gmail.com') THEN
    target_user_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current,
      phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      target_user_id,
      '00000000-0000-0000-0000-000000000000',
      'danieldocdias@gmail.com',
      crypt('Skip@Pass', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Daniel Dias"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '',
      NULL, '', '', ''
    );

    INSERT INTO public.profiles (
      id, email, name, role, status, is_super_admin,
      access_allowed, subscription_status, subscription_type, active_modules
    )
    VALUES (
      target_user_id, 'danieldocdias@gmail.com', 'Daniel Dias', 'ADMIN', 'active', true,
      true, 'active', 'monthly',
      '["melhor_preco", "leads", "generator", "evaluation", "cadastro", "reports", "admin"]'::jsonb
    )
    ON CONFLICT (id) DO NOTHING;
  ELSE
    UPDATE public.profiles
    SET
      is_super_admin = true,
      role = 'ADMIN',
      status = 'active',
      access_allowed = true,
      subscription_status = 'active',
      subscription_type = COALESCE(subscription_type, 'monthly'),
      active_modules = '["melhor_preco", "leads", "generator", "evaluation", "cadastro", "reports", "admin"]'::jsonb
    WHERE email = 'danieldocdias@gmail.com';
  END IF;
END $$;
