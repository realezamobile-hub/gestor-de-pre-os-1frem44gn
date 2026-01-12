import { useState } from 'react'
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
  RotateCcw,
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

const CHECKLIST_SECTIONS = [
  {
    id: 'physical',
    title: 'Inspeção Física',
    items: [
      { id: 'pentalobe', label: 'Parafusos Pentalobe (Inferiores) presentes' },
      {
        id: 'lci',
        label: 'LCI (Sensor de Umidade) - Branco/Prata',
        note: 'VERMELHO = REJEITAR IMEDIATAMENTE',
      },
      { id: 'housing', label: 'Carcaça sem amassados graves/empenos' },
      { id: 'screen_align', label: 'Alinhamento da Tela (Descolamento)' },
    ],
  },
  {
    id: 'display',
    title: 'Tela e Sensores',
    items: [
      { id: 'touch', label: 'Touch (Teste de arraste de ícone)' },
      { id: 'ghost_touch', label: 'Toque Fantasma (Ghost Touch)' },
      { id: 'dead_pixel', label: 'Pixels Mortos / Manchas' },
      { id: 'true_tone', label: 'True Tone Ativo' },
    ],
  },
  {
    id: 'hardware',
    title: 'Hardware Crítico',
    items: [
      { id: 'face_id', label: 'Face ID (Configuração e Desbloqueio)' },
      { id: 'cameras', label: 'Câmeras (Foco e Manchas)' },
      {
        id: 'ois',
        label: 'Estabilizador Óptico (Teste de Agitação)',
        note: 'Agite levemente para ouvir barulhos soltos',
      },
      { id: 'mics', label: 'Microfones (Frontal, Traseiro, Inferior)' },
      { id: 'speakers', label: 'Alto-falantes (Estéreo)' },
    ],
  },
  {
    id: 'system',
    title: 'Análise de Sistema',
    items: [
      { id: 'battery_health', label: 'Saúde da Bateria (>80%)' },
      { id: 'genuine_parts', label: 'Peças Genuínas (Avisos nos Ajustes)' },
      {
        id: 'panic_full',
        label: 'Panic Full (Logs de Erro)',
        note: 'Ajustes > Privacidade > Análise > Dados',
      },
    ],
  },
  {
    id: 'connectivity',
    title: 'Conectividade e Segurança',
    items: [
      { id: 'wifi_bt', label: 'Wi-Fi e Bluetooth' },
      { id: 'icloud', label: 'iCloud (Buscar iPhone) Desativado' },
      { id: 'imei', label: 'IMEI Limpo (Sem Blacklist)' },
      { id: 'mdm', label: 'Sem perfil MDM (Gerenciamento Remoto)' },
    ],
  },
]

