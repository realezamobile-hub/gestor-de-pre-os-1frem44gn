-- Create table for checklist categories
CREATE TABLE IF NOT EXISTS config_checklist_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES empresas(id),
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE config_checklist_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for authenticated users" ON config_checklist_categories
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Enable insert for authenticated users" ON config_checklist_categories
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users" ON config_checklist_categories
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Enable delete for authenticated users" ON config_checklist_categories
  FOR DELETE
  TO authenticated
  USING (true);

-- Migrate existing categories
INSERT INTO config_checklist_categories (name, company_id)
SELECT DISTINCT categoria, company_id 
FROM config_checklist_items 
WHERE categoria IS NOT NULL;

-- Add category_id to items
ALTER TABLE config_checklist_items 
ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES config_checklist_categories(id) ON DELETE CASCADE;

-- Link items to new categories
UPDATE config_checklist_items
SET category_id = config_checklist_categories.id
FROM config_checklist_categories
WHERE config_checklist_items.categoria = config_checklist_categories.name
  AND (
    config_checklist_items.company_id = config_checklist_categories.company_id 
    OR (config_checklist_items.company_id IS NULL AND config_checklist_categories.company_id IS NULL)
  );

-- Drop the old text column
ALTER TABLE config_checklist_items DROP COLUMN IF EXISTS categoria;
