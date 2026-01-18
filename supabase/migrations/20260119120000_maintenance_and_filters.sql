-- Add can_delete_records column to profiles if it doesn't exist
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS can_delete_records BOOLEAN DEFAULT FALSE;

-- Function to delete products with value = 0
CREATE OR REPLACE FUNCTION delete_zero_value_products()
RETURNS integer
LANGUAGE plpgsql
AS $$
DECLARE
  count integer;
BEGIN
  WITH deleted AS (
    DELETE FROM public.produtos
    WHERE valor = 0 OR valor IS NULL
    RETURNING id
  )
  SELECT count(*) INTO count FROM deleted;
  RETURN count;
END;
$$;

-- Function to cleanup records by specific date
CREATE OR REPLACE FUNCTION cleanup_by_date(target_date date)
RETURNS json
LANGUAGE plpgsql
AS $$
DECLARE
  p_count integer;
  m_count integer;
BEGIN
  -- Delete products created on the target date
  WITH dp AS (
    DELETE FROM public.produtos
    WHERE date(criado_em) = target_date
    RETURNING id
  )
  SELECT count(*) INTO p_count FROM dp;

  -- Delete processed messages created on the target date
  WITH dm AS (
    DELETE FROM public.mensagens_processadas
    WHERE date(created_at) = target_date
    RETURNING id
  )
  SELECT count(*) INTO m_count FROM dm;

  RETURN json_build_object('products_deleted', p_count, 'messages_deleted', m_count);
END;
$$;

-- Function to delete sold or out of stock items
CREATE OR REPLACE FUNCTION delete_sold_items()
RETURNS integer
LANGUAGE plpgsql
AS $$
DECLARE
  deleted_count integer;
BEGIN
  WITH deleted AS (
    DELETE FROM public.produtos
    WHERE em_estoque = false OR data_venda IS NOT NULL
    RETURNING id
  )
  SELECT count(*) INTO deleted_count FROM deleted;
  RETURN deleted_count;
END;
$$;

-- Enhanced search_products function for accurate filtering
CREATE OR REPLACE FUNCTION public.search_products(
    search_query text,
    category_filters text[],
    memory_filter text,
    color_filter text,
    condition_filter text,
    supplier_filter text,
    battery_filter text,
    in_stock_only boolean,
    min_date timestamptz
)
RETURNS SETOF public.v_produtos_visiveis
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT *
    FROM public.v_produtos_visiveis p
    WHERE
        (category_filters IS NULL OR category_filters = '{}' OR categoria = ANY(category_filters))
        AND (memory_filter IS NULL OR memory_filter = 'all' OR memoria = memory_filter)
        AND (color_filter IS NULL OR color_filter = 'all' OR cor = color_filter)
        AND (condition_filter IS NULL OR condition_filter = 'all' OR estado = condition_filter)
        AND (supplier_filter IS NULL OR supplier_filter = 'all' OR fornecedor = supplier_filter)
        AND (battery_filter IS NULL OR battery_filter = 'all' OR bateria = battery_filter)
        AND (in_stock_only IS NULL OR in_stock_only = false OR em_estoque = true)
        AND (min_date IS NULL OR criado_em >= min_date)
        AND (
            search_query IS NULL OR search_query = '' OR
            (
                p.modelo ILIKE '%' || search_query || '%' OR
                p.categoria ILIKE '%' || search_query || '%' OR
                p.cor ILIKE '%' || search_query || '%' OR
                p.memoria ILIKE '%' || search_query || '%' OR
                p.ram ILIKE '%' || search_query || '%' OR
                p.fornecedor ILIKE '%' || search_query || '%' OR
                p.obs ILIKE '%' || search_query || '%'
            )
        )
    ORDER BY
        CASE 
            WHEN search_query IS NOT NULL AND search_query <> '' AND p.modelo ILIKE search_query || '%' THEN 0 
            WHEN search_query IS NOT NULL AND search_query <> '' AND p.modelo ILIKE '%' || search_query || '%' THEN 1
            ELSE 2 
        END,
        p.valor ASC;
END;
$$;
