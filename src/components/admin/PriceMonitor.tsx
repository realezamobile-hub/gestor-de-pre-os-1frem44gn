import { useEffect } from 'react'
import { useProductStore } from '@/stores/useProductStore'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { TrendingDown, RefreshCw, MessageCircle } from 'lucide-react'

export function PriceMonitor() {
  const { monitorItems, fetchPriceMonitor, isLoading } = useProductStore()

  useEffect(() => {
    fetchPriceMonitor()
  }, [])

  const handleWhatsAppClick = (phone?: string | null) => {
    if (phone) {
      const cleanPhone = phone.replace(/\D/g, '')
      window.open(`https://wa.me/${cleanPhone}`, '_blank')
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
        <div className="space-y-1">
          <CardTitle className="flex items-center gap-2 text-emerald-700">
            <TrendingDown className="w-6 h-6" />
            Monitor de Melhores Preços
          </CardTitle>
          <CardDescription>
            Exibindo o menor preço encontrado para cada modelo.
          </CardDescription>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchPriceMonitor()}
          disabled={isLoading}
        >
          <RefreshCw
            className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`}
          />
          Atualizar
        </Button>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow className="bg-emerald-50/50">
                <TableHead>Modelo</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead className="text-right">Melhor Preço</TableHead>
                <TableHead>Fornecedor</TableHead>
                <TableHead>Contato</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {monitorItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    Nenhum dado disponível.
                  </TableCell>
                </TableRow>
              ) : (
                monitorItems.map((item) => (
                  <TableRow key={item.id} className="hover:bg-emerald-50/20">
                    <TableCell className="font-bold">{item.modelo}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-normal">
                        {item.categoria || 'Geral'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-bold text-emerald-700 text-lg">
                      {item.valor.toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      })}
                    </TableCell>
                    <TableCell>{item.fornecedor || '-'}</TableCell>
                    <TableCell className="flex items-center gap-2">
                      <span className="text-muted-foreground text-sm">
                        {item.telefone || '-'}
                      </span>
                      {item.telefone && (
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6 text-green-600 rounded-full"
                          onClick={() => handleWhatsAppClick(item.telefone)}
                        >
                          <MessageCircle className="w-3 h-3" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
