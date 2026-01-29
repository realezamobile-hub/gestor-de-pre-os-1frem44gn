-- Add can_view_all_lists column to profiles if it doesn't exist
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS can_view_all_lists BOOLEAN DEFAULT FALSE;

-- Add foreign key from generated_lists to profiles to allow joining for name retrieval
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'generated_lists_user_id_profiles_fkey'
    ) THEN
        ALTER TABLE public.generated_lists 
        ADD CONSTRAINT generated_lists_user_id_profiles_fkey 
        FOREIGN KEY (user_id) 
        REFERENCES public.profiles(id);
    END IF;
END $$;

-- Drop existing policy if it exists to replace it
DROP POLICY IF EXISTS "Users can view their own generated lists" ON public.generated_lists;
DROP POLICY IF EXISTS "Users can view generated lists based on permission" ON public.generated_lists;

-- Create updated policy
CREATE POLICY "Users can view generated lists based on permission" ON public.generated_lists
FOR SELECT USING (
  -- User can always view their own lists
  auth.uid() = user_id
  OR
  -- Or user can view all lists if they have permission and belong to the same company
  (
    (SELECT company_id FROM public.profiles WHERE id = auth.uid()) = company_id
    AND
    (SELECT can_view_all_lists FROM public.profiles WHERE id = auth.uid()) = true
  )
);

