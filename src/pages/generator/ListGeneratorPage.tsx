import { useState, useEffect } from 'react'
import { useProductStore } from '@/stores/useProductStore'
import { useAuthStore } from '@/stores/useAuthStore'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Trash2, ArrowLeft, Smartphone, Lock, Save, Copy } from 'lucide-react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { DraftItem } from '@/types'
import {
  GeneratorConfig,
  GeneratorConfigData,
} from '@/components/generator/GeneratorConfig'
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

  // Regenerate text when dependencies change
  useEffect(() => {
    if (draftItems.length > 0) {
      setGeneratedText(generateListText(isInternal))
    } else {
      setGeneratedText('')
    }
  }, [draftItems, config, isInternal])

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

  const generateListText = (internal: boolean = false) => {
    if (draftItems.length === 0) return ''

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

    if (internal) {
      text += `🔐 *LISTA INTERNA - CUSTOS E FORNECEDORES* 🔐\n`
      text += `📅 Data: ${new Date().toLocaleDateString('pt-BR')} \n\n`
    } else {
      text += config.header
      if (!config.header.endsWith('\n\n')) text += '\n\n'
    }

    sortedKeys.forEach((groupName) => {
      text += `*${groupName}*\n`
      const items = grouped[groupName]

      items.forEach((item) => {
        const product = item.product
        if (!product) return

        const model = item.custom_model || product.modelo
        const defaultDetails = [
          product.ram && `${product.ram} RAM`,
          product.memoria,
          product.cor,
        ]
          .filter(Boolean)
          .join(' ')

        const details = item.custom_details || defaultDetails
        const basePrice = item.custom_price ?? product.valor

        let finalPrice = basePrice
        if (finalPrice !== null && finalPrice !== undefined && !internal) {
          finalPrice += config.markup
        }

        const priceStr = finalPrice
          ? `R$ ${finalPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
          : 'Consulte'

        // Format: • [Modelo] [Details] - R$ [Valor]
        text += ` • ${model} ${details}`
        if (product.estado && product.estado !== 'Novo')
          text += ` (${product.estado})`

        if (internal) {
          text += `\n   ↳ Custo: ${priceStr} | Forn: ${product.fornecedor || 'N/A'}`
          if (product.telefone) text += ` | Tel: ${product.telefone}`
        } else {
          text += ` - *${priceStr}*`
        }
        text += `\n`
      })
      text += '\n'
    })

    if (!internal) {
      text += config.footer
      if (!config.footer.endsWith('\n')) text += '\n'

      if (config.communityLink) {
        text += `\n👥 *Entre na nossa comunidade:*\n${config.communityLink}\n`
      }

      if (config.contactNumber) {
        text += `\n📲 *Me chame no WhatsApp:*\nhttps://wa.me/${config.contactNumber}\n`
      }
    }

    return text
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
              Edite seus itens, organize e exporte suas listas de ofertas.
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
            onValueChange={(v) => setIsInternal(v === 'internal')}
            className="h-full flex flex-col"
          >
            <TabsList className="w-full justify-start mb-2">
              <TabsTrigger value="customer" className="flex-1">
                <Smartphone className="w-4 h-4 mr-2" />
                Lista Cliente (WhatsApp)
              </TabsTrigger>
              <TabsTrigger value="internal" className="flex-1">
                <Lock className="w-4 h-4 mr-2" />
                Lista Interna
              </TabsTrigger>
            </TabsList>

            <TabsContent value="customer" className="flex-1 mt-0">
              <Card className="flex flex-col h-full overflow-hidden bg-slate-950 border-slate-800 shadow-2xl">
                <CardHeader className="bg-slate-900 border-b border-slate-800 py-3 px-4 flex flex-row items-center justify-between space-y-0">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1.5">
                      <span className="w-3 h-3 rounded-full bg-red-500" />
                      <span className="w-3 h-3 rounded-full bg-yellow-500" />
                      <span className="w-3 h-3 rounded-full bg-green-500" />
                    </div>
                    <span className="ml-3 text-xs font-mono text-slate-400">
                      output.txt
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="p-0 flex-1 overflow-hidden relative group">
                  <textarea
                    value={generatedText}
                    readOnly
                    className={cn(
                      'w-full h-full bg-transparent text-slate-300 font-mono text-xs p-4 resize-none focus:outline-none leading-relaxed',
                      draftItems.length === 0 && 'opacity-30 italic',
                    )}
                    placeholder="Adicione produtos para gerar o texto..."
                  />
                  {draftItems.length > 0 && (
                    <div className="absolute bottom-6 right-6 flex flex-col gap-2">
                      <Button
                        onClick={handleSaveList}
                        disabled={isSaving}
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Salvar
                      </Button>
                      <Button
                        onClick={handleCopy}
                        size="sm"
                        className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg"
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Copiar
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="internal" className="flex-1 mt-0">
              <Card className="flex flex-col h-full overflow-hidden bg-white border-slate-200 shadow-lg">
                <CardHeader className="bg-slate-50 border-b border-slate-200 py-3 px-4 flex flex-row items-center justify-between space-y-0">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-slate-500" />
                    <span className="text-sm font-semibold text-slate-700">
                      Uso Interno
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="p-0 flex-1 overflow-hidden relative group">
                  <textarea
                    value={generatedText}
                    readOnly
                    className={cn(
                      'w-full h-full bg-transparent text-slate-800 font-mono text-xs p-4 resize-none focus:outline-none leading-relaxed',
                      draftItems.length === 0 && 'opacity-30 italic',
                    )}
                  />
                  {draftItems.length > 0 && (
                    <div className="absolute bottom-6 right-6 flex flex-col gap-2">
                      <Button
                        variant="outline"
                        onClick={handleSaveList}
                        disabled={isSaving}
                        size="sm"
                        className="bg-white"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Salvar
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleCopy}
                        size="sm"
                        className="bg-white hover:bg-slate-50"
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Copiar
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
