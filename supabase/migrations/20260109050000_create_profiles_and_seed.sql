-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT,
  email TEXT,
  phone TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'blocked')),
  can_create_list BOOLEAN DEFAULT FALSE,
  last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role, status, can_create_list)
  VALUES (
    new.id, 
    new.email, 
    COALESCE(new.raw_user_meta_data->>'name', new.email), 
    'user', 
    'pending',
    FALSE
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Seed data for produtos if empty (Simulating data from WhatsApp)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.produtos LIMIT 1) THEN
    INSERT INTO public.produtos (modelo, categoria, memoria, cor, valor, fornecedor, em_estoque, estado, bateria, criado_em)
    VALUES 
    ('iPhone 15 Pro Max', 'Smartphone', '256GB', 'Titânio Natural', 6800.00, 'Global Eletrônicos', true, 'Novo', '100%', NOW()),
    ('iPhone 15 Pro Max', 'Smartphone', '256GB', 'Titânio Azul', 6750.00, 'Mega Imports', true, 'Novo', '100%', NOW()),
    ('iPhone 14', 'Smartphone', '128GB', 'Estelar', 3500.00, 'Global Eletrônicos', true, 'Vitrine', '98%', NOW()),
    ('MacBook Air M2', 'Laptop', '256GB', 'Space Grey', 7200.00, 'Tech Distribuidora', true, 'Novo', '100%', NOW()),
    ('iPad Air 5', 'Tablet', '64GB', 'Azul', 3800.00, 'Fast Shop Atacado', true, 'Novo', '100%', NOW()),
    ('Redmi Note 13', 'Smartphone', '256GB', 'Preto', 1200.00, 'Mega Imports', true, 'Novo', '100%', NOW()),
    ('Galaxy S24 Ultra', 'Smartphone', '512GB', 'Titânio Cinza', 6200.00, 'Global Eletrônicos', true, 'Novo', '100%', NOW()),
    ('iPhone 13', 'Smartphone', '128GB', 'Rosa', 2500.00, 'Tech Distribuidora', true, 'Usado', '82%', NOW()),
    ('iPhone 11', 'Smartphone', '64GB', 'Preto', 1800.00, 'Mega Imports', false, 'Usado', '79%', NOW()),
    ('MacBook Pro M1', 'Laptop', '512GB', 'Prata', 8500.00, 'Fast Shop Atacado', true, 'Usado', '92%', NOW());
  END IF;
END $$;
