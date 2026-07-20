-- Drop ALL CHECK constraints on profiles.role and profiles.status columns
-- These constraints restrict role to ('admin','user') and status to ('pending','active','blocked')
-- which conflicts with the app's use of 'ADMIN','VENDEDOR','TECNICO','ADMINISTRATIVO' for roles
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

-- Update handle_new_user trigger to safely handle profile creation
-- Uses ON CONFLICT (id) DO NOTHING so it won't fail if profile already exists
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

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Ensure all existing profiles have valid values (no NULLs where defaults should be)
UPDATE public.profiles
SET status = COALESCE(status, 'pending')
WHERE status IS NULL;

UPDATE public.profiles
SET role = COALESCE(role, 'VENDEDOR')
WHERE role IS NULL;
