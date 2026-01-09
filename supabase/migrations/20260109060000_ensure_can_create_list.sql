-- Ensure profiles table has can_create_list column
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'can_create_list'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN can_create_list BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- Ensure profiles table has proper RLS policies for admin
DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;
CREATE POLICY "Admins can update any profile" 
ON public.profiles 
FOR UPDATE 
USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);
