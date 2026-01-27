-- Migration to audit and fix search, view and filtering logic

-- Drop view and cascade to functions to allow column reordering
-- This is necessary because CREATE OR REPLACE VIEW cannot change column types or names of existing columns
DROP VIEW IF EXISTS public.v_produtos_visiveis CASCADE;

-- 1. Redefine v_produtos_visiveis to ensure no implicit filtering of valid products
CREATE OR REPLACE VIEW public.v_produtos_visiveis AS
SELECT
    p.id,
    p.modelo,
    p.categoria,
    p.ram,
    p.memoria,
    p.cor,
    p.estado,
    p.bateria,
    p.valor,
    p.fornecedor,
    p.telefone,
    p.link_whatsapp,
    p.obs,
    p.criado_em,
    p.em_estoque,
    p.data_venda,
    p.modo
FROM
    public.produtos p;

-- 2. Update get_product_filters to include supplier_filter context for dynamic options
CREATE OR REPLACE FUNCTION public.get_product_filters(
    p_search_query text,
    p_min_date timestamptz,
    p_supplier_filter text DEFAULT NULL
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
            -- Date Filter
            (p_min_date IS NULL OR criado_em >= p_min_date)
            AND 
            -- Search Query
            (
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
            AND 
            -- Supplier Filter
            (
                p_supplier_filter IS NULL OR p_supplier_filter = '' OR
                fornecedor ILIKE '%' || p_supplier_filter || '%'
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

-- 3. Update search_products to be robust, use partial matching and correct date logic
CREATE OR REPLACE FUNCTION public.search_products(
    search_query text,
    category_filters text[],
    memory_filter text,
    color_filter text,
    condition_filter text,
    supplier_filter text,
    battery_filter text,
    in_stock_only boolean,
    min_date timestamptz,
    ram_filter text DEFAULT NULL
)
RETURNS SETOF public.v_produtos_visiveis
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT *
    FROM public.v_produtos_visiveis p
    WHERE
        -- Category
        (category_filters IS NULL OR category_filters = '{}' OR categoria = ANY(category_filters))
        AND 
        -- Memory
        (memory_filter IS NULL OR memory_filter = 'all' OR memoria = memory_filter)
        AND 
        -- Color
        (color_filter IS NULL OR color_filter = 'all' OR cor = color_filter)
        AND 
        -- Condition
        (condition_filter IS NULL OR condition_filter = 'all' OR estado = condition_filter)
        AND 
        -- Supplier (Partial Match)
        (
            supplier_filter IS NULL OR 
            supplier_filter = '' OR 
            supplier_filter = 'all' OR 
            fornecedor ILIKE '%' || supplier_filter || '%'
        )
        AND 
        -- Battery
        (battery_filter IS NULL OR battery_filter = 'all' OR bateria = battery_filter)
        AND 
        -- RAM
        (ram_filter IS NULL OR ram_filter = 'all' OR ram = ram_filter)
        AND 
        -- Stock (Only enforce if explicitly true, otherwise show all including out of stock if in_stock_only is false/null)
        (in_stock_only IS NULL OR in_stock_only = false OR em_estoque = true)
        AND 
        -- Date (If NULL, return all history)
        (min_date IS NULL OR criado_em >= min_date)
        AND 
        -- Search Query (Comprehensive ILIKE)
        (
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
        -- Sorting relevance
        CASE 
            WHEN search_query IS NOT NULL AND search_query <> '' AND p.modelo ILIKE search_query || '%' THEN 0 
            WHEN search_query IS NOT NULL AND search_query <> '' AND p.modelo ILIKE '%' || search_query || '%' THEN 1
            ELSE 2 
        END,
        p.valor ASC;
END;
$$;
