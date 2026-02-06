-- Migration to add payment proof column and configure evaluations bucket

-- 1. Add url_comprovante_pagamento column to avaliacoes_iphone table
ALTER TABLE avaliacoes_iphone ADD COLUMN IF NOT EXISTS url_comprovante_pagamento TEXT;

-- 2. Create the 'evaluations' bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('evaluations', 'evaluations', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 3. Create policies for the bucket
DROP POLICY IF EXISTS "Authenticated users can upload evaluations" ON storage.objects;
DROP POLICY IF EXISTS "Public can view evaluations" ON storage.objects;

-- Policy: Allow authenticated users to upload (INSERT) files to the bucket
CREATE POLICY "Authenticated users can upload evaluations"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'evaluations');

-- Policy: Allow public access to view (SELECT) files
CREATE POLICY "Public can view evaluations"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'evaluations');
