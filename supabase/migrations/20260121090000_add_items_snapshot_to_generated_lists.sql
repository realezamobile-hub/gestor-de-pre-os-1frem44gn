-- Add items_snapshot to generated_lists to store the state of items at generation time
ALTER TABLE public.generated_lists ADD COLUMN IF NOT EXISTS items_snapshot JSONB;
