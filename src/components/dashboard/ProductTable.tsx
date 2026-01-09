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
                <TableCell className="text-gray-600 font-medium">
                  {product.fornecedor || '-'}
                </TableCell>
                <TableCell className="text-center">
                  {product.link_whatsapp || product.telefone ? (
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-full"
                      onClick={() =>
                        onWhatsAppClick(product.link_whatsapp, product.telefone)
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
                      product.valor === null &&
                        'text-sm font-normal text-muted-foreground',
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
