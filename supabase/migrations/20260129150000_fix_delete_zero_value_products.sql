CREATE OR REPLACE FUNCTION delete_zero_value_products(p_company_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  count integer;
BEGIN
  -- Validate input
  IF p_company_id IS NULL THEN
    RAISE EXCEPTION 'company_id is required';
  END IF;

  WITH deleted AS (
    DELETE FROM public.produtos
    WHERE (valor <= 0 OR valor IS NULL)
    AND company_id = p_company_id::text  -- Casting uuid to text to match column type if needed, or straightforward comparison
    RETURNING id
  )
  SELECT count(*) INTO count FROM deleted;
  
  RETURN count;
END;
$$;
