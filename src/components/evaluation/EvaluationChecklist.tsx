import { useState, useRef } from 'react'
import { useEvaluationStore } from '@/stores/useEvaluationStore'
import { useAuthStore } from '@/stores/useAuthStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Smartphone,
  Save,
  ShieldCheck,
  User as UserIcon,
  Upload,
  Loader2,
  Image as ImageIcon,
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { PeripheralDiscountConfig } from '@/types'

export function EvaluationChecklist() {
  const {
    basePrices,
    peripheralDiscounts,
    checklistItems,
    categories,
    saveEvaluation,
    uploadEvidence,
  } = useEvaluationStore()
  const { currentUser } = useAuthStore()

  // State
  const [step, setStep] = useState(1)
  const [isSaving, setIsSaving] = useState(false)

  // Step 1: Identification
  const [selectedModelId, setSelectedModelId] = useState('')
  const [serialNumber, setSerialNumber] = useState('')

  // Step 2: Inspection (Checklist)
  // Store status of items: true = OK, false/undefined = Defect
  const [checklistStatus, setChecklistStatus] = useState<
    Record<string, boolean>
  >({})

  // Step 4: Security
  const [securityChecks, setSecurityChecks] = useState({
    anatel: false,
    blacklist: false,
    mdm: false,
  })

  // Step 5: Customer & Evidence
  const [customerData, setCustomerData] = useState({
    name: '',
    phone: '',
    cpf: '',
  })
  const [files, setFiles] = useState<{
    print: File | null
    doc: File | null
  }>({ print: null, doc: null })

  // Derived
  const selectedModel = basePrices.find((p) => p.id === selectedModelId)

  // Step 3 Logic: Calculate Price & Defects
  const getDetectedDefects = () => {
    if (!selectedModel) return []

    // Items NOT checked are defects
    const defectItems = checklistItems.filter(
      (item) => !checklistStatus[item.id],
    )

    return defectItems.map((item) => {
      // Find discount for this model and this item
      const discount = peripheralDiscounts.find(
        (d) =>
          d.checklist_item_id === item.id && d.modelo_id === selectedModel.id,
      )
      // Fallback: Try finding a global discount (no model) with same item
      const fallbackDiscount = !discount
        ? peripheralDiscounts.find(
            (d) => d.checklist_item_id === item.id && !d.modelo_id,
          )
        : null

      return {
        item,
        discount: discount || fallbackDiscount,
        value: discount
          ? discount.valor_desconto
          : fallbackDiscount
            ? fallbackDiscount.valor_desconto
            : 0,
      }
    })
  }

  const detectedDefects = getDetectedDefects()
  const totalDiscounts = detectedDefects.reduce(
    (acc, def) => acc + def.value,
    0,
  )
  const finalPrice = selectedModel
    ? Math.max(0, selectedModel.preco_base - totalDiscounts)
    : 0

  // Handlers
  const handleNext = () => {
    if (step === 1) {
      if (!selectedModelId || !serialNumber) {
        toast.error('Preencha todos os campos')
        return
      }
    }
    if (step === 4) {
      if (
        !securityChecks.anatel ||
        !securityChecks.blacklist ||
        !securityChecks.mdm
      ) {
        toast.error('Realize todas as verificações de segurança')
        return
      }
    }
    setStep((s) => s + 1)
  }

  const handleSave = async () => {
    if (!currentUser || !selectedModel) return
    if (!customerData.name || !customerData.phone || !customerData.cpf) {
      toast.error('Preencha os dados do cliente')
      return
    }
    if (!files.print || !files.doc) {
      toast.error('Anexe as evidências obrigatórias')
      return
    }

    setIsSaving(true)

    // Upload Files
    const printUpload = await uploadEvidence(files.print)
    if (printUpload.error) {
      toast.error('Erro ao enviar print de segurança')
      setIsSaving(false)
      return
    }

    const docUpload = await uploadEvidence(files.doc)
    if (docUpload.error) {
      toast.error('Erro ao enviar foto do documento')
      setIsSaving(false)
      return
    }

    // Save Record
    const result = await saveEvaluation({
      modelo: selectedModel.modelo,
      serialNumber,
      checklistData: checklistStatus,
      valorFinal: finalPrice,
      descontos: detectedDefects.map(
        (d) =>
          ({
            id: d.discount?.id || 'unknown',
            nome: d.item.nome,
            valor_desconto: d.value,
          }) as PeripheralDiscountConfig,
      ),
      userId: currentUser.id,
      nomeCliente: customerData.name,
      telefoneCliente: customerData.phone,
      cpfCliente: customerData.cpf,
      urlPrintSeguranca: printUpload.url || '',
      urlFotoDocumento: docUpload.url || '',
    })

    setIsSaving(false)
    if (result.success) {
      toast.success('Avaliação salva com sucesso!')
      resetForm()
    } else {
      toast.error('Erro ao salvar avaliação')
    }
  }

  const resetForm = () => {
    setStep(1)
    setSelectedModelId('')
    setSerialNumber('')
    setChecklistStatus({})
    setSecurityChecks({ anatel: false, blacklist: false, mdm: false })
    setCustomerData({ name: '', phone: '', cpf: '' })
    setFiles({ print: null, doc: null })
  }

  const getCategoryName = (id: string) => {
    return categories.find((c) => c.id === id)?.name || 'Outros'
  }

  return (
    <div className="grid lg:grid-cols-12 gap-6 h-full">
      {/* Main Wizard Area */}
      <div className="lg:col-span-8 flex flex-col gap-6">
        <Card className="flex-1 flex flex-col shadow-md">
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <div
                  key={s}
                  className={cn(
                    'h-2 flex-1 rounded-full transition-all',
                    s <= step ? 'bg-primary' : 'bg-muted',
                  )}
                />
              ))}
            </div>
            <CardTitle>
              {step === 1 && '1. Identificação do Aparelho'}
              {step === 2 && '2. Inspeção Técnica'}
              {step === 3 && '3. Precificação e Defeitos'}
              {step === 4 && '4. Verificação de Segurança'}
              {step === 5 && '5. Finalização e Cliente'}
            </CardTitle>
            <CardDescription>
              {step === 1 &&
                'Selecione o modelo e informe o serial para iniciar.'}
              {step === 2 &&
                'Marque APENAS os itens que estão OK (Funcionando).'}
              {step === 3 && 'Revise os defeitos detectados e o valor final.'}
              {step === 4 && 'Confirme as consultas de segurança obrigatórias.'}
              {step === 5 && 'Preencha os dados do cliente e anexe evidências.'}
            </CardDescription>
          </CardHeader>

          <CardContent className="flex-1 overflow-y-auto">
            {step === 1 && (
              <div className="space-y-4 max-w-md">
                <div className="space-y-2">
                  <Label>Modelo do iPhone</Label>
                  <Select
                    value={selectedModelId}
                    onValueChange={setSelectedModelId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o modelo" />
                    </SelectTrigger>
                    <SelectContent>
                      {basePrices.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.modelo}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Serial Number / IMEI</Label>
                  <Input
                    placeholder="Ex: DX3PL..."
                    value={serialNumber}
                    onChange={(e) =>
                      setSerialNumber(e.target.value.toUpperCase())
                    }
                  />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                {categories.map((category) => {
                  const items = checklistItems.filter(
                    (i) => i.category_id === category.id,
                  )
                  if (items.length === 0) return null

                  return (
                    <div key={category.id} className="space-y-3">
                      <h3 className="font-semibold text-sm uppercase text-muted-foreground tracking-wider bg-slate-50 p-2 rounded">
                        {category.name}
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {items.map((item) => (
                          <div
                            key={item.id}
                            className={cn(
                              'flex items-start space-x-3 p-3 rounded-lg border transition-all cursor-pointer',
                              checklistStatus[item.id]
                                ? 'bg-green-50 border-green-200'
                                : 'hover:bg-slate-50',
                            )}
                            onClick={() =>
                              setChecklistStatus((prev) => ({
                                ...prev,
                                [item.id]: !prev[item.id],
                              }))
                            }
                          >
                            <Checkbox
                              checked={checklistStatus[item.id] || false}
                              onCheckedChange={() => {}}
                              className="mt-1 data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                            />
                            <div className="flex-1">
                              <Label className="cursor-pointer font-medium">
                                {item.nome}
                              </Label>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {checklistStatus[item.id]
                                  ? 'OK'
                                  : 'Defeito / Não verificado'}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}

                {/* Handling unassigned items if any */}
                {checklistItems.some((i) => !i.category_id) && (
                  <div className="space-y-3">
                    <h3 className="font-semibold text-sm uppercase text-muted-foreground tracking-wider bg-slate-50 p-2 rounded">
                      Sem Categoria
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {checklistItems
                        .filter((i) => !i.category_id)
                        .map((item) => (
                          <div
                            key={item.id}
                            className={cn(
                              'flex items-start space-x-3 p-3 rounded-lg border transition-all cursor-pointer',
                              checklistStatus[item.id]
                                ? 'bg-green-50 border-green-200'
                                : 'hover:bg-slate-50',
                            )}
                            onClick={() =>
                              setChecklistStatus((prev) => ({
                                ...prev,
                                [item.id]: !prev[item.id],
                              }))
                            }
                          >
                            <Checkbox
                              checked={checklistStatus[item.id] || false}
                              onCheckedChange={() => {}}
                            />
                            <div className="flex-1">
                              <Label className="cursor-pointer font-medium">
                                {item.nome}
                              </Label>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {checklistStatus[item.id]
                                  ? 'OK'
                                  : 'Defeito / Não verificado'}
                              </p>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <div className="bg-slate-50 p-4 rounded-lg border">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-amber-500" />
                    Defeitos Identificados ({detectedDefects.length})
                  </h3>
                  {detectedDefects.length === 0 ? (
                    <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 p-3 rounded border border-emerald-100">
                      <CheckCircle2 className="w-5 h-5" />
                      <span>
                        Nenhum defeito encontrado. Aparelho em perfeito estado!
                      </span>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {detectedDefects.map((d, idx) => (
                        <div
                          key={idx}
                          className="flex justify-between items-center p-3 bg-white border rounded shadow-sm"
                        >
                          <div>
                            <span className="font-medium text-red-700">
                              {d.item.nome}
                            </span>
                            <span className="text-xs text-muted-foreground block">
                              {getCategoryName(d.item.category_id)}
                            </span>
                          </div>
                          <div className="text-red-600 font-bold">
                            - R$ {d.value.toFixed(2)}
                            {!d.discount && (
                              <span className="text-xs font-normal text-muted-foreground ml-1">
                                (Sem config)
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-6">
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-4">
                  <p className="text-sm text-blue-800">
                    Realize as consultas nos sites oficiais e marque as caixas
                    abaixo para confirmar que o aparelho está limpo.
                  </p>
                </div>

                <div className="grid gap-4">
                  {[
                    {
                      key: 'anatel',
                      label: 'Consulta Anatel (Impedimentos)',
                      desc: 'Verificar se há bloqueio por roubo/furto na Anatel.',
                    },
                    {
                      key: 'blacklist',
                      label: 'Consulta Blacklist Internacional',
                      desc: 'Verificar restrições em operadoras internacionais.',
                    },
                    {
                      key: 'mdm',
                      label: 'Consulta MDM (Gerenciamento)',
                      desc: 'Verificar se há perfil corporativo ou financeiro ativo.',
                    },
                  ].map((check) => (
                    <div
                      key={check.key}
                      className={cn(
                        'flex items-start space-x-3 p-4 rounded-lg border transition-all cursor-pointer',
                        securityChecks[check.key as keyof typeof securityChecks]
                          ? 'bg-green-50 border-green-200'
                          : 'bg-white',
                      )}
                      onClick={() =>
                        setSecurityChecks((prev) => ({
                          ...prev,
                          [check.key]:
                            !prev[check.key as keyof typeof securityChecks],
                        }))
                      }
                    >
                      <Checkbox
                        checked={
                          securityChecks[
                            check.key as keyof typeof securityChecks
                          ]
                        }
                        className="mt-1 data-[state=checked]:bg-green-600"
                      />
                      <div>
                        <Label className="font-bold cursor-pointer text-base">
                          {check.label}
                        </Label>
                        <p className="text-sm text-muted-foreground mt-1">
                          {check.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {step === 5 && (
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nome do Cliente</Label>
                    <Input
                      value={customerData.name}
                      onChange={(e) =>
                        setCustomerData((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      placeholder="Nome completo"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Telefone / WhatsApp</Label>
                    <Input
                      value={customerData.phone}
                      onChange={(e) =>
                        setCustomerData((prev) => ({
                          ...prev,
                          phone: e.target.value,
                        }))
                      }
                      placeholder="(00) 00000-0000"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>CPF</Label>
                    <Input
                      value={customerData.cpf}
                      onChange={(e) =>
                        setCustomerData((prev) => ({
                          ...prev,
                          cpf: e.target.value,
                        }))
                      }
                      placeholder="000.000.000-00"
                    />
                  </div>
                </div>

                <div className="border-t pt-4 space-y-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    Evidências Obrigatórias
                  </h3>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center text-center space-y-2 hover:bg-slate-50 transition-colors">
                      <ShieldCheck
                        className={cn(
                          'w-8 h-8',
                          files.print
                            ? 'text-green-500'
                            : 'text-muted-foreground',
                        )}
                      />
                      <Label htmlFor="file-print" className="cursor-pointer">
                        <span className="font-semibold text-primary">
                          Clique para enviar
                        </span>
                        <br /> Print das Consultas
                      </Label>
                      <span className="text-xs text-muted-foreground">
                        {files.print
                          ? files.print.name
                          : 'Anatel, Blacklist, MDM'}
                      </span>
                      <Input
                        id="file-print"
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={(e) =>
                          setFiles((prev) => ({
                            ...prev,
                            print: e.target.files?.[0] || null,
                          }))
                        }
                      />
                    </div>

                    <div className="border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center text-center space-y-2 hover:bg-slate-50 transition-colors">
                      <ImageIcon
                        className={cn(
                          'w-8 h-8',
                          files.doc
                            ? 'text-green-500'
                            : 'text-muted-foreground',
                        )}
                      />
                      <Label htmlFor="file-doc" className="cursor-pointer">
                        <span className="font-semibold text-primary">
                          Clique para enviar
                        </span>
                        <br /> Documento do Cliente
                      </Label>
                      <span className="text-xs text-muted-foreground">
                        {files.doc
                          ? files.doc.name
                          : 'RG ou CNH (Frente/Verso)'}
                      </span>
                      <Input
                        id="file-doc"
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={(e) =>
                          setFiles((prev) => ({
                            ...prev,
                            doc: e.target.files?.[0] || null,
                          }))
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>

          <CardFooter className="flex justify-between border-t pt-6 bg-gray-50/30">
            {step > 1 ? (
              <Button
                variant="outline"
                onClick={() => setStep(step - 1)}
                disabled={isSaving}
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
            ) : (
              <div />
            )}

            {step < 5 ? (
              <Button onClick={handleNext}>
                Próximo
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Gravar Avaliação
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>

      {/* Right Panel: Price Calculator Summary */}
      <div className="lg:col-span-4 flex flex-col gap-6">
        <Card className="bg-slate-950 text-white border-slate-800 shadow-xl sticky top-24">
          <CardHeader>
            <CardTitle className="text-slate-100 flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-emerald-400" />
              Resumo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-1">
              <span className="text-xs uppercase text-slate-400 font-bold tracking-wider">
                Modelo
              </span>
              <div className="text-lg font-bold text-white truncate">
                {selectedModel?.modelo || 'Selecione...'}
              </div>
              <div className="text-2xl text-white">
                R${' '}
                {selectedModel
                  ? selectedModel.preco_base.toLocaleString('pt-BR', {
                      minimumFractionDigits: 2,
                    })
                  : '0,00'}
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-xs uppercase text-slate-400 font-bold tracking-wider">
                Deduções
              </span>
              <div className="text-xl font-medium text-red-400">
                - R${' '}
                {totalDiscounts.toLocaleString('pt-BR', {
                  minimumFractionDigits: 2,
                })}
              </div>
              <p className="text-xs text-slate-500">
                {detectedDefects.length} defeitos detectados
              </p>
            </div>

            <div className="border-t border-slate-700 pt-4">
              <span className="text-xs uppercase text-emerald-400 font-bold tracking-wider">
                Valor Final Sugerido
              </span>
              <div className="text-4xl font-black text-emerald-400 mt-1">
                R${' '}
                {finalPrice.toLocaleString('pt-BR', {
                  minimumFractionDigits: 2,
                })}
              </div>
            </div>

            {step === 5 && (
              <div className="border-t border-slate-700 pt-4 space-y-2">
                <div className="flex items-center gap-2 text-sm text-slate-300">
                  <UserIcon className="w-4 h-4" />
                  {customerData.name || 'Cliente'}
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-300">
                  <ShieldCheck
                    className={cn(
                      'w-4 h-4',
                      files.print ? 'text-green-500' : 'text-slate-600',
                    )}
                  />
                  Print Consultas
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
