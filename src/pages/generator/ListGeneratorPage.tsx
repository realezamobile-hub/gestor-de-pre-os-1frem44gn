import { useState, useEffect } from 'react'
import { useProductStore } from '@/stores/useProductStore'
import { useAuthStore } from '@/stores/useAuthStore'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Trash2,
  ArrowLeft,
  Smartphone,
  Lock,
  Save,
  Copy,
  Loader2,
  RefreshCw,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { DraftItem, GeneratorConfigData } from '@/types'
import { GeneratorConfig } from '@/components/generator/GeneratorConfig'
import { DraftListGrouped } from '@/components/generator/DraftListGrouped'

export default function ListGeneratorPage() {
  const {
    draftItems,
    fetchDraftItems,
    removeFromDraft,
    updateDraftItem,
    clearDraft,
    fetchCategories,
    saveGeneratedList,
  } = useProductStore()

  const { currentUser } = useAuthStore()

  // Config State
  const [config, setConfig] = useState<GeneratorConfigData>({
    header: `🔥 *OFERTAS DO DIA - ${new Date().toLocaleDateString('pt-BR')}* 🔥\n\n`,
    footer:
      '⚠️ _Preços sujeitos a alteração sem aviso prévio._\n📦 _Consulte disponibilidade._',
    communityLink: '',
    contactNumber: '',
    markup: 0,
  })

  // Load persistence for contact/community
  useEffect(() => {
    const savedContact = localStorage.getItem('generator_contactNumber')
    const savedCommunity = localStorage.getItem('generator_communityLink')
    if (savedContact || savedCommunity) {
      setConfig((prev) => ({
        ...prev,
        contactNumber: savedContact || prev.contactNumber,
        communityLink: savedCommunity || prev.communityLink,
      }))
    }
  }, [])

  // Save persistence
  useEffect(() => {
    localStorage.setItem('generator_contactNumber', config.contactNumber)
    localStorage.setItem('generator_communityLink', config.communityLink)
  }, [config.contactNumber, config.communityLink])

  // Generator State
  const [generatedText, setGeneratedText] = useState('')
  const [isInternal, setIsInternal] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    fetchCategories()
    fetchDraftItems()
  }, [])

  // Reset/Clear text if draft is empty
  useEffect(() => {
    if (draftItems.length === 0) {
      setGeneratedText('')
    }
  }, [draftItems.length])

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

  const handleGenerate = () => {
    if (draftItems.length === 0) {
      setGeneratedText('')
      return
    }

    // Group by Group Name
    const grouped = draftItems.reduce(
      (acc, item) => {
        const key = item.group_name || item.product?.categoria || 'Outros'
        if (!acc[key]) acc[key] = []
        acc[key].push(item)
        return acc
      },
      {} as Record<string, DraftItem[]>,
    )
    // Sort keys
    const sortedKeys = Object.keys(grouped).sort()

    let text = ''

    // 1. Header
    if (isInternal) {
      text += `🔐 *LISTA INTERNA - CUSTOS E FORNECEDORES* 🔐\n`
      text += `📅 Data: ${new Date().toLocaleDateString('pt-BR')} \n\n`
    } else {
      text += config.header
      if (!config.header.endsWith('\n\n')) text += '\n\n'
    }

    // 2. Groups and Items
    sortedKeys.forEach((groupName) => {
      text += `*${groupName}*\n`
      const items = grouped[groupName]

      items.forEach((item) => {
        const product = item.product
        if (!product) return

        // 1. Details: Custom Model or fallback
        let model = item.custom_model || product.modelo || ''
        // If empty custom_model (legacy), construct it
        if (!item.custom_model) {
          model = [
            product.modelo,
            product.memoria,
            product.ram ? `${product.ram} RAM` : null,
            product.cor,
          ]
            .filter(Boolean)
            .join(' ')
        }

        // Append details if present
        if (item.custom_details) {
          model += ` (${item.custom_details})`
        }

        // 2. Price
        const basePrice = item.custom_price ?? product.valor

        let finalPrice = basePrice
        if (finalPrice !== null && finalPrice !== undefined && !isInternal) {
          finalPrice += config.markup
        }

        const priceStr = finalPrice
          ? `R$ ${finalPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
          : 'Consulte'

        // 3. Format Line: [Details] - [Price]
        // Example: - iPhone 11 64GB - R$ 2.000,00
        text += ` - ${model} - ${isInternal ? '' : '*'}${priceStr}${isInternal ? '' : '*'}`

        // Internal Extras
        if (isInternal) {
          text += `\n   ↳ Forn: ${product.fornecedor || 'N/A'}`
          if (product.telefone) text += ` | Tel: ${product.telefone}`
        }

        text += `\n`
      })
      text += '\n'
    })

    // 3. Footer and Links (Public only)
    if (!isInternal) {
      if (config.communityLink) {
        text += `\n${config.communityLink}\n`
      }

      if (config.contactNumber) {
        // Simple numeric clean up
        const cleanNumber = config.contactNumber.replace(/\D/g, '')
        text += `\nMe chame pelo WhatsApp: https://wa.me/${cleanNumber}\n`
      }

      text += '\n'
      text += config.footer
      if (!config.footer.endsWith('\n')) text += '\n'
    }

    setGeneratedText(text)
  }

  const handleCopy = () => {
    if (!generatedText) return
    navigator.clipboard.writeText(generatedText)
    toast.success('Lista copiada para a área de transferência!')
  }

  const handleSaveList = async () => {
    if (!generatedText || draftItems.length === 0) return

    setIsSaving(true)
    const title = isInternal ? 'Lista Interna' : 'Lista Clientes'
    const type = isInternal ? 'supplier' : 'posting'

    const result = await saveGeneratedList(title, generatedText, type, config)

    setIsSaving(false)
    if (result.success) {
      toast.success('Lista salva no histórico!')
    } else {
      toast.error('Erro ao salvar lista')
    }
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
              Edite seus itens, organize e gere a prévia antes de exportar.
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={clearDraft}
            disabled={draftItems.length === 0}
            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Limpar Lista
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 flex-1 min-h-0">
        {/* Left Column: Configuration */}
        <div className="xl:col-span-3 flex flex-col gap-6 h-full overflow-y-auto pr-2">
          <GeneratorConfig config={config} onChange={setConfig} />
        </div>

        {/* Middle Column: Draft Items (Expanded) */}
        <div className="xl:col-span-5 flex flex-col h-full min-h-0">
          <Card className="flex-1 flex flex-col min-h-0 border-2 shadow-sm">
            <CardHeader className="bg-gray-50 border-b py-3">
              <CardTitle className="text-sm font-medium flex items-center justify-between">
                <span>Itens da Lista (Rascunho)</span>
                <span className="text-xs bg-white px-2 py-1 rounded border">
                  {draftItems.length} itens
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 flex-1 overflow-hidden bg-gray-50/30">
              <DraftListGrouped
                items={draftItems}
                onRemove={removeFromDraft}
                onUpdate={updateDraftItem}
              />
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Preview & Output */}
        <div className="xl:col-span-4 h-full">
          <Tabs
            value={isInternal ? 'internal' : 'customer'}
            onValueChange={(v) => {
              setIsInternal(v === 'internal')
              setGeneratedText('') // Clear preview on tab switch to force regenerate
            }}
            className="h-full flex flex-col"
          >
            <TabsList className="w-full justify-start mb-2">
              <TabsTrigger value="customer" className="flex-1">
                <Smartphone className="w-4 h-4 mr-2" />
                Lista Cliente
              </TabsTrigger>
              <TabsTrigger value="internal" className="flex-1">
                <Lock className="w-4 h-4 mr-2" />
                Lista Interna
              </TabsTrigger>
            </TabsList>

            <div className="flex-1 relative flex flex-col">
              <Card
                className={cn(
                  'flex flex-col h-full overflow-hidden shadow-xl transition-all',
                  isInternal
                    ? 'bg-white border-slate-200'
                    : 'bg-slate-950 border-slate-800',
                )}
              >
                <CardHeader
                  className={cn(
                    'py-3 px-4 flex flex-row items-center justify-between space-y-0 border-b',
                    isInternal
                      ? 'bg-slate-50 border-slate-200'
                      : 'bg-slate-900 border-slate-800',
                  )}
                >
                  <div className="flex items-center gap-2">
                    {!isInternal && (
                      <div className="flex gap-1.5">
                        <span className="w-3 h-3 rounded-full bg-red-500" />
                        <span className="w-3 h-3 rounded-full bg-yellow-500" />
                        <span className="w-3 h-3 rounded-full bg-green-500" />
                      </div>
                    )}
                    {isInternal && <Lock className="w-4 h-4 text-slate-500" />}
                    <span
                      className={cn(
                        'text-xs font-mono',
                        isInternal ? 'text-slate-600' : 'text-slate-400 ml-3',
                      )}
                    >
                      {isInternal
                        ? 'internal_preview.txt'
                        : 'whatsapp_preview.txt'}
                    </span>
                  </div>
                  <Button
                    onClick={handleGenerate}
                    size="sm"
                    variant={isInternal ? 'outline' : 'secondary'}
                    className="h-7 text-xs"
                  >
                    <RefreshCw className="w-3 h-3 mr-1.5" />
                    Gerar Prévia
                  </Button>
                </CardHeader>
                <CardContent className="p-0 flex-1 overflow-hidden relative group">
                  <textarea
                    value={generatedText}
                    readOnly
                    className={cn(
                      'w-full h-full bg-transparent font-mono text-xs p-4 resize-none focus:outline-none leading-relaxed',
                      isInternal ? 'text-slate-800' : 'text-slate-300',
                      !generatedText && 'opacity-50 italic text-center pt-20',
                    )}
                    placeholder={
                      draftItems.length > 0
                        ? "Clique em 'Gerar Prévia' para visualizar o resultado..."
                        : 'Adicione produtos para gerar o texto...'
                    }
                  />

                  {generatedText && (
                    <div className="absolute bottom-6 right-6 flex flex-col gap-2">
                      <Button
                        onClick={handleSaveList}
                        disabled={isSaving}
                        size="sm"
                        className={cn(
                          'shadow-lg',
                          isInternal
                            ? 'bg-slate-800 text-white hover:bg-slate-900'
                            : 'bg-blue-600 hover:bg-blue-700 text-white',
                        )}
                      >
                        {isSaving ? (
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        ) : (
                          <Save className="w-4 h-4 mr-2" />
                        )}
                        Salvar no Histórico
                      </Button>
                      <Button
                        onClick={handleCopy}
                        size="sm"
                        variant="outline"
                        className={cn(
                          'shadow-lg',
                          isInternal
                            ? 'bg-white'
                            : 'bg-white text-slate-900 hover:bg-slate-100 border-none',
                        )}
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Copiar
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
