-- Create an index to speed up the lookup of products by company and value
-- using IF NOT EXISTS to avoid errors if it was manually added or re-run
CREATE INDEX IF NOT EXISTS idx_produtos_company_valor_cleanup 
ON public.produtos (company_id, valor);

-- Update the function to be more performant and robust
-- We use CREATE OR REPLACE to update the existing function definition
CREATE OR REPLACE FUNCTION delete_zero_value_products(p_company_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
-- Increase statement timeout to 5 minutes (300s) to handle large datasets globally
SET statement_timeout = '300s' 
AS $$
DECLARE
  deleted_count integer;
BEGIN
  -- Validate input to ensure scope safety
  IF p_company_id IS NULL THEN
    RAISE EXCEPTION 'O ID da empresa é obrigatório.';
  END IF;

  -- Perform deletion directly.
  -- The criteria handles both zero/negative values AND NULL values.
  -- Casting p_company_id to text ensures compatibility with the column type if it varies,
  -- while the index on (company_id, valor) optimizes the scan.
  DELETE FROM public.produtos
  WHERE company_id = p_company_id::text
  AND (valor <= 0 OR valor IS NULL);

  -- Get the number of affected rows without the overhead of RETURNING *
  GET DIAGNOSTICS deleted_count = ROW_COUNT;

  RETURN deleted_count;
END;
$$;
