ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS subscription_type TEXT DEFAULT 'trial';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS monthly_fee NUMERIC DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS next_billing_date TIMESTAMPTZ;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS active_modules JSONB DEFAULT '["melhor_preco"]'::jsonb;

UPDATE public.profiles
SET active_modules = '["melhor_preco", "leads", "generator", "evaluation", "cadastro", "reports", "admin"]'::jsonb
WHERE is_super_admin = true OR role ILIKE 'admin';

UPDATE public.profiles
SET next_billing_date = (NOW() + INTERVAL '30 days')::timestamptz
WHERE access_allowed = true
  AND subscription_type = 'monthly'
  AND next_billing_date IS NULL
  AND COALESCE(is_super_admin, false) = false;

CREATE TABLE IF NOT EXISTS public.payment_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL DEFAULT 0,
  payment_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by_admin_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.payment_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "payment_logs_admin_all" ON public.payment_logs;
CREATE POLICY "payment_logs_admin_all" ON public.payment_logs
  FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND (is_super_admin = true OR role ILIKE 'admin'))
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND (is_super_admin = true OR role ILIKE 'admin'))
  );

DROP POLICY IF EXISTS "payment_logs_user_read_own" ON public.payment_logs;
CREATE POLICY "payment_logs_user_read_own" ON public.payment_logs
  FOR SELECT TO authenticated USING (profile_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_payment_logs_profile_id ON public.payment_logs(profile_id);
CREATE INDEX IF NOT EXISTS idx_payment_logs_payment_date ON public.payment_logs(payment_date);

CREATE OR REPLACE FUNCTION public.block_expired_users()
RETURNS void AS $$
BEGIN
  UPDATE public.profiles
  SET access_allowed = false, subscription_status = 'expired'
  WHERE next_billing_date IS NOT NULL
    AND next_billing_date < NOW()
    AND access_allowed = true
    AND COALESCE(is_super_admin, false) = false
    AND role ILIKE 'admin' = false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

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
