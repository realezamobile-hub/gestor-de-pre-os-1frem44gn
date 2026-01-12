-- Update Search Function for Enhanced Multi-Term Catalog Search
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
DECLARE
    search_terms text[];
    term text;
BEGIN
    -- Split search query into terms if provided
    IF search_query IS NOT NULL AND search_query <> '' THEN
        search_terms := string_to_array(trim(search_query), ' ');
        -- Remove empty strings from array (in case of multiple spaces)
        search_terms := array_remove(search_terms, '');
    END IF;

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
        -- Enhanced Multi-term Search
        (
            search_query IS NULL OR search_query = '' OR
            (
                -- Check if ALL terms match the product (in any searchable field)
                -- Uses NOT EXISTS to ensure there is no term that FAILS to match at least one column
                NOT EXISTS (
                    SELECT 1
                    FROM unnest(search_terms) AS t(term)
                    WHERE NOT (
                        COALESCE(p.modelo, '') ILIKE '%' || term || '%' OR
                        COALESCE(p.categoria, '') ILIKE '%' || term || '%' OR
                        COALESCE(p.cor, '') ILIKE '%' || term || '%' OR
                        COALESCE(p.memoria, '') ILIKE '%' || term || '%' OR
                        COALESCE(p.ram, '') ILIKE '%' || term || '%' OR
                        COALESCE(p.fornecedor, '') ILIKE '%' || term || '%' OR
                        COALESCE(p.obs, '') ILIKE '%' || term || '%'
                    )
                )
            )
        )
    ORDER BY
        -- Prioritize matches in 'modelo' column
        CASE
            -- Exact/Full phrase match in model (Highest priority)
            WHEN search_query IS NOT NULL AND search_query <> '' AND p.modelo ILIKE '%' || search_query || '%' THEN 0
            -- All terms present in model (High priority)
            WHEN search_query IS NOT NULL AND search_query <> '' AND (
                NOT EXISTS (
                    SELECT 1 FROM unnest(search_terms) AS t(term)
                    WHERE p.modelo NOT ILIKE '%' || term || '%'
                )
            ) THEN 1
            -- Default (matches found in combination of fields)
            ELSE 2
        END,
        p.valor ASC;
END;
$$;
