-- Migration to create the 'evaluation-evidence' bucket and configure RLS policies
-- Purpose: Fix "Bucket not found" error by ensuring the bucket exists and has proper access control

-- 1. Create the 'evaluation-evidence' bucket if it doesn't exist
-- We set public = true to ensure getPublicUrl() works correctly for frontend image rendering
INSERT INTO storage.buckets (id, name, public)
VALUES ('evaluation-evidence', 'evaluation-evidence', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Create policies for the bucket
-- First drop existing policies to ensure we can recreate them with correct definitions
DROP POLICY IF EXISTS "Authenticated users can upload evaluation evidence" ON storage.objects;
DROP POLICY IF EXISTS "Public can view evaluation evidence" ON storage.objects;

-- Policy: Allow authenticated users to upload (INSERT) files to the bucket
-- This is required for the EvaluationPage to save prints and documents
CREATE POLICY "Authenticated users can upload evaluation evidence"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'evaluation-evidence');

-- Policy: Allow public access to view (SELECT) files
-- This is required because the frontend uses supabase.storage.from(...).getPublicUrl()
-- and displays images using standard <img> tags which don't carry auth headers.
CREATE POLICY "Public can view evaluation evidence"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'evaluation-evidence');
