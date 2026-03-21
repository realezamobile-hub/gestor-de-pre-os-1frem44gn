import { useState, useEffect, useRef } from 'react'
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
  Smile,
  ArrowDownAZ,
  Wand2,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DraftItem, GeneratorConfigData } from '@/types'
import { GeneratorConfig } from '@/components/generator/GeneratorConfig'
import { DraftListGrouped } from '@/components/generator/DraftListGrouped'
import { GeneratorHistory } from '@/components/generator/GeneratorHistory'
import { EmojiPicker } from '@/components/common/EmojiPicker'
import { AutoListGeneratorCard } from '@/components/generator/AutoListGeneratorCard'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function ListGeneratorPage() {
  const {
    draftItems,
    fetchDraftItems,
    removeFromDraft,
    updateDraftItem,
    clearDraft,
    fetchCategories,
    saveGeneratedList,
    applyMarkupToAll,
    fetchGeneratedLists,
    optimizeDraftByLowestPrice,
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

  // Sorting State
  const [isSorted, setIsSorted] = useState(false)

  // Persistence for config
  useEffect(() => {
    const savedContact = localStorage.getItem('generator_contactNumber')
    const savedCommunity = localStorage.getItem('generator_communityLink')
    const savedMarkup = localStorage.getItem('generator_markup')

    setConfig((prev) => ({
      ...prev,
      contactNumber: savedContact || prev.contactNumber,
      communityLink: savedCommunity || prev.communityLink,
      markup: savedMarkup ? Number(savedMarkup) : prev.markup,
    }))
  }, [])

  useEffect(() => {
    localStorage.setItem('generator_contactNumber', config.contactNumber)
    localStorage.setItem('generator_communityLink', config.communityLink)
    localStorage.setItem('generator_markup', config.markup.toString())
  }, [config.contactNumber, config.communityLink, config.markup])

  // Preview States
  const [customerText, setCustomerText] = useState('')
  const [internalText, setInternalText] = useState('')
  const [isInternal, setIsInternal] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const previewTextareaRef = useRef<HTMLTextAreaElement>(null)

  // Save Dialog States
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false)
  const [listName, setListName] = useState('')

  // Trigger to auto-refresh previews after global operations
  const [triggerRefresh, setTriggerRefresh] = useState(false)

  // Load preview persistence
  useEffect(() => {
    const savedCustomer = localStorage.getItem('generator_customerText')
    const savedInternal = localStorage.getItem('generator_internalText')
    if (savedCustomer) setCustomerText(savedCustomer)
    if (savedInternal) setInternalText(savedInternal)
  }, [])

  // Save preview persistence
  useEffect(() => {
    localStorage.setItem('generator_customerText', customerText)
    localStorage.setItem('generator_internalText', internalText)
  }, [customerText, internalText])

  useEffect(() => {
    fetchCategories()
    fetchDraftItems()
    fetchGeneratedLists()
  }, [])

  const generateContent = (internal: boolean) => {
    // Group by Group Name
    const grouped = draftItems.reduce(
      (acc, item) => {
        const rawGroup = item.group_name || item.product?.categoria || 'Outros'
        const key = rawGroup.trim() || 'Outros'
        if (!acc[key]) acc[key] = []
        acc[key].push(item)
        return acc
      },
      {} as Record<string, DraftItem[]>,
    )

    const sortedKeys = Object.keys(grouped).sort()
    let text = ''

    // 1. Header
    if (internal) {
      text += `🔐 *LISTA INTERNA - CUSTOS E FORNECEDORES* 🔐\n`
      text += `📅 Data: ${new Date().toLocaleDateString('pt-BR')} \n\n`
    } else {
      text += config.header
      if (!config.header.endsWith('\n\n')) text += '\n\n'
    }

    // 2. Groups and Items
    sortedKeys.forEach((groupName) => {
      let items = grouped[groupName]
      if (items.length === 0) return

      if (isSorted) {
        items = [...items].sort((a, b) => {
          const modelA = (
            a.custom_model ||
            a.product?.modelo ||
            ''
          ).toLowerCase()
          const modelB = (
            b.custom_model ||
            b.product?.modelo ||
            ''
          ).toLowerCase()
          if (modelA !== modelB) return modelA.localeCompare(modelB)

          let priceA = 0
          let priceB = 0

          if (internal) {
            priceA = a.product?.valor ?? a.custom_price ?? 0
            priceB = b.product?.valor ?? b.custom_price ?? 0
          } else {
            priceA =
              a.custom_price !== null && a.custom_price !== undefined
                ? a.custom_price
                : (a.product?.valor || 0) + config.markup
            priceB =
              b.custom_price !== null && b.custom_price !== undefined
                ? b.custom_price
                : (b.product?.valor || 0) + config.markup
          }

          return priceA - priceB
        })
      }

      text += `*${groupName}*\n`

      items.forEach((item) => {
        let model = item.custom_model
        if (!model && item.product) {
          model = [
            item.product.modelo,
            item.product.memoria,
            item.product.ram ? `${item.product.ram} RAM` : null,
            item.product.cor,
          ]
            .filter(Boolean)
            .join(' ')
        }
        if (!model) model = 'Produto sem descrição'
        if (item.custom_details) model += ` (${item.custom_details})`

        let finalPrice = 0

        if (internal) {
          // Internal: Cost price (product.valor)
          finalPrice = item.product?.valor ?? item.custom_price ?? 0
        } else {
          // Public: Custom Price > Product Price + Markup
          if (item.custom_price !== null && item.custom_price !== undefined) {
            finalPrice = item.custom_price
          } else {
            finalPrice = (item.product?.valor || 0) + config.markup
          }
        }

        const priceStr = finalPrice
          ? `R$ ${finalPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
          : 'Consulte'

        text += ` - ${model} - ${!internal ? '*' : ''}${priceStr}${!internal ? '*' : ''}`

        if (internal && item.product) {
          text += `\n   ↳ Forn: ${item.product.fornecedor || 'N/A'}`
          if (item.product.telefone) text += ` | Tel: ${item.product.telefone}`
        }

        text += `\n`
      })
      text += '\n'
    })

    // 4. Links & Footer (Public only)
    if (!internal) {
      if (config.communityLink) text += `\n${config.communityLink}\n`
      if (config.contactNumber) {
        const cleanNumber = config.contactNumber.replace(/\D/g, '')
        text += `\nMe chame pelo WhatsApp: https://wa.me/${cleanNumber}\n`
      }
      text += '\n'
      text += config.footer
      if (!config.footer.endsWith('\n')) text += '\n'
    }

    return text
  }

  // Auto-refresh effect
  useEffect(() => {
    if (triggerRefresh) {
      setCustomerText(generateContent(false))
      setInternalText(generateContent(true))
      setTriggerRefresh(false)
    }
  }, [triggerRefresh, draftItems, config, isSorted])

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
      toast.error('Adicione itens à lista para gerar o texto.')
      return
    }
    // Generate both
    setCustomerText(generateContent(false))
    setInternalText(generateContent(true))
    toast.success('Textos gerados com sucesso!')
  }

  const handleGlobalIncrease = async (markup: number) => {
    await applyMarkupToAll(markup)
    setTriggerRefresh(true)
  }

  const handleOptimize = async () => {
    await optimizeDraftByLowestPrice()
    setTriggerRefresh(true)
  }

  const handleClear = async () => {
    await clearDraft()
    setCustomerText('')
    setInternalText('')
    localStorage.removeItem('generator_customerText')
    localStorage.removeItem('generator_internalText')
  }

  const handleCopy = () => {
    const textToCopy = isInternal ? internalText : customerText
    if (!textToCopy) return
    navigator.clipboard.writeText(textToCopy)
    toast.success('Lista copiada para a área de transferência!')
  }

  const handleOpenSaveDialog = () => {
    const textToSave = isInternal ? internalText : customerText
    if (!textToSave || draftItems.length === 0) return

    const defaultName = isInternal ? 'Lista Interna' : 'Lista Clientes'
    setListName(`${defaultName} - ${new Date().toLocaleDateString('pt-BR')}`)
    setIsSaveDialogOpen(true)
  }

  const handleConfirmSaveList = async () => {
    const textToSave = isInternal ? internalText : customerText
    if (!textToSave || draftItems.length === 0) return

    setIsSaving(true)
    const type = isInternal ? 'supplier' : 'posting'
    const finalTitle =
      listName.trim() || (isInternal ? 'Lista Interna' : 'Lista Clientes')

    const result = await saveGeneratedList(
      finalTitle,
      textToSave,
      type,
      config,
      draftItems,
    )

    setIsSaving(false)
    if (result.success) {
      toast.success('Lista salva no histórico!')
      setIsSaveDialogOpen(false)
    } else {
      toast.error('Erro ao salvar lista')
    }
  }

  const insertEmojiInPreview = (emoji: string) => {
    const el = previewTextareaRef.current
    if (!el) return

    const start = el.selectionStart
    const end = el.selectionEnd
    const currentValue = isInternal ? internalText : customerText

    if (start === null || end === null) return

    const before = currentValue.substring(0, start)
    const after = currentValue.substring(end)
    const newValue = `${before}${emoji}${after}`

    if (isInternal) {
      setInternalText(newValue)
    } else {
      setCustomerText(newValue)
    }

    setTimeout(() => {
      el.focus()
      el.setSelectionRange(start + emoji.length, start + emoji.length)
    }, 0)
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
          <GeneratorHistory />
          <Button
            variant="outline"
            onClick={handleClear}
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
          <AutoListGeneratorCard
            onGenerated={() => {
              setIsSorted(true)
              setTriggerRefresh(true)
            }}
          />
          <GeneratorConfig
            config={config}
            onChange={setConfig}
            onApplyMarkup={handleGlobalIncrease}
          />
        </div>

        {/* Middle Column: Draft Items (Expanded) */}
        <div className="xl:col-span-5 flex flex-col h-full min-h-0">
          <Card className="flex-1 flex flex-col min-h-0 border-2 shadow-sm">
            <CardHeader className="bg-gray-50 border-b py-3 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <span>Itens da Lista (Rascunho)</span>
                <span className="text-xs bg-white px-2 py-1 rounded border font-normal">
                  {draftItems.length} itens
                </span>
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleOptimize}
                  disabled={draftItems.length === 0 || isSaving}
                  className="h-7 text-xs text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 border-emerald-200"
                >
                  <Wand2 className="w-3 h-3 mr-1.5" />
                  Otimizar Menor Preço
                </Button>
                <Button
                  variant={isSorted ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setIsSorted(!isSorted)
                    setTriggerRefresh(true)
                  }}
                  className="h-7 text-xs"
                >
                  <ArrowDownAZ className="w-3 h-3 mr-1.5" />
                  {isSorted ? 'Ordenado A-Z' : 'Ordenar AZ'}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-4 flex-1 overflow-hidden bg-gray-50/30">
              <DraftListGrouped
                items={draftItems}
                onRemove={removeFromDraft}
                onUpdate={updateDraftItem}
                isSorted={isSorted}
                markup={config.markup}
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
                  <div className="flex items-center gap-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div>
                          <EmojiPicker
                            onEmojiSelect={insertEmojiInPreview}
                            trigger={
                              <Button
                                size="sm"
                                variant="ghost"
                                className={cn(
                                  'h-7 px-2',
                                  isInternal
                                    ? 'text-slate-600 hover:bg-slate-200'
                                    : 'text-slate-400 hover:bg-slate-800',
                                )}
                              >
                                <Smile className="w-4 h-4" />
                              </Button>
                            }
                            side="left"
                          />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>Inserir Emoji</TooltipContent>
                    </Tooltip>

                    <Button
                      onClick={handleGenerate}
                      size="sm"
                      variant={isInternal ? 'outline' : 'secondary'}
                      className="h-7 text-xs"
                    >
                      <RefreshCw className="w-3 h-3 mr-1.5" />
                      Gerar Prévias
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-0 flex-1 overflow-hidden relative group">
                  <textarea
                    ref={previewTextareaRef}
                    value={isInternal ? internalText : customerText}
                    onChange={(e) =>
                      isInternal
                        ? setInternalText(e.target.value)
                        : setCustomerText(e.target.value)
                    }
                    className={cn(
                      'w-full h-full bg-transparent font-mono text-xs p-4 resize-none focus:outline-none leading-relaxed',
                      isInternal ? 'text-slate-800' : 'text-slate-300',
                      !customerText &&
                        !internalText &&
                        'opacity-50 italic text-center pt-20',
                    )}
                    placeholder={
                      draftItems.length > 0
                        ? "Clique em 'Gerar Prévias' para visualizar o resultado..."
                        : 'Adicione produtos para gerar o texto...'
                    }
                  />

                  {(isInternal ? internalText : customerText) && (
                    <div className="absolute bottom-6 right-6 flex flex-col gap-2">
                      <Button
                        onClick={handleOpenSaveDialog}
                        disabled={isSaving}
                        size="sm"
                        className={cn(
                          'shadow-lg',
                          isInternal
                            ? 'bg-slate-800 text-white hover:bg-slate-900'
                            : 'bg-blue-600 hover:bg-blue-700 text-white',
                        )}
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Salvar
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

      <Dialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Salvar Lista</DialogTitle>
            <DialogDescription>
              Dê um nome para esta lista para facilitar a identificação no
              histórico.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="list-name">Nome da Lista</Label>
              <Input
                id="list-name"
                value={listName}
                onChange={(e) => setListName(e.target.value)}
                placeholder="Ex: Promoção de Outubro"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleConfirmSaveList()
                }}
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsSaveDialogOpen(false)}
              disabled={isSaving}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleConfirmSaveList}
              disabled={isSaving || !listName.trim()}
            >
              {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Salvar Lista
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
