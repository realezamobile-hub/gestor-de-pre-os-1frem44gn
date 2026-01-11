-- Enable RLS on profiles if not already enabled (safeguard)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Allow admins to update user roles
-- We use DO block to avoid error if policy already exists, though strictly in migrations we usually just CREATE
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'profiles' 
        AND policyname = 'Admins can update user roles'
    ) THEN
        CREATE POLICY "Admins can update user roles" ON public.profiles
            FOR UPDATE
            USING (
                EXISTS (
                    SELECT 1 FROM public.profiles
                    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
                )
            );
    END IF;
END
$$;

-- Create Search Function for Enhanced Catalog Search
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
    FROM public.v_produtos_visiveis
    WHERE
        -- Category Filter
        (category_filters IS NULL OR array_length(category_filters, 1) IS NULL OR categoria = ANY(category_filters))
        AND
        -- Memory Filter
        (memory_filter IS NULL OR memory_filter = 'all' OR memoria = memory_filter)
        AND
        -- Color Filter
        (color_filter IS NULL OR color_filter = 'all' OR cor = color_filter)
        AND
        -- Condition Filter
        (condition_filter IS NULL OR condition_filter = 'all' OR estado = condition_filter)
        AND
        -- Supplier Filter
        (supplier_filter IS NULL OR supplier_filter = 'all' OR fornecedor = supplier_filter)
        AND
        -- Battery Filter
        (battery_filter IS NULL OR battery_filter = 'all' OR bateria = battery_filter)
        AND
        -- Stock Filter
        (in_stock_only IS NULL OR in_stock_only = false OR em_estoque = true)
        AND
        -- Date Filter
        (min_date IS NULL OR criado_em >= min_date)
        AND
        -- Search Query (Multi-column)
        (
            search_query IS NULL OR search_query = '' OR
            (
                modelo ILIKE '%' || search_query || '%' OR
                categoria ILIKE '%' || search_query || '%' OR
                cor ILIKE '%' || search_query || '%' OR
                memoria ILIKE '%' || search_query || '%' OR
                ram ILIKE '%' || search_query || '%' OR
                fornecedor ILIKE '%' || search_query || '%' OR
                obs ILIKE '%' || search_query || '%'
            )
        )
    ORDER BY
        -- Prioritize matches in 'modelo' column
        CASE
            WHEN (search_query IS NOT NULL AND search_query <> '') AND modelo ILIKE '%' || search_query || '%' THEN 0
            ELSE 1
        END,
        valor ASC;
END;
$$;
