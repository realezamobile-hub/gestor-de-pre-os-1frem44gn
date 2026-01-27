CREATE OR REPLACE FUNCTION perform_daily_cleanup(target_date date)
RETURNS json
LANGUAGE plpgsql
AS $$
DECLARE
  p_count integer;
  m_count integer;
BEGIN
  -- Delete products where data_venda <= target_date (ignoring empty strings)
  WITH dp AS (
    DELETE FROM public.produtos
    WHERE data_venda IS NOT NULL 
    AND data_venda <> ''
    AND data_venda::date <= target_date
    RETURNING id
  )
  SELECT count(*) INTO p_count FROM dp;

  -- Delete processed messages where data_recebimento <= target_date (ignoring empty strings)
  WITH dm AS (
    DELETE FROM public.mensagens_processadas
    WHERE data_recebimento IS NOT NULL 
    AND data_recebimento <> ''
    AND data_recebimento::date <= target_date
    RETURNING id
  )
  SELECT count(*) INTO m_count FROM dm;

  RETURN json_build_object('products_deleted', p_count, 'messages_deleted', m_count);
END;
$$;
