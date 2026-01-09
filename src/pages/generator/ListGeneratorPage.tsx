import { useProductStore } from '@/stores/useProductStore'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Copy, Trash2, ArrowLeft, RefreshCw } from 'lucide-react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export default function ListGeneratorPage() {
  const {
    selectedProducts,
    toggleProductSelection,
    getBestPrice,
    clearSelection,
  } = useProductStore()

  const generateListText = () => {
    const today = new Date().toLocaleDateString('pt-BR')
    let text = `🔥 *TABELA DE OFERTAS - ${today}* 🔥\n\n`

    // Group by Brand
    const grouped = selectedProducts.reduce(
      (acc, product) => {
        if (!acc[product.brand]) acc[product.brand] = []
        acc[product.brand].push(product)
        return acc
      },
      {} as Record<string, typeof selectedProducts>,
    )

    Object.entries(grouped).forEach(([brand, products]) => {
      text += `*--- ${brand.toUpperCase()} ---*\n`
      products.forEach((p) => {
        const best = getBestPrice(p)
        const priceStr = best
          ? `R$ ${best.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
          : 'Consulte'
        text += `📱 ${p.name}\n💰 ${priceStr}\n\n`
      })
    })

    text += `⚠️ _Preços sujeitos a alteração sem aviso prévio._\n`
    text += `📦 _Consulte disponibilidade._`
    return text
  }

  const listText = generateListText()

  const handleCopy = () => {
    if (selectedProducts.length === 0) return
    navigator.clipboard.writeText(listText)
    toast.success('Lista copiada para a área de transferência!')
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/">
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Gerador de Lista
            </h1>
            <p className="text-muted-foreground">
              Crie e exporte sua lista de preços personalizada.
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={clearSelection}
            disabled={selectedProducts.length === 0}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Limpar
          </Button>
          <Button onClick={handleCopy} disabled={selectedProducts.length === 0}>
            <Copy className="w-4 h-4 mr-2" />
            Copiar Lista
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1 min-h-0">
        {/* Selected Items Panel */}
        <Card className="flex flex-col h-full overflow-hidden border-2">
          <CardHeader className="bg-gray-50 border-b py-4">
            <CardTitle className="text-lg flex items-center justify-between">
              <span>Produtos Selecionados</span>
              <span className="text-sm font-normal text-muted-foreground bg-white px-2 py-1 rounded border">
                {selectedProducts.length} itens
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex-1 overflow-hidden">
            {selectedProducts.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-8 text-center">
                <RefreshCw className="w-12 h-12 mb-4 opacity-20" />
                <p>Sua lista está vazia.</p>
                <Button variant="link" asChild>
                  <Link to="/">Voltar ao painel para adicionar produtos</Link>
                </Button>
              </div>
            ) : (
              <ScrollArea className="h-full">
                <div className="divide-y">
                  {selectedProducts.map((product) => {
                    const best = getBestPrice(product)
                    return (
                      <div
                        key={product.id}
                        className="p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors"
                      >
                        <img
                          src={product.imageUrl}
                          alt=""
                          className="w-12 h-12 rounded bg-white object-cover border"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">
                            {product.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Melhor oferta:{' '}
                            <span className="text-emerald-600 font-bold">
                              {best
                                ? `R$ ${best.price.toLocaleString('pt-BR')}`
                                : '-'}
                            </span>
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-muted-foreground hover:text-destructive"
                          onClick={() => toggleProductSelection(product)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    )
                  })}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>

        {/* Preview Panel */}
        <Card className="flex flex-col h-full overflow-hidden bg-zinc-900 border-zinc-800 shadow-xl">
          <CardHeader className="bg-zinc-950 border-b border-zinc-800 py-4">
            <CardTitle className="text-lg text-zinc-100 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500" />
              <span className="w-3 h-3 rounded-full bg-yellow-500" />
              <span className="w-3 h-3 rounded-full bg-green-500" />
              <span className="ml-2 text-sm font-mono opacity-50">
                preview.txt
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex-1 overflow-hidden relative">
            <textarea
              readOnly
              value={
                selectedProducts.length > 0
                  ? listText
                  : 'Selecione produtos para gerar a lista...'
              }
              className={cn(
                'w-full h-full bg-zinc-900 text-zinc-300 font-mono text-sm p-6 resize-none focus:outline-none',
                selectedProducts.length === 0 && 'opacity-50 italic',
              )}
            />
            {selectedProducts.length > 0 && (
              <Button
                onClick={handleCopy}
                className="absolute bottom-6 right-6 bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg hover:shadow-emerald-900/20"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copiar
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
