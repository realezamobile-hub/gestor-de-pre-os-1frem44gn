export type Role = 'admin' | 'user'

export type UserStatus = 'pending' | 'active' | 'blocked'

export interface User {
  id: string
  name: string
  email: string
  role: Role
  status: UserStatus
  phone?: string
  lastActive: string // ISO Date string
  currentSessionId: string | null
  createdAt: string
  canCreateList: boolean // New permission
}

export interface Supplier {
  id: string
  name: string
  rating: number
}

export interface Price {
  supplierId: string
  price: number
  lastUpdated: string
  inStock: boolean
}

export interface Product {
  id: string
  name: string // Often constructed from Model + Memory + Color
  model: string // e.g., "iPhone 15 Pro Max"
  brand: string // Apple, Xiaomi, Samsung
  category: string // Smartphone, Tablet, Laptop, Watch
  memory?: string // 128GB, 256GB
  color?: string // Titanium Black, Blue
  condition: 'Novo' | 'Vitrine' | 'Usado' | 'Recondicionado'
  battery?: string // 100%, 90%+ (for used/vitrine)
  imageUrl: string
  prices: Price[]
}

export interface FilterState {
  search: string
  brand: string | 'all'
  category: string | 'all'
  model: string | 'all'
  memory: string | 'all'
  color: string | 'all'
  condition: string | 'all'
  supplierId: string | 'all'
  inStockOnly: boolean
}
