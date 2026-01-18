-- Migration to add inventory tools and fix search

-- 1. Function to delete products with 0 value
CREATE OR REPLACE FUNCTION delete_zero_value_products()
RETURNS integer
LANGUAGE plpgsql
AS $$
DECLARE
  deleted_count integer;
BEGIN
  WITH deleted AS (
    DELETE FROM public.produtos
    WHERE valor = 0
    RETURNING id
  )
  SELECT count(*) INTO deleted_count FROM deleted;
  RETURN deleted_count;
END;
$$;

-- 2. Function to cleanup by date (creation date)
CREATE OR REPLACE FUNCTION cleanup_by_date(target_date date)
RETURNS json
LANGUAGE plpgsql
AS $$
DECLARE
  prod_count integer;
  msg_count integer;
BEGIN
  -- Delete from produtos based on criado_em
  WITH deleted_prod AS (
    DELETE FROM public.produtos
    WHERE criado_em::date = target_date
    RETURNING id
  )
  SELECT count(*) INTO prod_count FROM deleted_prod;

  -- Delete from mensagens_processadas based on created_at
  WITH deleted_msg AS (
    DELETE FROM public.mensagens_processadas
    WHERE created_at::date = target_date
    RETURNING id
  )
  SELECT count(*) INTO msg_count FROM deleted_msg;

  RETURN json_build_object(
    'products_deleted', prod_count,
    'messages_deleted', msg_count
  );
END;
$$;

-- 3. Fix search_products
DROP FUNCTION IF EXISTS public.search_products;

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
