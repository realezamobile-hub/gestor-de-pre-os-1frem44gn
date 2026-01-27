-- Migration to grant Super Admin privileges to specific user
UPDATE public.profiles
SET 
    is_super_admin = true,
    role = 'ADMIN'
WHERE email = 'realezamobile@gmail.com';

-- Ensure the user exists in profiles (safeguard, though they should exist if they logged in)
-- We can't insert easily without the auth.users id, but the UPDATE above handles the requirement for existing user.

-- Policy Update: Ensure Super Admin can bypass strict RLS if not already covered
-- (Existing policies in 20260127150000_multi_tenant_init.sql already cover is_super_admin access)
