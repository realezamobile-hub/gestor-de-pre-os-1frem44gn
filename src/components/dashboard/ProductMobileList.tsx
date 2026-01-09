import { Product } from '@/types'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MessageCircle, Battery, Cpu, Smartphone, Truck } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useProductStore } from '@/stores/useProductStore'

interface ProductMobileListProps {
  products: Product[]
  lowestPrice: number
  formatPrice: (value: number | null | undefined) => string
  onWhatsAppClick: (link?: string | null, phone?: string | null) => void
  canCreateList: boolean
  toggleProductSelection: (id: number) => void
}

export function ProductMobileList({
  products,
  lowestPrice,
  formatPrice,
  onWhatsAppClick,
  canCreateList,
  toggleProductSelection,
}: ProductMobileListProps) {
  const { selectedProductIds } = useProductStore()

  return (
    <div className="space-y-4 pb-20">
      {products.map((product) => {
        const isSelected = selectedProductIds.has(product.id)
        const isLowestPrice =
          product.valor !== null &&
          product.valor !== undefined &&
          product.valor === lowestPrice &&
          lowestPrice !== Infinity

        return (
          <div
            key={product.id}
            className={cn(
              'bg-white rounded-xl shadow-sm border p-4 transition-all relative overflow-hidden',
              isSelected && 'ring-2 ring-primary border-primary bg-blue-50/20',
              isLowestPrice &&
                'border-l-4 border-l-emerald-500 bg-emerald-50/10',
            )}
          >
            {isLowestPrice && (
              <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[10px] px-2 py-0.5 rounded-bl-lg font-bold">
                MELHOR PREÇO
              </div>
            )}

            <div className="flex gap-3">
              {canCreateList && (
                <div className="pt-1">
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => toggleProductSelection(product.id)}
                    className="h-5 w-5"
                  />
                </div>
              )}

              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start gap-2 mb-1">
                  <h3 className="font-bold text-gray-900 truncate pr-16">
                    {product.modelo}
                  </h3>
                </div>

                <div className="flex flex-wrap gap-2 my-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded-full">
                    <Cpu className="w-3 h-3" />
                    {product.ram || '-'}
                  </span>
                  <span className="flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded-full">
                    <Smartphone className="w-3 h-3" />
                    {product.memoria}
                  </span>
                  <span className="flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded-full">
                    <Battery className="w-3 h-3" />
                    {product.bateria || '-'}
                  </span>
                </div>

                {product.fornecedor && (
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-2">
                    <Truck className="w-3 h-3" />
                    <span className="truncate font-medium">
                      {product.fornecedor}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={cn(
                        'text-[10px] h-5',
                        product.estado === 'Novo'
                          ? 'bg-green-50 text-green-700 border-green-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200',
                      )}
                    >
                      {product.estado}
                    </Badge>
                    <span className="text-xs text-gray-500">{product.cor}</span>
                  </div>
                  <span
                    className={cn(
                      'font-bold text-lg',
                      isLowestPrice
                        ? 'text-emerald-600 scale-110 origin-right'
                        : 'text-gray-900',
                      product.valor === null &&
                        'text-sm font-normal text-muted-foreground',
                    )}
                  >
                    {formatPrice(product.valor)}
                  </span>
                </div>

                {(product.link_whatsapp || product.telefone) && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full mt-3 h-8 text-xs gap-1.5 text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200"
                    onClick={(e) => {
                      e.stopPropagation()
                      onWhatsAppClick(product.link_whatsapp, product.telefone)
                    }}
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    Contatar via WhatsApp
                  </Button>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
