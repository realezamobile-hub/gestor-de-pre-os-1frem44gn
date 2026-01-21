import { useRef } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import {
  DollarSign,
  FileText,
  Link as LinkIcon,
  Phone,
  Zap,
  Bold,
  Italic,
  Smile,
} from 'lucide-react'
import { GeneratorConfigData } from '@/types'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface GeneratorConfigProps {
  config: GeneratorConfigData
  onChange: (config: GeneratorConfigData) => void
  onApplyMarkup: (markup: number) => void
}

export function GeneratorConfig({
  config,
  onChange,
  onApplyMarkup,
}: GeneratorConfigProps) {
  const headerRef = useRef<HTMLTextAreaElement>(null)
  const footerRef = useRef<HTMLTextAreaElement>(null)

  const handleChange = (field: keyof GeneratorConfigData, value: any) => {
    onChange({ ...config, [field]: value })
  }

  const handleApply = () => {
    if (config.markup < 0) return
    onApplyMarkup(config.markup)
  }

  const insertFormat = (
    ref: React.RefObject<HTMLTextAreaElement>,
    field: keyof GeneratorConfigData,
    char: string,
  ) => {
    const el = ref.current
    if (!el) return

    const start = el.selectionStart
    const end = el.selectionEnd
    const value = el.value

    if (start === null || end === null) return

    const selected = value.substring(start, end)
    const before = value.substring(0, start)
    const after = value.substring(end)

    const newValue = `${before}${char}${selected}${char}${after}`
    handleChange(field, newValue)

    setTimeout(() => {
      el.focus()
      el.setSelectionRange(start + char.length, end + char.length)
    }, 0)
  }

  const FormatToolbar = ({
    targetRef,
    field,
  }: {
    targetRef: React.RefObject<HTMLTextAreaElement>
    field: keyof GeneratorConfigData
  }) => (
    <div className="flex items-center gap-1 mb-1">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 hover:bg-slate-200"
            onMouseDown={(e) => {
              e.preventDefault()
              insertFormat(targetRef, field, '*')
            }}
          >
            <Bold className="w-3 h-3" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Negrito</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 hover:bg-slate-200"
            onMouseDown={(e) => {
              e.preventDefault()
              insertFormat(targetRef, field, '_')
            }}
          >
            <Italic className="w-3 h-3" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Itálico</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 hover:bg-slate-200 text-amber-500"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => targetRef.current?.focus()}
          >
            <Smile className="w-3 h-3" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Use Win+. para Emojis</TooltipContent>
      </Tooltip>
    </div>
  )

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-600" />
            Conteúdo da Lista
          </CardTitle>
          <CardDescription>
            Defina o cabeçalho e rodapé da sua lista.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <Label>Cabeçalho</Label>
              <FormatToolbar targetRef={headerRef} field="header" />
            </div>
            <Textarea
              ref={headerRef}
              placeholder="Ex: 🔥 OFERTAS DO DIA 🔥"
              value={config.header}
              onChange={(e) => handleChange('header', e.target.value)}
              className="min-h-[80px]"
            />
          </div>
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <Label>Rodapé</Label>
              <FormatToolbar targetRef={footerRef} field="footer" />
            </div>
            <Textarea
              ref={footerRef}
              placeholder="Ex: Preços sujeitos a alteração..."
              value={config.footer}
              onChange={(e) => handleChange('footer', e.target.value)}
              className="min-h-[80px]"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <LinkIcon className="w-4 h-4 text-emerald-600" />
            Links e Contato
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Phone className="w-3 h-3" />
              Número WhatsApp (apenas números)
            </Label>
            <Input
              placeholder="5511999999999"
              value={config.contactNumber}
              onChange={(e) => handleChange('contactNumber', e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Gera link: https://wa.me/{config.contactNumber || 'seu-numero'}
            </p>
          </div>
          <div className="space-y-2">
            <Label>Link da Comunidade (Opcional)</Label>
            <Input
              placeholder="https://chat.whatsapp.com/..."
              value={config.communityLink}
              onChange={(e) => handleChange('communityLink', e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-4">
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm font-semibold">
              <DollarSign className="w-4 h-4 text-green-600" />
              Aumento Global (R$)
            </Label>
            <div className="flex gap-2">
              <Input
                type="number"
                min="0"
                step="10"
                value={config.markup}
                onChange={(e) => handleChange('markup', Number(e.target.value))}
                className="flex-1"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={handleApply}
                className="shrink-0"
                title="Aplicar este valor a todos os itens"
              >
                <Zap className="w-4 h-4 text-yellow-600" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Clique no raio para <strong>somar</strong> este valor ao preço{' '}
              <strong>atual</strong> de todos os itens da lista.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
