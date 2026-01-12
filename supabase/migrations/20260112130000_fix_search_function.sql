-- Update Search Function for Stable Single-String Search
-- Reverts complex multi-term logic to ensure reliability and stability
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
        -- Standard filters
        (category_filters IS NULL OR array_length(category_filters, 1) IS NULL OR categoria = ANY(category_filters))
        AND (memory_filter IS NULL OR memory_filter = 'all' OR memoria = memory_filter)
        AND (color_filter IS NULL OR color_filter = 'all' OR cor = color_filter)
        AND (condition_filter IS NULL OR condition_filter = 'all' OR estado = condition_filter)
        AND (supplier_filter IS NULL OR supplier_filter = 'all' OR fornecedor = supplier_filter)
        AND (battery_filter IS NULL OR battery_filter = 'all' OR bateria = battery_filter)
        AND (in_stock_only IS NULL OR in_stock_only = false OR em_estoque = true)
        AND (min_date IS NULL OR criado_em >= min_date)
        AND
        -- Simplified Single-String Search Logic (Matches ANY column)
        (
            search_query IS NULL OR search_query = '' OR
            (
                COALESCE(p.modelo, '') ILIKE '%' || search_query || '%' OR
                COALESCE(p.categoria, '') ILIKE '%' || search_query || '%' OR
                COALESCE(p.cor, '') ILIKE '%' || search_query || '%' OR
                COALESCE(p.memoria, '') ILIKE '%' || search_query || '%' OR
                COALESCE(p.ram, '') ILIKE '%' || search_query || '%' OR
                COALESCE(p.fornecedor, '') ILIKE '%' || search_query || '%'
            )
        )
    ORDER BY
        -- Simple relevance sorting (Model matches prioritize first)
        CASE
            WHEN search_query IS NOT NULL AND search_query <> '' AND p.modelo ILIKE '%' || search_query || '%' THEN 0
            ELSE 1
        END,
        p.valor ASC;
END;
$$;
