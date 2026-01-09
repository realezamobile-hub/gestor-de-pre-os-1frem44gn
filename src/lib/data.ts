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
    name: 'iPhone 15 Pro Max 256GB',
    brand: 'Apple',
    category: 'Smartphone',
    imageUrl:
      'https://img.usecurling.com/p/300/300?q=iphone%2015%20pro%20max&dpr=2',
    prices: [
      {
        supplierId: 'sup1',
        price: 6800,
        lastUpdated: new Date().toISOString(),
      },
      {
        supplierId: 'sup2',
        price: 6750,
        lastUpdated: new Date().toISOString(),
      },
      {
        supplierId: 'sup3',
        price: 6900,
        lastUpdated: new Date().toISOString(),
      },
    ],
  },
  {
    id: 'p2',
    name: 'MacBook Air M2 13"',
    brand: 'Apple',
    category: 'Laptop',
    imageUrl: 'https://img.usecurling.com/p/300/300?q=macbook%20air%20m2&dpr=2',
    prices: [
      {
        supplierId: 'sup1',
        price: 7200,
        lastUpdated: new Date().toISOString(),
      },
      {
        supplierId: 'sup4',
        price: 7100,
        lastUpdated: new Date().toISOString(),
      },
    ],
  },
  {
    id: 'p3',
    name: 'Xiaomi Redmi Note 13',
    brand: 'Xiaomi',
    category: 'Smartphone',
    imageUrl: 'https://img.usecurling.com/p/300/300?q=redmi%20note%2013&dpr=2',
    prices: [
      {
        supplierId: 'sup2',
        price: 1200,
        lastUpdated: new Date().toISOString(),
      },
      {
        supplierId: 'sup3',
        price: 1150,
        lastUpdated: new Date().toISOString(),
      },
      {
        supplierId: 'sup4',
        price: 1180,
        lastUpdated: new Date().toISOString(),
      },
    ],
  },
  {
    id: 'p4',
    name: 'Samsung Galaxy S24 Ultra',
    brand: 'Samsung',
    category: 'Smartphone',
    imageUrl:
      'https://img.usecurling.com/p/300/300?q=galaxy%20s24%20ultra&dpr=2',
    prices: [
      {
        supplierId: 'sup1',
        price: 6200,
        lastUpdated: new Date().toISOString(),
      },
      {
        supplierId: 'sup3',
        price: 6100,
        lastUpdated: new Date().toISOString(),
      },
    ],
  },
  {
    id: 'p5',
    name: 'iPad Air 5',
    brand: 'Apple',
    category: 'Tablet',
    imageUrl: 'https://img.usecurling.com/p/300/300?q=ipad%20air%205&dpr=2',
    prices: [
      {
        supplierId: 'sup1',
        price: 4500,
        lastUpdated: new Date().toISOString(),
      },
      {
        supplierId: 'sup2',
        price: 4450,
        lastUpdated: new Date().toISOString(),
      },
    ],
  },
  {
    id: 'p6',
    name: 'Xiaomi Pad 6',
    brand: 'Xiaomi',
    category: 'Tablet',
    imageUrl: 'https://img.usecurling.com/p/300/300?q=xiaomi%20pad%206&dpr=2',
    prices: [
      {
        supplierId: 'sup3',
        price: 2100,
        lastUpdated: new Date().toISOString(),
      },
      {
        supplierId: 'sup4',
        price: 2050,
        lastUpdated: new Date().toISOString(),
      },
    ],
  },
  {
    id: 'p7',
    name: 'AirPods Pro 2',
    brand: 'Apple',
    category: 'Accessories',
    imageUrl: 'https://img.usecurling.com/p/300/300?q=airpods%20pro%202&dpr=2',
    prices: [
      {
        supplierId: 'sup1',
        price: 1300,
        lastUpdated: new Date().toISOString(),
      },
      {
        supplierId: 'sup2',
        price: 1250,
        lastUpdated: new Date().toISOString(),
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
}
