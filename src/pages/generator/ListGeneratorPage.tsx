import { useState } from 'react'
import { useProductStore } from '@/stores/useProductStore'
import { useAuthStore } from '@/stores/useAuthStore'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Copy,
  Trash2,
  ArrowLeft,
  RefreshCw,
  Settings2,
  Smartphone,
  Lock,
} from 'lucide-react'
import { Link, Navigate } from 'react-router-dom'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export default function ListGeneratorPage() {
  const {
    selectedProducts,
    toggleProductSelection,
    getBestPrice,
    clearSelection,
  } = useProductStore()

  const { currentUser } = useAuthStore()

  const [headerConfig, setHeaderConfig] = useState({
    companyName: 'Minha Loja',
    listTitle: 'Smartphones e Eletrônicos',
  })

  // Permission check
  if (!currentUser?.canCreateList && currentUser?.role !== 'admin') {
    return (
      <div className="h-full flex flex-col items-center justify-center space-y-4">
        <Lock className="w-16 h-16 text-gray-300" />
        <h2 className="text-2xl font-bold text-gray-900">Acesso Negado</h2>
        <p className="text-muted-foreground text-center max-w-md">
          Você não tem permissão para gerar listas de preços. Entre em contato
          com o administrador para solicitar acesso.
        </p>
        <Button asChild>
          <Link to="/">Voltar ao Painel</Link>
        </Button>
      </div>
    )
  }

  const generateListText = () => {
    const today = new Date().toLocaleDateString('pt-BR')
    let text = `🔥 *${headerConfig.companyName.toUpperCase()}* 🔥\n`
    text += `📢 *${headerConfig.listTitle} - ${today}*\n\n`

    if (selectedProducts.length === 0) {
      return text + '(Nenhum produto selecionado)'
    }

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

        // Product Line: Model + Specs
        const specs = [p.memory, p.color].filter(Boolean).join(' • ')
        const nameDisplay = `${p.model} ${specs ? `(${specs})` : ''}`

        text += `📱 ${nameDisplay}\n`
        text += `💰 ${priceStr} ${p.condition !== 'Novo' ? `(${p.condition})` : ''}\n\n`
      })
    })

    text += `⚠️ _Preços sujeitos a alteração sem aviso prévio._\n`
    text += `📦 _Consulte disponibilidade e cores._`
    return text
  }

  const listText = generateListText()

  const handleCopy = () => {
    if (selectedProducts.length === 0) {
      toast.error('Selecione produtos antes de copiar a lista')
      return
    }
    navigator.clipboard.writeText(listText)
    toast.success('Lista copiada para a área de transferência!')
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Gerador de Lista WhatsApp
            </h1>
            <p className="text-muted-foreground">
              Personalize e exporte sua lista de ofertas.
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={clearSelection}
            disabled={selectedProducts.length === 0}
            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Limpar
          </Button>
          <Button
            onClick={handleCopy}
            disabled={selectedProducts.length === 0}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            <Copy className="w-4 h-4 mr-2" />
            Copiar para WhatsApp
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">
        {/* Left Column - Config & Selection */}
        <div className="lg:col-span-5 flex flex-col gap-6 h-full overflow-hidden">
          {/* Config Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Settings2 className="w-4 h-4 text-primary" />
                Configuração do Cabeçalho
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="companyName">Nome da Empresa</Label>
                <Input
                  id="companyName"
                  value={headerConfig.companyName}
                  onChange={(e) =>
                    setHeaderConfig({
                      ...headerConfig,
                      companyName: e.target.value,
                    })
                  }
                  placeholder="Ex: Minha Loja"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="listTitle">Título da Lista (Grupo)</Label>
                <Input
                  id="listTitle"
                  value={headerConfig.listTitle}
                  onChange={(e) =>
                    setHeaderConfig({
                      ...headerConfig,
                      listTitle: e.target.value,
                    })
                  }
                  placeholder="Ex: Ofertas Especiais"
                />
              </div>
            </CardContent>
          </Card>

          {/* Selected Products List */}
          <Card className="flex-1 flex flex-col min-h-0 border-2">
            <CardHeader className="bg-gray-50 border-b py-3">
              <CardTitle className="text-sm font-medium flex items-center justify-between">
                <span>Produtos Selecionados</span>
                <span className="text-xs bg-white px-2 py-1 rounded border">
                  {selectedProducts.length} itens
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex-1 overflow-hidden">
              {selectedProducts.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-8 text-center">
                  <RefreshCw className="w-10 h-10 mb-4 opacity-20" />
                  <p className="text-sm">Sua lista está vazia.</p>
                  <Button variant="link" size="sm" asChild className="mt-2">
                    <Link to="/">Adicionar produtos</Link>
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
                          className="p-3 flex items-center gap-3 hover:bg-gray-50 transition-colors group"
                        >
                          <img
                            src={product.imageUrl}
                            alt=""
                            className="w-10 h-10 rounded bg-white object-cover border"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">
                              {product.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {product.model} •{' '}
                              <span className="text-emerald-600 font-semibold">
                                {best
                                  ? `R$ ${best.price.toLocaleString('pt-BR')}`
                                  : '-'}
                              </span>
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-muted-foreground hover:text-destructive h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
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
        </div>

        {/* Right Column - Preview */}
        <div className="lg:col-span-7 h-full">
          <Card className="flex flex-col h-full overflow-hidden bg-slate-950 border-slate-800 shadow-2xl">
            <CardHeader className="bg-slate-900 border-b border-slate-800 py-3 px-4 flex flex-row items-center justify-between space-y-0">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-red-500" />
                  <span className="w-3 h-3 rounded-full bg-yellow-500" />
                  <span className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                <span className="ml-3 text-xs font-mono text-slate-400">
                  whatsapp-preview.txt
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-slate-500" />
                <span className="text-xs text-slate-500">Preview</span>
              </div>
            </CardHeader>
            <CardContent className="p-0 flex-1 overflow-hidden relative group">
              <div className="absolute top-0 bottom-0 left-0 w-12 bg-slate-900/50 border-r border-slate-800/50 flex flex-col items-end py-6 px-2 gap-1 text-slate-700 font-mono text-xs select-none">
                {Array.from({ length: 20 }).map((_, i) => (
                  <div key={i}>{i + 1}</div>
                ))}
              </div>
              <textarea
                readOnly
                value={
                  selectedProducts.length > 0
                    ? listText
                    : 'Adicione produtos para gerar o preview...'
                }
                className={cn(
                  'w-full h-full bg-transparent text-slate-300 font-mono text-sm p-6 pl-16 resize-none focus:outline-none leading-relaxed',
                  selectedProducts.length === 0 && 'opacity-30 italic',
                )}
              />
              {selectedProducts.length > 0 && (
                <div className="absolute bottom-6 right-6 flex gap-2">
                  <Button
                    onClick={handleCopy}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg hover:shadow-emerald-900/20 transition-all hover:-translate-y-1"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copiar Texto
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
