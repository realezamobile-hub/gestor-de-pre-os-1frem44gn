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
import { Button } from '@/components/ui/button'
import { MessageCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useProductStore } from '@/stores/useProductStore'

interface ProductTableProps {
  products: Product[]
  lowestPrice: number
  formatPrice: (value: number | null | undefined) => string
  onWhatsAppClick: (link?: string | null, phone?: string | null) => void
  canCreateList: boolean
  toggleProductSelection: (id: number) => void
}

export function ProductTable({
  products,
  lowestPrice,
  formatPrice,
  onWhatsAppClick,
  canCreateList,
  toggleProductSelection,
}: ProductTableProps) {
  const { selectedProductIds } = useProductStore()

  return (
    <div className="rounded-md border bg-white shadow-sm overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50/50 hover:bg-gray-50/50">
            {canCreateList && <TableHead className="w-[40px] px-2"></TableHead>}
            <TableHead className="h-10 py-2">Modelo</TableHead>
            <TableHead className="h-10 py-2">Categoria</TableHead>
            <TableHead className="h-10 py-2">RAM</TableHead>
            <TableHead className="h-10 py-2">Memória</TableHead>
            <TableHead className="h-10 py-2">Cor</TableHead>
            <TableHead className="h-10 py-2">Condição</TableHead>
            <TableHead className="h-10 py-2">Bateria</TableHead>
            <TableHead className="h-10 py-2">Fornecedor</TableHead>
            <TableHead className="h-10 py-2">Telefone</TableHead>
            <TableHead className="h-10 py-2 w-[50px] text-center">
              Zap
            </TableHead>
            <TableHead className="h-10 py-2 text-right">Valor</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => {
            const isSelected = selectedProductIds.has(product.id)
            const isLowestPrice =
              product.valor !== null &&
              product.valor !== undefined &&
              product.valor === lowestPrice &&
              lowestPrice !== Infinity

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
                  <TableCell className="px-2 py-2">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => toggleProductSelection(product.id)}
                      aria-label={`Select ${product.modelo}`}
                    />
                  </TableCell>
                )}
                <TableCell className="font-medium py-2">
                  <div className="flex flex-col">
                    <span className="text-sm">{product.modelo}</span>
                    {isLowestPrice && (
                      <span className="text-[9px] text-emerald-600 font-bold leading-none mt-0.5">
                        ★ Melhor Preço
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="py-2 text-xs">
                  {product.categoria || '-'}
                </TableCell>
                <TableCell className="py-2 text-xs">
                  {product.ram || '-'}
                </TableCell>
                <TableCell className="py-2 text-xs">
                  {product.memoria}
                </TableCell>
                <TableCell className="py-2 text-xs">{product.cor}</TableCell>
                <TableCell className="py-2">
                  <Badge
                    variant="outline"
                    className={cn(
                      'text-[10px] px-1.5 py-0 font-normal h-5',
                      product.estado === 'Novo'
                        ? 'bg-green-50 text-green-700 border-green-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200',
                    )}
                  >
                    {product.estado}
                  </Badge>
                </TableCell>
                <TableCell className="py-2 text-xs">
                  {product.bateria || '-'}
                </TableCell>
                <TableCell className="text-gray-600 font-medium py-2 text-xs">
                  {product.fornecedor || '-'}
                </TableCell>
                <TableCell className="text-gray-600 text-xs whitespace-nowrap py-2">
                  {product.telefone || '-'}
                </TableCell>
                <TableCell className="text-center py-2">
                  {product.link_whatsapp || product.telefone ? (
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-full"
                      onClick={() =>
                        onWhatsAppClick(product.link_whatsapp, product.telefone)
                      }
                      title="Abrir WhatsApp"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                    </Button>
                  ) : (
                    <span className="text-gray-300">-</span>
                  )}
                </TableCell>
                <TableCell className="text-right font-bold text-slate-900 py-2 text-sm">
                  <div
                    className={cn(
                      isLowestPrice &&
                        'text-emerald-700 scale-105 origin-right transition-transform',
                      product.valor === null &&
                        'text-xs font-normal text-muted-foreground',
                    )}
                  >
                    {formatPrice(product.valor)}
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
