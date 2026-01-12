-- Migration: Seed iPhone Prices
-- Pre-populate config_precos_base with iPhone models (11 to 16 Pro Max)

INSERT INTO public.config_precos_base (modelo, preco_base) VALUES
-- iPhone 11
('iPhone 11 64GB', 1200.00),
('iPhone 11 128GB', 1400.00),
('iPhone 11 256GB', 1600.00),

-- iPhone 11 Pro
('iPhone 11 Pro 64GB', 1600.00),
('iPhone 11 Pro 256GB', 1900.00),
('iPhone 11 Pro 512GB', 2100.00),

-- iPhone 11 Pro Max
('iPhone 11 Pro Max 64GB', 1900.00),
('iPhone 11 Pro Max 256GB', 2300.00),
('iPhone 11 Pro Max 512GB', 2500.00),

-- iPhone 12 Mini
('iPhone 12 Mini 64GB', 1400.00),
('iPhone 12 Mini 128GB', 1600.00),
('iPhone 12 Mini 256GB', 1800.00),

-- iPhone 12
('iPhone 12 64GB', 1700.00),
('iPhone 12 128GB', 1900.00),
('iPhone 12 256GB', 2100.00),

-- iPhone 12 Pro
('iPhone 12 Pro 128GB', 2300.00),
('iPhone 12 Pro 256GB', 2600.00),
('iPhone 12 Pro 512GB', 2800.00),

-- iPhone 12 Pro Max
('iPhone 12 Pro Max 128GB', 2700.00),
('iPhone 12 Pro Max 256GB', 3000.00),
('iPhone 12 Pro Max 512GB', 3300.00),

-- iPhone 13 Mini
('iPhone 13 Mini 128GB', 2000.00),
('iPhone 13 Mini 256GB', 2300.00),
('iPhone 13 Mini 512GB', 2600.00),

-- iPhone 13
('iPhone 13 128GB', 2400.00),
('iPhone 13 256GB', 2700.00),
('iPhone 13 512GB', 3000.00),

-- iPhone 13 Pro
('iPhone 13 Pro 128GB', 3200.00),
('iPhone 13 Pro 256GB', 3600.00),
('iPhone 13 Pro 512GB', 4000.00),
('iPhone 13 Pro 1TB', 4400.00),

-- iPhone 13 Pro Max
('iPhone 13 Pro Max 128GB', 3800.00),
('iPhone 13 Pro Max 256GB', 4200.00),
('iPhone 13 Pro Max 512GB', 4600.00),
('iPhone 13 Pro Max 1TB', 5000.00),

-- iPhone 14
('iPhone 14 128GB', 3000.00),
('iPhone 14 256GB', 3400.00),
('iPhone 14 512GB', 3800.00),

-- iPhone 14 Plus
('iPhone 14 Plus 128GB', 3200.00),
('iPhone 14 Plus 256GB', 3600.00),
('iPhone 14 Plus 512GB', 4000.00),

-- iPhone 14 Pro
('iPhone 14 Pro 128GB', 4100.00),
('iPhone 14 Pro 256GB', 4600.00),
('iPhone 14 Pro 512GB', 5200.00),
('iPhone 14 Pro 1TB', 5800.00),

-- iPhone 14 Pro Max
('iPhone 14 Pro Max 128GB', 4600.00),
('iPhone 14 Pro Max 256GB', 5200.00),
('iPhone 14 Pro Max 512GB', 5800.00),
('iPhone 14 Pro Max 1TB', 6400.00),

-- iPhone 15
('iPhone 15 128GB', 3800.00),
('iPhone 15 256GB', 4300.00),
('iPhone 15 512GB', 5000.00),

-- iPhone 15 Plus
('iPhone 15 Plus 128GB', 4200.00),
('iPhone 15 Plus 256GB', 4700.00),
('iPhone 15 Plus 512GB', 5400.00),

-- iPhone 15 Pro
('iPhone 15 Pro 128GB', 5200.00),
('iPhone 15 Pro 256GB', 5800.00),
('iPhone 15 Pro 512GB', 6800.00),
('iPhone 15 Pro 1TB', 7800.00),

-- iPhone 15 Pro Max
('iPhone 15 Pro Max 256GB', 6200.00),
('iPhone 15 Pro Max 512GB', 7200.00),
('iPhone 15 Pro Max 1TB', 8200.00),

-- iPhone 16
('iPhone 16 128GB', 5800.00),
('iPhone 16 256GB', 6400.00),
('iPhone 16 512GB', 7200.00),

-- iPhone 16 Plus
('iPhone 16 Plus 128GB', 6500.00),
('iPhone 16 Plus 256GB', 7000.00),
('iPhone 16 Plus 512GB', 7800.00),

-- iPhone 16 Pro
('iPhone 16 Pro 128GB', 7500.00),
('iPhone 16 Pro 256GB', 8200.00),
('iPhone 16 Pro 512GB', 9500.00),
('iPhone 16 Pro 1TB', 10800.00),

-- iPhone 16 Pro Max
('iPhone 16 Pro Max 256GB', 8800.00),
('iPhone 16 Pro Max 512GB', 10000.00),
('iPhone 16 Pro Max 1TB', 11500.00)

ON CONFLICT (modelo) DO UPDATE 
SET preco_base = EXCLUDED.preco_base;
