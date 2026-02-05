-- Enable Row Level Security on the clientes table
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;

-- Remove any existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view clients from their company" ON public.clientes;
DROP POLICY IF EXISTS "Users can insert clients for their company" ON public.clientes;
DROP POLICY IF EXISTS "Users can update clients from their company" ON public.clientes;
DROP POLICY IF EXISTS "Users can delete clients from their company" ON public.clientes;

-- Policy for SELECT: Users can view clients that belong to their company
CREATE POLICY "Users can view clients from their company"
ON public.clientes
FOR SELECT
USING (
  company_id IN (
    SELECT company_id FROM public.profiles
    WHERE id = auth.uid()
  )
);

-- Policy for INSERT: Users can insert clients for their company
CREATE POLICY "Users can insert clients for their company"
ON public.clientes
FOR INSERT
WITH CHECK (
  company_id IN (
    SELECT company_id FROM public.profiles
    WHERE id = auth.uid()
  )
);

-- Policy for UPDATE: Users can update clients from their company
CREATE POLICY "Users can update clients from their company"
ON public.clientes
FOR UPDATE
USING (
  company_id IN (
    SELECT company_id FROM public.profiles
    WHERE id = auth.uid()
  )
);

-- Policy for DELETE: Users can delete clients from their company
CREATE POLICY "Users can delete clients from their company"
ON public.clientes
FOR DELETE
USING (
  company_id IN (
    SELECT company_id FROM public.profiles
    WHERE id = auth.uid()
  )
);
