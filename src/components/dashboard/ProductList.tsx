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

interface ProductListProps {
  products: Product[]
  isLoading?: boolean
}

export function ProductList({ products, isLoading = false }: ProductListProps) {
  const { selectedProductIds, toggleProductSelection } = useProductStore()
  const { currentUser } = useAuthStore()

  const canCreateList = currentUser?.canCreateList || false

  if (isLoading && products.length === 0) {
    return (
      <div className="rounded-md border bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50/50">
              {canCreateList && <TableHead className="w-[50px]"></TableHead>}
              <TableHead>Modelo</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Memória</TableHead>
              <TableHead>Cor</TableHead>
              <TableHead>Condição</TableHead>
              <TableHead>Bateria</TableHead>
              <TableHead>Fornecedor</TableHead>
              <TableHead>Estoque</TableHead>
              <TableHead className="text-right">Valor</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                {canCreateList && (
                  <TableCell>
                    <Skeleton className="h-4 w-4" />
                  </TableCell>
                )}
                <TableCell>
                  <Skeleton className="h-4 w-32" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-24" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-16" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-20" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-16" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-12" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-24" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-16" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-20 ml-auto" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
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

  return (
    <div className="rounded-md border bg-white shadow-sm overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50/50">
            {canCreateList && <TableHead className="w-[50px]"></TableHead>}
            <TableHead>Modelo</TableHead>
            <TableHead>Categoria</TableHead>
            <TableHead>Memória</TableHead>
            <TableHead>Cor</TableHead>
            <TableHead>Condição</TableHead>
            <TableHead>Bateria</TableHead>
            <TableHead>Fornecedor</TableHead>
            <TableHead>Estoque</TableHead>
            <TableHead className="text-right">Valor</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => {
            const isSelected = selectedProductIds.has(product.id)
            return (
              <TableRow
                key={product.id}
                className={cn(
                  'hover:bg-gray-50 transition-colors',
                  isSelected && 'bg-blue-50/40 hover:bg-blue-50/60',
                )}
              >
                {canCreateList && (
                  <TableCell>
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => toggleProductSelection(product.id)}
                      aria-label={`Select ${product.modelo}`}
                    />
                  </TableCell>
                )}
                <TableCell className="font-medium">{product.modelo}</TableCell>
                <TableCell>{product.categoria}</TableCell>
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
                <TableCell className="text-muted-foreground">
                  {product.fornecedor}
                </TableCell>
                <TableCell>
                  {product.em_estoque ? (
                    <span className="flex items-center text-xs text-green-600 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-2" />
                      Sim
                    </span>
                  ) : (
                    <span className="flex items-center text-xs text-red-500">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-400 mr-2" />
                      Não
                    </span>
                  )}
                </TableCell>
                <TableCell className="text-right font-bold text-slate-900">
                  {product.valor
                    ? `R$ ${product.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                    : '-'}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
