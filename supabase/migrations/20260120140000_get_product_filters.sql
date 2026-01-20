CREATE OR REPLACE FUNCTION public.get_product_filters(
    p_search_query text,
    p_min_date timestamptz
)
RETURNS json
LANGUAGE plpgsql
AS $$
DECLARE
    result json;
BEGIN
    WITH filtered_products AS (
        SELECT ram, memoria, cor
        FROM public.v_produtos_visiveis
        WHERE
            (p_min_date IS NULL OR criado_em >= p_min_date)
            AND (
                p_search_query IS NULL OR p_search_query = '' OR
                (
                    modelo ILIKE '%' || p_search_query || '%' OR
                    categoria ILIKE '%' || p_search_query || '%' OR
                    cor ILIKE '%' || p_search_query || '%' OR
                    memoria ILIKE '%' || p_search_query || '%' OR
                    ram ILIKE '%' || p_search_query || '%' OR
                    fornecedor ILIKE '%' || p_search_query || '%' OR
                    obs ILIKE '%' || p_search_query || '%'
                )
            )
    )
    SELECT json_build_object(
        'rams', (SELECT COALESCE(array_agg(DISTINCT ram ORDER BY ram), '{}') FROM filtered_products WHERE ram IS NOT NULL AND ram <> ''),
        'memories', (SELECT COALESCE(array_agg(DISTINCT memoria ORDER BY memoria), '{}') FROM filtered_products WHERE memoria IS NOT NULL AND memoria <> ''),
        'colors', (SELECT COALESCE(array_agg(DISTINCT cor ORDER BY cor), '{}') FROM filtered_products WHERE cor IS NOT NULL AND cor <> '')
    ) INTO result;

    RETURN result;
END;
$$;
