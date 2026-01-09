import { Product, Supplier, User } from '@/types'

export const INITIAL_SUPPLIERS: Supplier[] = [
  { id: 'sup1', name: 'Global Eletrônicos', rating: 4.8 },
  { id: 'sup2', name: 'Mega Imports', rating: 4.5 },
  { id: 'sup3', name: 'Tech Distribuidora', rating: 4.2 },
  { id: 'sup4', name: 'Fast Shop Atacado', rating: 4.7 },
]

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'p1',
    name: 'iPhone 15 Pro Max 256GB Titânio Natural',
    model: 'iPhone 15 Pro Max',
    brand: 'Apple',
    category: 'Smartphone',
    memory: '256GB',
    color: 'Titânio Natural',
    condition: 'Novo',
    battery: '100%',
    imageUrl:
      'https://img.usecurling.com/p/300/300?q=iphone%2015%20pro%20max%20natural&dpr=2',
    prices: [
      {
        supplierId: 'sup1',
        price: 6800,
        lastUpdated: new Date().toISOString(),
        inStock: true,
      },
      {
        supplierId: 'sup2',
        price: 6750,
        lastUpdated: new Date().toISOString(),
        inStock: true,
      },
      {
        supplierId: 'sup3',
        price: 6900,
        lastUpdated: new Date().toISOString(),
        inStock: false,
      },
    ],
  },
  {
    id: 'p2',
    name: 'iPhone 14 128GB Estelar Vitrine',
    model: 'iPhone 14',
    brand: 'Apple',
    category: 'Smartphone',
    memory: '128GB',
    color: 'Estelar',
    condition: 'Vitrine',
    battery: '95%+',
    imageUrl:
      'https://img.usecurling.com/p/300/300?q=iphone%2014%20white&dpr=2',
    prices: [
      {
        supplierId: 'sup1',
        price: 3500,
        lastUpdated: new Date().toISOString(),
        inStock: true,
      },
    ],
  },
  {
    id: 'p3',
    name: 'MacBook Air M2 13" 256GB Space Grey',
    model: 'MacBook Air M2',
    brand: 'Apple',
    category: 'Laptop',
    memory: '256GB',
    color: 'Space Grey',
    condition: 'Novo',
    battery: '100%',
    imageUrl: 'https://img.usecurling.com/p/300/300?q=macbook%20air%20m2&dpr=2',
    prices: [
      {
        supplierId: 'sup1',
        price: 7200,
        lastUpdated: new Date().toISOString(),
        inStock: true,
      },
      {
        supplierId: 'sup4',
        price: 7100,
        lastUpdated: new Date().toISOString(),
        inStock: true,
      },
    ],
  },
  {
    id: 'p4',
    name: 'Xiaomi Redmi Note 13 8GB/256GB Preto',
    model: 'Redmi Note 13',
    brand: 'Xiaomi',
    category: 'Smartphone',
    memory: '256GB',
    color: 'Preto',
    condition: 'Novo',
    battery: '100%',
    imageUrl:
      'https://img.usecurling.com/p/300/300?q=redmi%20note%2013%20black&dpr=2',
    prices: [
      {
        supplierId: 'sup2',
        price: 1200,
        lastUpdated: new Date().toISOString(),
        inStock: true,
      },
      {
        supplierId: 'sup3',
        price: 1150,
        lastUpdated: new Date().toISOString(),
        inStock: true,
      },
      {
        supplierId: 'sup4',
        price: 1180,
        lastUpdated: new Date().toISOString(),
        inStock: true,
      },
    ],
  },
  {
    id: 'p5',
    name: 'Samsung Galaxy S24 Ultra 512GB Titânio Cinza',
    model: 'Galaxy S24 Ultra',
    brand: 'Samsung',
    category: 'Smartphone',
    memory: '512GB',
    color: 'Titânio Cinza',
    condition: 'Novo',
    battery: '100%',
    imageUrl:
      'https://img.usecurling.com/p/300/300?q=galaxy%20s24%20ultra&dpr=2',
    prices: [
      {
        supplierId: 'sup1',
        price: 6200,
        lastUpdated: new Date().toISOString(),
        inStock: true,
      },
      {
        supplierId: 'sup3',
        price: 6100,
        lastUpdated: new Date().toISOString(),
        inStock: true,
      },
    ],
  },
  {
    id: 'p6',
    name: 'iPad Air 5 64GB Wi-Fi Azul',
    model: 'iPad Air 5',
    brand: 'Apple',
    category: 'Tablet',
    memory: '64GB',
    color: 'Azul',
    condition: 'Novo',
    battery: '100%',
    imageUrl:
      'https://img.usecurling.com/p/300/300?q=ipad%20air%205%20blue&dpr=2',
    prices: [
      {
        supplierId: 'sup1',
        price: 3800,
        lastUpdated: new Date().toISOString(),
        inStock: true,
      },
      {
        supplierId: 'sup2',
        price: 3750,
        lastUpdated: new Date().toISOString(),
        inStock: false,
      },
    ],
  },
  {
    id: 'p7',
    name: 'iPhone 13 128GB Rosa (Usado)',
    model: 'iPhone 13',
    brand: 'Apple',
    category: 'Smartphone',
    memory: '128GB',
    color: 'Rosa',
    condition: 'Usado',
    battery: '82%',
    imageUrl: 'https://img.usecurling.com/p/300/300?q=iphone%2013%20pink&dpr=2',
    prices: [
      {
        supplierId: 'sup3',
        price: 2500,
        lastUpdated: new Date().toISOString(),
        inStock: true,
      },
    ],
  },
]

export const INITIAL_ADMIN: User = {
  id: 'admin-1',
  name: 'Administrador Principal',
  email: 'admin@app.com',
  role: 'admin',
  status: 'active',
  lastActive: new Date().toISOString(),
  currentSessionId: null,
  createdAt: new Date().toISOString(),
  canCreateList: true,
}
