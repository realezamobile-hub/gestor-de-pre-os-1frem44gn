CREATE OR REPLACE FUNCTION delete_zero_value_products()
RETURNS integer
LANGUAGE plpgsql
AS $$
DECLARE
  count integer;
BEGIN
  WITH deleted AS (
    DELETE FROM public.produtos
    WHERE valor <= 0 OR valor IS NULL
    RETURNING id
  )
  SELECT count(*) INTO count FROM deleted;
  RETURN count;
END;
$$;
