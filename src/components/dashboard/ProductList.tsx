import { Product } from '@/types'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { useProductStore } from '@/stores/useProductStore'
import { useAuthStore } from '@/stores/useAuthStore'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'
import { useIsMobile } from '@/hooks/use-mobile'
import { MessageCircle, Battery, Cpu, Smartphone, Truck } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ProductListProps {
  products: Product[]
  isLoading?: boolean
}

export function ProductList({ products, isLoading = false }: ProductListProps) {
  const { selectedProductIds, toggleProductSelection } = useProductStore()
  const { currentUser } = useAuthStore()
  const isMobile = useIsMobile()

  const canCreateList = currentUser?.canCreateList || false

  // Calculate lowest price in current view
  const lowestPrice = products.reduce((min, p) => {
    if (!p.valor) return min
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

  if (isLoading && products.length === 0) {
    return (
      <div className="rounded-md border bg-white shadow-sm overflow-hidden p-4 space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
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
      <div className="space-y-4 pb-20">
        {products.map((product) => {
          const isSelected = selectedProductIds.has(product.id)
          const isLowestPrice =
            product.valor === lowestPrice && lowestPrice !== Infinity

          return (
            <div
              key={product.id}
              className={cn(
                'bg-white rounded-xl shadow-sm border p-4 transition-all relative overflow-hidden',
                isSelected &&
                  'ring-2 ring-primary border-primary bg-blue-50/20',
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
                      <span className="truncate">{product.fornecedor}</span>
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
                      <span className="text-xs text-gray-500">
                        {product.cor}
                      </span>
                    </div>
                    <span
                      className={cn(
                        'font-bold text-lg',
                        isLowestPrice
                          ? 'text-emerald-600 scale-110 origin-right'
                          : 'text-gray-900',
                      )}
                    >
                      {product.valor
                        ? `R$ ${product.valor.toLocaleString('pt-BR')}`
                        : '-'}
                    </span>
                  </div>

                  {(product.link_whatsapp || product.telefone) && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full mt-3 h-8 text-xs gap-1.5 text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleWhatsAppClick(
                          product.link_whatsapp,
                          product.telefone,
                        )
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

  return (
    <div className="rounded-md border bg-white shadow-sm overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50/50">
            {canCreateList && <TableHead className="w-[40px] px-2"></TableHead>}
            <TableHead>Modelo</TableHead>
            <TableHead>RAM</TableHead>
            <TableHead>Memória</TableHead>
            <TableHead>Cor</TableHead>
            <TableHead>Condição</TableHead>
            <TableHead>Bateria</TableHead>
            <TableHead>Fornecedor</TableHead>
            <TableHead className="w-[50px] text-center">Zap</TableHead>
            <TableHead className="text-right">Valor</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => {
            const isSelected = selectedProductIds.has(product.id)
            const isLowestPrice =
              product.valor === lowestPrice && lowestPrice !== Infinity

            return (
              <TableRow
                key={product.id}
                className={cn(
                  'hover:bg-gray-50 transition-colors',
                  isSelected && 'bg-blue-50/40 hover:bg-blue-50/60',
                  isLowestPrice &&
                    'bg-emerald-50/30 hover:bg-emerald-50/50 border-l-4 border-l-emerald-500',
                )}
              >
                {canCreateList && (
                  <TableCell className="px-2">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => toggleProductSelection(product.id)}
                      aria-label={`Select ${product.modelo}`}
                    />
                  </TableCell>
                )}
                <TableCell className="font-medium">
                  <div className="flex flex-col">
                    <span>{product.modelo}</span>
                    {isLowestPrice && (
                      <span className="text-[10px] text-emerald-600 font-bold">
                        ★ Melhor Preço
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell>{product.ram || '-'}</TableCell>
                <TableCell>{product.memoria}</TableCell>
                <TableCell>{product.cor}</TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={cn(
                      'text-xs font-normal',
                      product.estado === 'Novo'
                        ? 'bg-green-50 text-green-700 border-green-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200',
                    )}
                  >
                    {product.estado}
                  </Badge>
                </TableCell>
                <TableCell>{product.bateria || '-'}</TableCell>
                <TableCell className="text-gray-600">
                  {product.fornecedor || '-'}
                </TableCell>
                <TableCell className="text-center">
                  {product.link_whatsapp || product.telefone ? (
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-full"
                      onClick={() =>
                        handleWhatsAppClick(
                          product.link_whatsapp,
                          product.telefone,
                        )
                      }
                      title="Abrir WhatsApp"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </Button>
                  ) : (
                    <span className="text-gray-300">-</span>
                  )}
                </TableCell>
                <TableCell className="text-right font-bold text-slate-900">
                  <div
                    className={cn(
                      isLowestPrice &&
                        'text-emerald-700 scale-110 origin-right transition-transform',
                    )}
                  >
                    {product.valor
                      ? `R$ ${product.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                      : '-'}
                  </div>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