export function EvaluationChecklist() {
  const { basePrices, peripheralDiscounts, saveEvaluation } =
    useEvaluationStore()
  const { currentUser } = useAuthStore()

  const [step, setStep] = useState(0)
  const [selectedModelId, setSelectedModelId] = useState('')
  const [serialNumber, setSerialNumber] = useState('')
  const [checks, setChecks] = useState<Record<string, boolean>>({})
  const [selectedDiscounts, setSelectedDiscounts] = useState<Set<string>>(
    new Set(),
  )
  const [isSaving, setIsSaving] = useState(false)

  const selectedModel = basePrices.find((p) => p.id === selectedModelId)

  const calculateTotal = () => {
    if (!selectedModel) return 0
    let total = selectedModel.preco_base
    selectedDiscounts.forEach((id) => {
      const discount = peripheralDiscounts.find((d) => d.id === id)
      if (discount) total -= discount.valor_desconto
    })
    return total
  }

  const handleCheck = (id: string, checked: boolean) => {
    setChecks((prev) => ({ ...prev, [id]: checked }))
  }

  const handleDiscountToggle = (id: string) => {
    const next = new Set(selectedDiscounts)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelectedDiscounts(next)
  }

  const handleSave = async () => {
    if (!selectedModel || !currentUser) return

    setIsSaving(true)
    const discountObjects = Array.from(selectedDiscounts)
      .map((id) => peripheralDiscounts.find((d) => d.id === id))
      .filter(Boolean) as any[]

    const result = await saveEvaluation(
      selectedModel.modelo,
      serialNumber,
      checks,
      calculateTotal(),
      discountObjects,
      currentUser.id,
    )

    setIsSaving(false)
    if (result.success) {
      toast.success('Avaliação salva com sucesso!')
      resetForm()
    } else {
      toast.error('Erro ao salvar avaliação')
    }
  }

  const resetForm = () => {
    setStep(0)
    setSelectedModelId('')
    setSerialNumber('')
    setChecks({})
    setSelectedDiscounts(new Set())
  }

  const isStepValid = () => {
    if (step === 0) return !!selectedModelId && !!serialNumber
    return true
  }

  const currentSection = CHECKLIST_SECTIONS[step - 1]

  return (
    <div className="grid lg:grid-cols-12 gap-6 h-full">
      {/* Left Panel: Checklist Wizard */}
      <div className="lg:col-span-8 flex flex-col gap-6">
        <Card className="flex-1 flex flex-col">
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span>
                {step === 0
                  ? 'Identificação do Aparelho'
                  : step <= CHECKLIST_SECTIONS.length
                    ? `Passo ${step}/${CHECKLIST_SECTIONS.length}: ${currentSection?.title}`
                    : 'Resumo da Avaliação'}
              </span>
              <span className="text-sm font-normal text-muted-foreground">
                {step > 0 && step <= CHECKLIST_SECTIONS.length && (
                  <span className="bg-primary/10 text-primary px-2 py-1 rounded text-xs font-bold">
                    {Math.round(
                      (Object.keys(checks).length /
                        CHECKLIST_SECTIONS.reduce(
                          (acc, s) => acc + s.items.length,
                          0,
                        )) *
                        100,
                    )}
                    %
                  </span>
                )}
              </span>
            </CardTitle>
            <CardDescription>
              {step === 0
                ? 'Selecione o modelo e informe o serial para iniciar.'
                : step <= CHECKLIST_SECTIONS.length
                  ? 'Marque os itens que estão EM BOM ESTADO (OK).'
                  : 'Revise os defeitos encontrados e finalize.'}
            </CardDescription>
          </CardHeader>

          <CardContent className="flex-1 overflow-y-auto">
            {step === 0 && (
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
                          {p.modelo} - R$ {p.preco_base}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Número de Série / IMEI</Label>
                  <Input
                    placeholder="DX3PL..."
                    value={serialNumber}
                    onChange={(e) =>
                      setSerialNumber(e.target.value.toUpperCase())
                    }
                  />
                </div>
              </div>
            )}

            {step > 0 &&
              step <= CHECKLIST_SECTIONS.length &&
              currentSection && (
                <div className="space-y-4">
                  {currentSection.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-slate-50 transition-colors"
                    >
                      <Checkbox
                        id={item.id}
                        checked={checks[item.id] || false}
                        onCheckedChange={(checked) =>
                          handleCheck(item.id, checked as boolean)
                        }
                        className="mt-1"
                      />
                      <div className="grid gap-1.5 leading-none">
                        <label
                          htmlFor={item.id}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                        >
                          {item.label}
                        </label>
                        {item.note && (
                          <p className="text-xs text-amber-600 font-medium flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {item.note}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

            {step > CHECKLIST_SECTIONS.length && (
              <div className="space-y-6">
                <div className="bg-slate-50 p-4 rounded-lg border">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <Smartphone className="w-4 h-4" />
                    {selectedModel?.modelo}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Serial: {serialNumber}
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">
                    Defeitos / Descontos Aplicados
                  </h3>
                  {selectedDiscounts.size === 0 ? (
                    <p className="text-sm text-muted-foreground italic">
                      Nenhum defeito selecionado. Aparelho avaliado como
                      perfeito.
                    </p>
                  ) : (
                    <ul className="space-y-2">
                      {Array.from(selectedDiscounts).map((id) => {
                        const discount = peripheralDiscounts.find(
                          (d) => d.id === id,
                        )
                        return discount ? (
                          <li
                            key={id}
                            className="flex justify-between text-sm p-2 bg-red-50 text-red-700 rounded border border-red-100"
                          >
                            <span>{discount.nome}</span>
                            <span className="font-bold">
                              - R$ {discount.valor_desconto}
                            </span>
                          </li>
                        ) : null
                      })}
                    </ul>
                  )}
                </div>
              </div>
            )}
          </CardContent>

          <CardFooter className="flex justify-between border-t pt-6">
            {step > 0 ? (
              <Button variant="outline" onClick={() => setStep(step - 1)}>
                <ChevronLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
            ) : (
              <div />
            )}

            {step <= CHECKLIST_SECTIONS.length ? (
              <Button
                onClick={() => setStep(step + 1)}
                disabled={!isStepValid()}
              >
                Próximo
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                <Save className="w-4 h-4 mr-2" />
                Salvar Avaliação
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>

      {/* Right Panel: Price Calculator */}
      <div className="lg:col-span-4 flex flex-col gap-6">
        <Card className="bg-slate-900 text-white border-slate-800 shadow-xl">
          <CardHeader>
            <CardTitle className="text-slate-100 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-400" />
              Calculadora de Compra
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-1">
              <span className="text-xs uppercase text-slate-400 font-bold tracking-wider">
                Preço Base
              </span>
              <div className="text-2xl font-bold text-white">
                R${' '}
                {selectedModel ? selectedModel.preco_base.toFixed(2) : '0.00'}
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-xs uppercase text-slate-400 font-bold tracking-wider">
                Deduções
              </span>
              <div className="text-xl font-medium text-red-400">
                - R${' '}
                {selectedDiscounts.size > 0
                  ? Array.from(selectedDiscounts)
                      .reduce(
                        (acc, id) =>
                          acc +
                          (peripheralDiscounts.find((d) => d.id === id)
                            ?.valor_desconto || 0),
                        0,
                      )
                      .toFixed(2)
                  : '0.00'}
              </div>
            </div>

            <div className="border-t border-slate-700 pt-4">
              <span className="text-xs uppercase text-emerald-400 font-bold tracking-wider">
                Valor Final Sugerido
              </span>
              <div className="text-4xl font-black text-emerald-400 mt-1">
                R$ {calculateTotal().toFixed(2)}
              </div>
            </div>
          </CardContent>
        </Card>

        {step > 0 && (
          <Card className="flex-1 flex flex-col">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Identificar Defeitos</CardTitle>
              <CardDescription className="text-xs">
                Marque abaixo para aplicar descontos automaticamente.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto pt-0">
              <div className="space-y-2">
                {peripheralDiscounts.map((discount) => (
                  <div
                    key={discount.id}
                    className={cn(
                      'flex items-center justify-between p-2 rounded border cursor-pointer transition-all',
                      selectedDiscounts.has(discount.id)
                        ? 'bg-red-50 border-red-200'
                        : 'hover:bg-slate-50 border-transparent',
                    )}
                    onClick={() => handleDiscountToggle(discount.id)}
                  >
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={selectedDiscounts.has(discount.id)}
                        onCheckedChange={() =>
                          handleDiscountToggle(discount.id)
                        }
                        className="data-[state=checked]:bg-red-600 data-[state=checked]:border-red-600"
                      />
                      <span
                        className={cn(
                          'text-sm',
                          selectedDiscounts.has(discount.id) &&
                            'text-red-700 font-medium',
                        )}
                      >
                        {discount.nome}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-red-600 bg-red-100 px-1.5 py-0.5 rounded">
                      -R${discount.valor_desconto}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="pt-2 border-t">
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-xs"
                onClick={() => setSelectedDiscounts(new Set())}
              >
                <RotateCcw className="w-3 h-3 mr-2" />
                Limpar Descontos
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  )
}
