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
}

export interface Product {
  id: string
  name: string
  brand: string // Apple, Xiaomi, Samsung
  category: string // Smartphone, Tablet, Laptop, Watch
  imageUrl: string
  prices: Price[]
}

export interface FilterState {
  search: string
  brand: string | 'all'
  category: string | 'all'
}
