-- Add group_name to draft items
ALTER TABLE public.whatsapp_draft_items ADD COLUMN IF NOT EXISTS group_name TEXT;

-- Create generated_lists table
CREATE TABLE IF NOT EXISTS public.generated_lists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    title TEXT,
    content TEXT,
    type TEXT CHECK (type IN ('supplier', 'posting')),
    header_footer_data JSONB
);

-- RLS Policies
ALTER TABLE public.generated_lists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own generated lists" ON public.generated_lists
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own generated lists" ON public.generated_lists
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own generated lists" ON public.generated_lists
    FOR DELETE USING (auth.uid() = user_id);
