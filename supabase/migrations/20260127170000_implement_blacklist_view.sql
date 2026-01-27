-- Migration to implement supplier blacklist logic in v_produtos_visiveis

-- 1. Update v_produtos_visiveis to exclude suppliers listed in fornecedores_excluidos
-- Using CREATE OR REPLACE VIEW to update definition while preserving dependent objects if possible.
-- Logic: Exclude if fornecedor matches nome (case-insensitive) OR telefone matches telefone (exact).
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
    public.produtos p
WHERE
    NOT EXISTS (
        SELECT 1 
        FROM public.fornecedores_excluidos fe 
        WHERE 
            (fe.nome IS NOT NULL AND fe.nome <> '' AND p.fornecedor ILIKE fe.nome)
            OR 
            (fe.telefone IS NOT NULL AND fe.telefone <> '' AND p.telefone = fe.telefone)
    );

-- 2. Restore v_monitor_precos (Price Monitor View)
-- This view depends on v_produtos_visiveis and may have been dropped by previous CASCADE operations.
CREATE OR REPLACE VIEW public.v_monitor_precos AS
SELECT DISTINCT ON (modelo)
    id,
    modelo,
    categoria,
    valor,
    fornecedor,
    telefone,
    criado_em
FROM public.v_produtos_visiveis
WHERE valor IS NOT NULL
ORDER BY modelo, valor ASC;

-- 3. Update search_products function to reflect the view changes explicitly
-- This ensures the function uses the filtered view.
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
        (category_filters IS NULL OR category_filters = '{}' OR categoria = ANY(category_filters))
        AND (memory_filter IS NULL OR memory_filter = 'all' OR memoria = memory_filter)
        AND (color_filter IS NULL OR color_filter = 'all' OR cor = color_filter)
        AND (condition_filter IS NULL OR condition_filter = 'all' OR estado = condition_filter)
        AND (supplier_filter IS NULL OR supplier_filter = '' OR supplier_filter = 'all' OR fornecedor ILIKE '%' || supplier_filter || '%')
        AND (battery_filter IS NULL OR battery_filter = 'all' OR bateria = battery_filter)
        AND (ram_filter IS NULL OR ram_filter = 'all' OR ram = ram_filter)
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
