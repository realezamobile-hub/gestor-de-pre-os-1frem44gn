import { Product, Supplier } from '@/types'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ShoppingCart, Check, TrendingDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useProductStore } from '@/stores/useProductStore'

interface ProductCardProps {
  product: Product
  suppliers: Supplier[]
}

export function ProductCard({ product, suppliers }: ProductCardProps) {
  const { selectedProducts, toggleProductSelection, getBestPrice } =
    useProductStore()

  const isSelected = selectedProducts.some((p) => p.id === product.id)
  const bestOffer = getBestPrice(product)

  // Sort prices for matrix
  const sortedPrices = [...product.prices].sort((a, b) => a.price - b.price)

  return (
    <Card
      className={cn(
        'overflow-hidden transition-all duration-300 hover:shadow-lg',
        isSelected && 'ring-2 ring-primary border-primary',
      )}
    >
      <CardHeader className="p-0">
        <div className="relative aspect-square">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover transition-transform hover:scale-105"
          />
          <Badge className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm">
            {product.brand}
          </Badge>
          {bestOffer && (
            <div className="absolute bottom-2 left-2 bg-emerald-500 text-white text-xs font-bold px-2 py-1 rounded-md shadow-sm flex items-center gap-1">
              <TrendingDown className="w-3 h-3" />
              R${' '}
              {bestOffer.price.toLocaleString('pt-BR', {
                minimumFractionDigits: 2,
              })}
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-4">
        <CardTitle className="text-lg mb-2 line-clamp-1" title={product.name}>
          {product.name}
        </CardTitle>

        <div className="space-y-2 mt-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Matriz de Preços
          </p>
          <div className="space-y-1">
            {sortedPrices.slice(0, 3).map((price, idx) => {
              const supplier = suppliers.find((s) => s.id === price.supplierId)
              const isBest = idx === 0
              return (
                <div
                  key={price.supplierId}
                  className={cn(
                    'flex justify-between items-center text-sm p-1.5 rounded',
                    isBest
                      ? 'bg-emerald-50 text-emerald-900 font-medium'
                      : 'text-gray-600',
                  )}
                >
                  <span className="truncate max-w-[120px]">
                    {supplier?.name}
                  </span>
                  <span>
                    R${' '}
                    {price.price.toLocaleString('pt-BR', {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button
          variant={isSelected ? 'secondary' : 'default'}
          className="w-full"
          onClick={() => toggleProductSelection(product)}
        >
          {isSelected ? (
            <>
              <Check className="w-4 h-4 mr-2" /> Selecionado
            </>
          ) : (
            <>
              <ShoppingCart className="w-4 h-4 mr-2" /> Adicionar à Lista
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
