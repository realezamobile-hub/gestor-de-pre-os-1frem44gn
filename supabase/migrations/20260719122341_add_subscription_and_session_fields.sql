ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'pending';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS access_allowed BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS access_expires_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS current_session_id TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP WITH TIME ZONE;

UPDATE public.profiles
SET access_allowed = true, subscription_status = 'active'
WHERE is_super_admin = true OR role ILIKE 'admin';

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

    INSERT INTO public.profiles (id, email, name, role, status, is_super_admin, access_allowed, subscription_status)
    VALUES (target_user_id, 'danieldocdias@gmail.com', 'Daniel Dias', 'ADMIN', 'active', true, true, 'active')
    ON CONFLICT (id) DO UPDATE SET
      is_super_admin = true,
      role = 'ADMIN',
      status = 'active',
      access_allowed = true,
      subscription_status = 'active';
  ELSE
    UPDATE public.profiles
    SET is_super_admin = true, role = 'ADMIN', status = 'active', access_allowed = true, subscription_status = 'active'
    WHERE email = 'danieldocdias@gmail.com';
  END IF;
END $$;
