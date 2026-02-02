-- Migration to add delete_zero_value_products function and setup avatars storage

-- 1. Create RPC function for deleting zero value products safely scoped by company
CREATE OR REPLACE FUNCTION delete_zero_value_products(p_company_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_count INTEGER;
  v_user_company UUID;
BEGIN
  -- Validate input
  IF p_company_id IS NULL THEN
    RAISE EXCEPTION 'Company ID is required';
  END IF;

  -- Check permissions: User must belong to the company or be super admin
  SELECT company_id INTO v_user_company FROM public.profiles WHERE id = auth.uid();
  
  IF v_user_company IS DISTINCT FROM p_company_id AND 
     NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_super_admin = true) THEN
    RAISE EXCEPTION 'Unauthorized: You can only delete products for your own company';
  END IF;

  WITH deleted AS (
    DELETE FROM public.produtos
    WHERE company_id = p_company_id
      AND (valor <= 0 OR valor IS NULL)
    RETURNING id
  )
  SELECT count(*) INTO v_count FROM deleted;
  
  RETURN v_count;
END;
$$;

-- 2. Setup Storage for Avatars
-- Attempt to insert the bucket if it doesn't exist.
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies to ensure clean state (if they exist)
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Upload" ON storage.objects;
DROP POLICY IF EXISTS "Update Own Avatar" ON storage.objects;
DROP POLICY IF EXISTS "Delete Own Avatar" ON storage.objects;

-- Create Policies
-- 1. Public Read Access
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'avatars' );

-- 2. Authenticated Upload (User can upload their own files)
CREATE POLICY "Authenticated Upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'avatars' );

-- 3. Update Own Avatar (User can update their own files)
-- Using name pattern convention: userId/filename
CREATE POLICY "Update Own Avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING ( bucket_id = 'avatars' AND name LIKE auth.uid()::text || '/%' );

-- 4. Delete Own Avatar
CREATE POLICY "Delete Own Avatar"
ON storage.objects FOR DELETE
TO authenticated
USING ( bucket_id = 'avatars' AND name LIKE auth.uid()::text || '/%' );
