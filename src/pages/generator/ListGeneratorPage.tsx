import { useState, useEffect } from 'react'
import { useProductStore } from '@/stores/useProductStore'
import { useAuthStore } from '@/stores/useAuthStore'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Copy,
  Trash2,
  ArrowLeft,
  Settings2,
  Smartphone,
  Lock,
  CalendarIcon,
  Wand2,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default function ListGeneratorPage() {
  const {
    selectedProductIds,
    toggleProductSelection,
    clearSelection,
    getSelectedProducts,
    categories,
    fetchCategories,
    generateList,
    isLoading,
  } = useProductStore()

  const { currentUser } = useAuthStore()
  const selectedProducts = getSelectedProducts()

  const [headerConfig, setHeaderConfig] = useState({
    companyName: 'Minha Loja',
  })

  // Generator State
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  useEffect(() => {
    fetchCategories()
  }, [])

  // Permission check
  if (!currentUser?.canCreateList) {
    return (
      <div className="h-full flex flex-col items-center justify-center space-y-4">
        <Lock className="w-16 h-16 text-gray-300" />
        <h2 className="text-2xl font-bold text-gray-900">Acesso Negado</h2>
        <p className="text-muted-foreground text-center max-w-md">
          Você não tem permissão para gerar listas de preços.
        </p>
        <Button asChild>
          <Link to="/">Voltar ao Painel</Link>
        </Button>
      </div>
    )
  }

  const handleGenerate = async () => {
    await generateList(selectedDate || null, selectedCategory)
  }

  const generateListText = () => {
    if (selectedProducts.length === 0) {
      return '(Nenhum produto selecionado)'
    }

    // Group by Category
    const grouped = selectedProducts.reduce(
      (acc, product) => {
        const key = product.categoria || 'Outros'
        if (!acc[key]) acc[key] = []
        acc[key].push(product)
        return acc
      },
      {} as Record<string, typeof selectedProducts>,
    )

    let text = ''

    Object.entries(grouped).forEach(([category, products]) => {
      text += `🔥 *${headerConfig.companyName} - ${category}* 🔥\n`
      products.forEach((p) => {
        const priceStr = p.valor
          ? `R$ ${p.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
          : 'Consulte'

        // Format: • [Modelo] [Memoria] [Cor] - R$ [Valor]
        // Adding other details if relevant and brief
        text += ` • ${p.modelo} ${p.ram ? p.ram + ' ' : ''}${p.memoria || ''} ${p.cor || ''}`
        if (p.estado && p.estado !== 'Novo') text += ` (${p.estado})`
        text += ` - *${priceStr}*\n`
      })
      text += '\n'
    })

    text += `⚠️ _Preços sujeitos a alteração sem aviso prévio._\n`
    text += `📦 _Consulte disponibilidade._`
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
        <div className="lg:col-span-5 flex flex-col gap-6 h-full overflow-hidden">
          {/* Generator Controls */}
          <Card className="bg-blue-50/50 border-blue-100">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2 text-blue-900">
                <Wand2 className="w-4 h-4 text-blue-600" />
                Gerador Automático
              </CardTitle>
              <CardDescription className="text-xs">
                Filtre e gere uma lista baseada em critérios.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs">Data de Entrada</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={'outline'}
                        className={cn(
                          'w-full justify-start text-left font-normal h-9 px-3 text-xs',
                          !selectedDate && 'text-muted-foreground',
                        )}
                      >
                        <CalendarIcon className="mr-2 h-3.5 w-3.5" />
                        {selectedDate ? (
                          format(selectedDate, 'P', { locale: ptBR })
                        ) : (
                          <span>Selecione</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Categoria</Label>
                  <Select
                    value={selectedCategory}
                    onValueChange={setSelectedCategory}
                  >
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue placeholder="Todas" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      {categories.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button
                onClick={handleGenerate}
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 h-8 text-xs"
              >
                {isLoading ? 'Gerando...' : 'Gerar Lista'}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Settings2 className="w-4 h-4 text-primary" />
                Configuração do Cabeçalho
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="companyName" className="text-xs">
                  Nome da Empresa
                </Label>
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
                  className="h-9 text-sm"
                />
              </div>
            </CardContent>
          </Card>

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
              <ScrollArea className="h-full">
                <div className="divide-y">
                  {selectedProducts.map((product) => (
                    <div
                      key={product.id}
                      className="p-3 flex items-center gap-3 hover:bg-gray-50 transition-colors group"
                    >
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex justify-between items-start">
                          <p className="font-medium text-sm truncate pr-2">
                            {product.modelo}
                          </p>
                          <span className="text-emerald-600 font-bold text-sm whitespace-nowrap">
                            {product.valor
                              ? `R$ ${product.valor.toLocaleString('pt-BR')}`
                              : '-'}
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                          <span className="bg-gray-100 px-1.5 rounded">
                            {product.ram || '-'} RAM
                          </span>
                          <span>{product.memoria}</span>
                          <span>{product.cor}</span>
                          {product.fornecedor && (
                            <span className="text-blue-600 font-medium">
                              Fornecedor: {product.fornecedor}
                            </span>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-destructive h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => toggleProductSelection(product.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

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
              <textarea
                readOnly
                value={
                  selectedProducts.length > 0
                    ? listText
                    : 'Adicione produtos para gerar o preview...'
                }
                className={cn(
                  'w-full h-full bg-transparent text-slate-300 font-mono text-sm p-6 resize-none focus:outline-none leading-relaxed',
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
