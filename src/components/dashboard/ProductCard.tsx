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
import { ShoppingCart, Check, TrendingDown, Package, Lock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useProductStore } from '@/stores/useProductStore'
import { useAuthStore } from '@/stores/useAuthStore'

interface ProductCardProps {
  product: Product
  suppliers: Supplier[]
}

export function ProductCard({ product, suppliers }: ProductCardProps) {
  const { selectedProducts, toggleProductSelection, getBestPrice } =
    useProductStore()
  const { currentUser } = useAuthStore()

  const isSelected = selectedProducts.some((p) => p.id === product.id)
  const bestOffer = getBestPrice(product)
  const canCreateList = currentUser?.canCreateList || false

  // Sort prices for matrix
  const sortedPrices = [...product.prices].sort((a, b) => a.price - b.price)

  return (
    <Card
      className={cn(
        'group overflow-hidden transition-all duration-300 hover:shadow-elevation hover:-translate-y-1',
        isSelected && 'ring-2 ring-primary border-primary shadow-md',
      )}
    >
      <CardHeader className="p-0 relative">
        <div className="relative aspect-square bg-gray-100 overflow-hidden">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute top-2 right-2 flex flex-col gap-1 items-end">
            <Badge className="bg-black/80 backdrop-blur-sm text-xs font-medium border-0">
              {product.brand}
            </Badge>
            <Badge
              variant="secondary"
              className={cn(
                'backdrop-blur-sm text-xs shadow-sm border-0',
                product.condition === 'Novo'
                  ? 'bg-emerald-500/90 text-white'
                  : 'bg-amber-500/90 text-white',
              )}
            >
              {product.condition}
            </Badge>
          </div>

          {bestOffer && (
            <div className="absolute bottom-2 left-2 right-2 bg-emerald-600/90 backdrop-blur-md text-white px-3 py-2 rounded-lg shadow-lg flex items-center justify-between animate-in fade-in slide-in-from-bottom-2">
              <div className="flex items-center gap-1.5">
                <TrendingDown className="w-4 h-4" />
                <span className="text-xs font-medium">Melhor Preço</span>
              </div>
              <span className="font-bold text-lg">
                R${' '}
                {bestOffer.price.toLocaleString('pt-BR', {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-4">
        <CardTitle
          className="text-base font-bold mb-1 line-clamp-2 min-h-[3rem]"
          title={product.name}
        >
          {product.name}
        </CardTitle>

        {/* Specs Grid */}
        <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-xs text-muted-foreground mb-4">
          <div className="flex gap-1">
            <span className="font-medium text-gray-900">Cor:</span>
            <span className="truncate">{product.color}</span>
          </div>
          <div className="flex gap-1">
            <span className="font-medium text-gray-900">Mem:</span>
            <span className="truncate">{product.memory}</span>
          </div>
          <div className="flex gap-1">
            <span className="font-medium text-gray-900">Bat:</span>
            <span className="truncate">{product.battery || '-'}</span>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-muted-foreground border-t pt-2">
            <div className="flex items-center gap-1.5">
              <Package className="w-3.5 h-3.5" />
              <span>{suppliers.length} ofertas</span>
            </div>
          </div>

          <div className="space-y-1.5 bg-gray-50 p-2 rounded-lg border border-gray-100">
            {sortedPrices.slice(0, 3).map((price, idx) => {
              const supplier = suppliers.find((s) => s.id === price.supplierId)
              const isBest = idx === 0
              return (
                <div
                  key={price.supplierId}
                  className={cn(
                    'flex justify-between items-center text-xs p-1.5 rounded transition-colors',
                    isBest
                      ? 'bg-emerald-100/50 text-emerald-900 font-medium'
                      : 'text-gray-600',
                    !price.inStock && 'opacity-60 grayscale',
                  )}
                >
                  <span className="truncate max-w-[120px] flex items-center gap-1">
                    {supplier?.name}
                    {!price.inStock && (
                      <span className="text-[10px] bg-gray-200 px-1 rounded text-gray-500">
                        Sem estoque
                      </span>
                    )}
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
          disabled={!canCreateList}
          className={cn(
            'w-full transition-all duration-300',
            isSelected
              ? 'bg-primary/10 text-primary hover:bg-primary/20'
              : 'shadow-sm',
            !canCreateList && 'opacity-80 cursor-not-allowed',
          )}
          onClick={() => canCreateList && toggleProductSelection(product)}
        >
          {!canCreateList ? (
            <>
              <Lock className="w-4 h-4 mr-2" /> Sem Permissão
            </>
          ) : isSelected ? (
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
