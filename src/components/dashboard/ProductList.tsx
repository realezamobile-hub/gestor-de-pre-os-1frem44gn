import { Product } from '@/types'
import { useProductStore } from '@/stores/useProductStore'
import { useAuthStore } from '@/stores/useAuthStore'
import { Skeleton } from '@/components/ui/skeleton'
import { useIsMobile } from '@/hooks/use-mobile'
import { ProductTable } from './ProductTable'
import { ProductMobileList } from './ProductMobileList'

interface ProductListProps {
  products: Product[]
  isLoading?: boolean
}

export function ProductList({ products, isLoading = false }: ProductListProps) {
  const { toggleDraftItem } = useProductStore()
  const { currentUser } = useAuthStore()
  const isMobile = useIsMobile()

  const canCreateList = currentUser?.canCreateList || false

  const formatPrice = (value: number | null | undefined) => {
    if (value === null || value === undefined) {
      return 'Sob Consulta'
    }
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    })
  }

  const lowestPrice = products.reduce((min, p) => {
    if (p.valor === null || p.valor === undefined) return min
    return p.valor < min ? p.valor : min
  }, Infinity)

  const handleWhatsAppClick = (link?: string | null, phone?: string | null) => {
    if (link) {
      window.open(link, '_blank')
    } else if (phone) {
      const cleanPhone = phone.replace(/\D/g, '')
      window.open(`https://wa.me/${cleanPhone}`, '_blank')
    }
  }

  if (isLoading) {
    return (
      <div className="rounded-md border bg-white shadow-sm overflow-hidden p-4 space-y-4">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="flex items-center space-x-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-24 bg-white rounded-xl border border-dashed">
        <p className="text-gray-500">Nenhum produto encontrado.</p>
      </div>
    )
  }

  if (isMobile) {
    return (
      <ProductMobileList
        products={products}
        lowestPrice={lowestPrice}
        formatPrice={formatPrice}
        onWhatsAppClick={handleWhatsAppClick}
        canCreateList={canCreateList}
        toggleProductSelection={(id) => {
          const product = products.find((p) => p.id === id)
          if (product) toggleDraftItem(product)
        }}
      />
    )
  }

  return (
    <ProductTable
      products={products}
      lowestPrice={lowestPrice}
      formatPrice={formatPrice}
      onWhatsAppClick={handleWhatsAppClick}
      canCreateList={canCreateList}
      toggleProductSelection={(id) => {
        const product = products.find((p) => p.id === id)
        if (product) toggleDraftItem(product)
      }}
    />
  )
}
