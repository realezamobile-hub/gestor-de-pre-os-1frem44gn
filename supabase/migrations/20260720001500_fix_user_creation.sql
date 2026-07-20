-- Drop CHECK constraints on role and status that prevent creating users with roles like 'VENDEDOR', 'TECNICO', etc.
DO $$
BEGIN
  -- Drop role check constraint if it exists (name may vary)
  ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
  ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check1;
  ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check2;
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

-- Also try dropping any check constraint that references the role column
DO $$
DECLARE
  constraint_name TEXT;
BEGIN
  SELECT conname INTO constraint_name
  FROM pg_constraint
  WHERE conrelid = 'public.profiles'::regclass
    AND contype = 'c'
    AND pg_get_constraintdef(oid) ILIKE '%role%';
  IF constraint_name IS NOT NULL THEN
    EXECUTE format('ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS %I', constraint_name);
  END IF;
END $$;

-- Update handle_new_user trigger to respect role from metadata and use ON CONFLICT
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role, status, can_create_list)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'VENDEDOR'),
    'pending',
    FALSE
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Ensure the super admin user has correct settings
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

    INSERT INTO public.profiles (id, email, name, role, status, is_super_admin, access_allowed, subscription_status, subscription_type, active_modules)
    VALUES (
      target_user_id, 'danieldocdias@gmail.com', 'Daniel Dias', 'ADMIN', 'active', true, true, 'active', 'monthly',
      '["melhor_preco", "leads", "generator", "evaluation", "cadastro", "reports", "admin"]'::jsonb
    )
    ON CONFLICT (id) DO UPDATE SET
      is_super_admin = true,
      role = 'ADMIN',
      status = 'active',
      access_allowed = true,
      subscription_status = 'active',
      active_modules = '["melhor_preco", "leads", "generator", "evaluation", "cadastro", "reports", "admin"]'::jsonb;
  ELSE
    UPDATE public.profiles
    SET is_super_admin = true, role = 'ADMIN', status = 'active', access_allowed = true, subscription_status = 'active',
        active_modules = '["melhor_preco", "leads", "generator", "evaluation", "cadastro", "reports", "admin"]'::jsonb
    WHERE email = 'danieldocdias@gmail.com';
  END IF;
END $$;
