-- Fix block_expired_users to also check access_expires_at
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
  AND access_allowed = true
  AND COALESCE(is_super_admin, false) = false
  AND COALESCE(role, '') NOT ILIKE 'admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure existing admins and super admins have proper access
UPDATE public.profiles
SET
  status = COALESCE(status, 'active'),
  access_allowed = true,
  subscription_status = COALESCE(subscription_status, 'active')
WHERE (is_super_admin = true OR role ILIKE 'admin')
  AND (access_allowed IS NULL OR access_allowed = false);

-- Ensure all profiles have active_modules
UPDATE public.profiles
SET active_modules = '["melhor_preco"]'::jsonb
WHERE active_modules IS NULL;
