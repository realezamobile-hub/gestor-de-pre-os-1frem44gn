-- Create table for dynamic checklist items
CREATE TABLE IF NOT EXISTS config_checklist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES empresas(id),
  categoria TEXT NOT NULL,
  nome TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Update config_descontos_perifericos to support model-specific pricing and link to checklist
ALTER TABLE config_descontos_perifericos 
ADD COLUMN IF NOT EXISTS modelo_id UUID REFERENCES config_precos_base(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS checklist_item_id UUID REFERENCES config_checklist_items(id) ON DELETE CASCADE;

-- Update avaliacoes_iphone to store customer data and evidence
ALTER TABLE avaliacoes_iphone
ADD COLUMN IF NOT EXISTS nome_cliente TEXT,
ADD COLUMN IF NOT EXISTS telefone_cliente TEXT,
ADD COLUMN IF NOT EXISTS cpf_cliente TEXT,
ADD COLUMN IF NOT EXISTS url_print_seguranca TEXT,
ADD COLUMN IF NOT EXISTS url_foto_documento TEXT;

-- Create policy for storage (if needed, but usually handled in dashboard)
-- We assume bucket 'evaluation-evidence' exists or will be created.

-- Add RLS policies for config_checklist_items if RLS is enabled on other tables
-- Assuming standard RLS pattern exists:
ALTER TABLE config_checklist_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for authenticated users" ON config_checklist_items
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Enable insert for authenticated users" ON config_checklist_items
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users" ON config_checklist_items
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Enable delete for authenticated users" ON config_checklist_items
  FOR DELETE
  TO authenticated
  USING (true);
