-- Drop ALL CHECK constraints on profiles.role and profiles.status columns
-- These constraints restrict role to ('admin','user') and status to ('pending','active','blocked')
-- which conflicts with the app's use of 'ADMIN','VENDEDOR','TECNICO','ADMINISTRATIVO'
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

-- Update handle_new_user trigger to be robust and set all required fields
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

-- Fix block_expired_users to properly check both billing and access expiry
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
UPDATE public.profiles
SET status = COALESCE(status, 'pending')
WHERE status IS NULL;

UPDATE public.profiles
SET role = COALESCE(role, 'VENDEDOR')
WHERE role IS NULL;

UPDATE public.profiles
SET active_modules = '["melhor_preco"]'::jsonb
WHERE active_modules IS NULL;
