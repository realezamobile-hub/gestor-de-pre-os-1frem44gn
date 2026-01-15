CREATE TABLE IF NOT EXISTS public.whatsapp_draft_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id BIGINT REFERENCES public.produtos(id) ON DELETE SET NULL,
    custom_model TEXT,
    custom_details TEXT,
    custom_price NUMERIC,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, product_id)
);

ALTER TABLE public.whatsapp_draft_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own draft items" ON public.whatsapp_draft_items
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own draft items" ON public.whatsapp_draft_items
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own draft items" ON public.whatsapp_draft_items
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own draft items" ON public.whatsapp_draft_items
    FOR DELETE USING (auth.uid() = user_id);
