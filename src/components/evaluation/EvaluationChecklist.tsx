import { useState, useRef } from 'react'
import { useEvaluationStore } from '@/stores/useEvaluationStore'
import { useClientStore } from '@/stores/useClientStore'
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
  Search,
  FileIcon,
  X,
  Camera,
  Trash2,
  Eye,
  ImageIcon,
} from 'lucide-react'
import { toast } from 'sonner'
import { cn, formatCPF, formatPhone, validateCPF } from '@/lib/utils'
import { PeripheralDiscountConfig, ConsultationFile, Client } from '@/types'
import { ClientForm } from '@/components/clients/ClientForm'
import { WebcamCapture } from '@/components/common/WebcamCapture'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

export function EvaluationChecklist() {
  const {
    basePrices,
    peripheralDiscounts,
    checklistItems,
    categories,
    saveEvaluation,
    uploadEvidence,
  } = useEvaluationStore()
  const {
    currentClient,
    fetchClientByCpf,
    createClient,
    clearCurrentClient,
    isLoading: isClientLoading,
  } = useClientStore()
  const { currentUser, currentCompany } = useAuthStore()

  // State
  const [step, setStep] = useState(1)
  const [isSaving, setIsSaving] = useState(false)

  // Step 1: Identification
  const [selectedModelId, setSelectedModelId] = useState('')
  const [serialNumber, setSerialNumber] = useState('')

  // Step 2: Inspection (Checklist)
  const [checklistStatus, setChecklistStatus] = useState<
    Record<string, boolean>
  >({})

  // Step 4: Security & Client & Files
  const [securityChecks, setSecurityChecks] = useState({
    anatel: false,
    blacklist: false,
    mdm: false,
  })

  // Client Search State
  const [searchCpf, setSearchCpf] = useState('')
  const [showClientModal, setShowClientModal] = useState(false)
  const [isNewClient, setIsNewClient] = useState(false)

  // Files State - Refactored for clearer separation
  const [printFile, setPrintFile] = useState<{
    file: File
    preview: string
  } | null>(null)
  const [docFile, setDocFile] = useState<{
    file: File
    preview: string
  } | null>(null)
  const [consultationFiles, setConsultationFiles] = useState<
    { file: File; preview: string }[]
  >([])
  const [showWebcam, setShowWebcam] = useState(false)

  // Derived
  const selectedModel = basePrices.find((p) => p.id === selectedModelId)

  // Step 3 Logic: Calculate Price & Defects
  const getDetectedDefects = () => {
    if (!selectedModel) return []
    const defectItems = checklistItems.filter(
      (item) => !checklistStatus[item.id],
    )

    return defectItems.map((item) => {
      const discount = peripheralDiscounts.find(
        (d) =>
          d.checklist_item_id === item.id && d.modelo_id === selectedModel.id,
      )
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
      if (!currentClient) {
        toast.error('Identifique o cliente pelo CPF')
        return
      }
      if (!printFile) {
        toast.error('Anexe o Print de Segurança')
        return
      }
      if (!docFile) {
        toast.error('Anexe a Foto do Documento')
        return
      }
    }
    setStep((s) => s + 1)
  }

  const handleClientSearch = async () => {
    if (!searchCpf) return
    if (!validateCPF(searchCpf)) {
      toast.error('CPF inválido')
      return
    }

    const client = await fetchClientByCpf(searchCpf)
    if (client) {
      toast.success('Cliente encontrado!')
    } else {
      toast.info('Cliente não encontrado. Cadastre agora.')
      setIsNewClient(true)
      setShowClientModal(true)
    }
  }

  const handleCreateClient = async (data: any) => {
    if (!currentCompany) return false

    const {
      success,
      data: client,
      error,
    } = await createClient({
      ...data,
      company_id: currentCompany.id,
    })

    if (success && client) {
      toast.success('Cliente cadastrado!')
      setShowClientModal(false)
      // Client is auto-set in store by createClient
      return true
    } else {
      toast.error('Erro ao cadastrar cliente')
      return false
    }
  }

  // File Handlers
  const handlePrintUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0]
      setPrintFile({
        file,
        preview: URL.createObjectURL(file),
      })
    }
  }

  const handleDocUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0]
      setDocFile({
        file,
        preview: URL.createObjectURL(file),
      })
    }
  }

  const handleDocCapture = (file: File) => {
    setDocFile({
      file,
      preview: URL.createObjectURL(file),
    })
    setShowWebcam(false)
  }

  const handleConsultationUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).map((file) => ({
        file,
        preview: URL.createObjectURL(file),
      }))
      setConsultationFiles((prev) => [...prev, ...newFiles])
    }
  }

  const removeConsultationFile = (index: number) => {
    setConsultationFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSave = async () => {
    if (!currentUser || !selectedModel || !currentCompany || !currentClient)
      return

    if (!printFile || !docFile) {
      toast.error('Arquivos obrigatórios faltando (Print ou Documento).')
      return
    }

    setIsSaving(true)
    const toastId = toast.loading('Processando uploads e salvando dados...')

    try {
      // 1. Upload Print
      const printRes = await uploadEvidence(printFile.file)
      if (printRes.error || !printRes.url) {
        throw new Error(`Erro ao enviar Print: ${printRes.error?.message}`)
      }

      // 2. Upload Document
      const docRes = await uploadEvidence(docFile.file)
      if (docRes.error || !docRes.url) {
        throw new Error(`Erro ao enviar Documento: ${docRes.error?.message}`)
      }

      // 3. Upload Consultations (Parallel)
      const consultationResults: ConsultationFile[] = []
      if (consultationFiles.length > 0) {
        const uploadPromises = consultationFiles.map(async (f) => {
          const res = await uploadEvidence(f.file)
          if (res.error || !res.url) {
            console.error(`Falha no upload extra: ${f.file.name}`, res.error)
            // We log but maybe continue or throw?
            // User story says: "If any file fails... prevent database record... and alert user"
            throw new Error(`Erro ao enviar arquivo: ${f.file.name}`)
          }
          return {
            name: f.file.name,
            url: res.url,
            type: f.file.type.startsWith('image/') ? 'image' : 'document',
          } as ConsultationFile
        })

        const results = await Promise.all(uploadPromises)
        consultationResults.push(...results)
      }

      // 4. Save Record
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

        // Client Data
        clienteId: currentClient.id,
        nomeCliente: currentClient.nome,
        telefoneCliente: currentClient.telefone,
        cpf_cliente: currentClient.cpf,

        // Explicit Files
        urlPrint: printRes.url,
        urlDoc: docRes.url,
        consultationFiles: consultationResults,
      })

      if (result.success) {
        toast.success('Avaliação concluída com sucesso!', { id: toastId })
        // Reset
        setStep(1)
        setSelectedModelId('')
        setSerialNumber('')
        setChecklistStatus({})
        setSecurityChecks({ anatel: false, blacklist: false, mdm: false })
        clearCurrentClient()
        setSearchCpf('')
        setPrintFile(null)
        setDocFile(null)
        setConsultationFiles([])
      } else {
        toast.error(`Erro ao salvar no banco: ${result.error?.message}`, {
          id: toastId,
        })
      }
    } catch (e: any) {
      console.error(e)
      toast.error(e.message || 'Ocorreu um erro inesperado', { id: toastId })
    } finally {
      setIsSaving(false)
    }
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
              {step === 4 && '4. Segurança e Evidências'}
              {step === 5 && '5. Resumo e Finalização'}
            </CardTitle>
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
              <div className="space-y-8">
                {/* 1. Security Checks */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 border-b pb-2">
                    <ShieldCheck className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold text-lg">
                      1. Verificações de Segurança
                    </h3>
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    {[
                      {
                        key: 'anatel',
                        label: 'Anatel',
                        desc: 'Sem roubo/furto',
                      },
                      {
                        key: 'blacklist',
                        label: 'Blacklist',
                        desc: 'Internacional limpo',
                      },
                      { key: 'mdm', label: 'MDM', desc: 'Sem gestão remota' },
                    ].map((check) => (
                      <div
                        key={check.key}
                        className={cn(
                          'flex items-start space-x-3 p-4 rounded-lg border transition-all cursor-pointer hover:shadow-sm',
                          securityChecks[
                            check.key as keyof typeof securityChecks
                          ]
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
                          <Label className="font-bold cursor-pointer">
                            {check.label}
                          </Label>
                          <p className="text-xs text-muted-foreground">
                            {check.desc}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 2. Uploads */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 border-b pb-2">
                    <Upload className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold text-lg">2. Evidências</h3>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    {/* Print de Segurança */}
                    <div className="bg-slate-50 border border-dashed border-slate-300 rounded-lg p-4 space-y-3">
                      <Label className="font-bold text-slate-700 flex items-center gap-2">
                        <ImageIcon className="w-4 h-4" /> Print de Segurança *
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Anexe o print das consultas (Anatel, Blacklist, MDM)
                      </p>

                      {!printFile ? (
                        <div className="relative">
                          <Input
                            type="file"
                            accept="image/*,application/pdf"
                            className="hidden"
                            id="print-upload"
                            onChange={handlePrintUpload}
                          />
                          <Label
                            htmlFor="print-upload"
                            className="flex items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 rounded hover:bg-white cursor-pointer transition-colors text-slate-500"
                          >
                            <span className="flex flex-col items-center gap-1">
                              <Upload className="w-6 h-6" />
                              <span className="text-xs">
                                Clique para enviar
                              </span>
                            </span>
                          </Label>
                        </div>
                      ) : (
                        <div className="relative group border rounded-md p-2 bg-white flex items-center gap-2">
                          <div className="w-12 h-12 bg-slate-100 rounded overflow-hidden">
                            {printFile.file.type.startsWith('image/') ? (
                              <img
                                src={printFile.preview}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <FileIcon className="w-full h-full p-2 text-slate-500" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {printFile.file.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {(printFile.file.size / 1024).toFixed(0)}kb
                            </p>
                          </div>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="text-red-500 hover:bg-red-50"
                            onClick={() => setPrintFile(null)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Foto do Documento */}
                    <div className="bg-slate-50 border border-dashed border-slate-300 rounded-lg p-4 space-y-3">
                      <Label className="font-bold text-slate-700 flex items-center gap-2">
                        <UserIcon className="w-4 h-4" /> Foto do Documento *
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        RG, CNH ou documento oficial com foto do cliente
                      </p>

                      {!docFile ? (
                        <div className="flex flex-col gap-2">
                          <div className="relative">
                            <Input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              id="doc-upload"
                              onChange={handleDocUpload}
                            />
                            <Label
                              htmlFor="doc-upload"
                              className="flex items-center justify-center w-full h-20 border-2 border-dashed border-slate-300 rounded hover:bg-white cursor-pointer transition-colors text-slate-500"
                            >
                              <span className="flex flex-col items-center gap-1">
                                <Upload className="w-5 h-5" />
                                <span className="text-xs">Upload Arquivo</span>
                              </span>
                            </Label>
                          </div>
                          <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => setShowWebcam(true)}
                          >
                            <Camera className="w-4 h-4 mr-2" />
                            Usar Câmera
                          </Button>
                        </div>
                      ) : (
                        <div className="relative group border rounded-md p-2 bg-white flex items-center gap-2">
                          <div className="w-12 h-12 bg-slate-100 rounded overflow-hidden">
                            <img
                              src={docFile.preview}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {docFile.file.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {(docFile.file.size / 1024).toFixed(0)}kb
                            </p>
                          </div>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="text-red-500 hover:bg-red-50"
                            onClick={() => setDocFile(null)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Outros Arquivos */}
                    <div className="col-span-1 md:col-span-2 bg-slate-50 border border-dashed border-slate-300 rounded-lg p-4 space-y-3">
                      <Label className="font-bold text-slate-700 flex items-center gap-2">
                        <FileIcon className="w-4 h-4" /> Consultas Adicionais
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Outros arquivos relevantes (PDFs, Prints extras, etc)
                      </p>

                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <Input
                            type="file"
                            accept="image/*,application/pdf"
                            multiple
                            className="hidden"
                            id="extra-upload"
                            onChange={handleConsultationUpload}
                          />
                          <Label
                            htmlFor="extra-upload"
                            className="flex items-center justify-center px-4 py-2 bg-white border rounded shadow-sm hover:bg-slate-50 cursor-pointer text-sm font-medium"
                          >
                            <Upload className="w-4 h-4 mr-2" />
                            Adicionar Arquivos
                          </Label>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {consultationFiles.length} arquivos selecionados
                        </span>
                      </div>

                      {consultationFiles.length > 0 && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                          {consultationFiles.map((f, idx) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between p-2 bg-white border rounded text-xs"
                            >
                              <div className="flex items-center gap-2 truncate">
                                {f.file.type.startsWith('image/') ? (
                                  <ImageIcon className="w-3 h-3 text-blue-500" />
                                ) : (
                                  <FileIcon className="w-3 h-3 text-orange-500" />
                                )}
                                <span className="truncate max-w-[100px]">
                                  {f.file.name}
                                </span>
                              </div>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-5 w-5 text-red-500"
                                onClick={() => removeConsultationFile(idx)}
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* 3. Client Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 border-b pb-2">
                    <UserIcon className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold text-lg">
                      3. Dados do Cliente
                    </h3>
                  </div>

                  <div className="flex gap-2">
                    <div className="flex-1">
                      <Label>Pesquisar CPF</Label>
                      <div className="flex gap-2 mt-1">
                        <Input
                          placeholder="000.000.000-00"
                          value={searchCpf}
                          onChange={(e) =>
                            setSearchCpf(formatCPF(e.target.value))
                          }
                          maxLength={14}
                        />
                        <Button
                          onClick={handleClientSearch}
                          disabled={isClientLoading || !searchCpf}
                        >
                          {isClientLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Search className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                    {currentClient && (
                      <div className="flex-1 flex items-end">
                        <Button
                          variant="outline"
                          onClick={clearCurrentClient}
                          className="w-full text-red-500 hover:text-red-600"
                        >
                          Limpar Seleção
                        </Button>
                      </div>
                    )}
                  </div>

                  {currentClient && (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 space-y-2">
                      <div className="flex items-center gap-2 text-emerald-800 font-medium">
                        <CheckCircle2 className="w-4 h-4" />
                        Cliente Identificado
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Nome:</span>
                          <p className="font-medium">{currentClient.nome}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            Telefone:
                          </span>
                          <p className="font-medium">
                            {formatPhone(currentClient.telefone)}
                          </p>
                        </div>
                        <div className="col-span-2">
                          <span className="text-muted-foreground">
                            Endereço:
                          </span>
                          <p className="font-medium">
                            {[currentClient.municipio, currentClient.estado]
                              .filter(Boolean)
                              .join(' - ') ||
                              currentClient.endereco ||
                              '-'}
                          </p>
                        </div>
                      </div>
                      <div className="flex justify-end pt-2">
                        <Button
                          variant="link"
                          size="sm"
                          onClick={() => {
                            setIsNewClient(false)
                            setShowClientModal(true)
                          }}
                        >
                          Editar Dados
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {step === 5 && currentClient && (
              <div className="space-y-6">
                <div className="flex flex-col items-center justify-center py-10 text-center space-y-4">
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">
                      Tudo Pronto!
                    </h3>
                    <p className="text-muted-foreground max-w-md mx-auto mt-2">
                      Revise o resumo ao lado e confirme para gerar a avaliação.
                      Os dados do cliente e as evidências serão salvos
                      automaticamente.
                    </p>
                  </div>

                  <div className="bg-slate-50 p-6 rounded-lg border w-full max-w-md text-left space-y-3">
                    <h4 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground border-b pb-2">
                      Resumo da Operação
                    </h4>
                    <div className="flex justify-between">
                      <span className="text-sm">Cliente</span>
                      <span className="font-medium">{currentClient.nome}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">CPF</span>
                      <span className="font-medium">{currentClient.cpf}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Evidências</span>
                      <div className="text-right text-sm">
                        <span className="block text-green-600">
                          1 Print de Segurança
                        </span>
                        <span className="block text-green-600">
                          1 Documento
                        </span>
                        {consultationFiles.length > 0 && (
                          <span className="block text-blue-600">
                            {consultationFiles.length} Extra(s)
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span className="text-sm">Valor Final</span>
                      <span className="font-bold text-emerald-600">
                        R${' '}
                        {finalPrice.toLocaleString('pt-BR', {
                          minimumFractionDigits: 2,
                        })}
                      </span>
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
                Confirmar e Gravar
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

            {(step === 4 || step === 5) && (
              <div className="border-t border-slate-700 pt-4 space-y-2">
                <div className="flex items-center gap-2 text-sm text-slate-300">
                  <UserIcon className="w-4 h-4" />
                  {currentClient?.nome || 'Identificando...'}
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-300">
                  <ShieldCheck
                    className={cn(
                      'w-4 h-4',
                      securityChecks.anatel
                        ? 'text-green-500'
                        : 'text-slate-600',
                    )}
                  />
                  Segurança:{' '}
                  {Object.values(securityChecks).every(Boolean)
                    ? 'OK'
                    : 'Pendente'}
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-300">
                  <Upload
                    className={cn(
                      'w-4 h-4',
                      printFile && docFile
                        ? 'text-green-500'
                        : 'text-slate-600',
                    )}
                  />
                  Arquivos: {printFile && docFile ? 'OK' : 'Pendente'}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Client Modal */}
      <Dialog open={showClientModal} onOpenChange={setShowClientModal}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isNewClient ? 'Novo Cadastro' : 'Editar Cliente'}
            </DialogTitle>
          </DialogHeader>
          <ClientForm
            initialData={isNewClient ? { cpf: searchCpf } : currentClient || {}}
            onSubmit={handleCreateClient}
            onCancel={() => setShowClientModal(false)}
            isEditing={!isNewClient}
          />
        </DialogContent>
      </Dialog>

      {/* Webcam Modal */}
      <Dialog open={showWebcam} onOpenChange={setShowWebcam}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Capturar Foto do Documento</DialogTitle>
          </DialogHeader>
          <WebcamCapture
            onCapture={handleDocCapture}
            onCancel={() => setShowWebcam(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
