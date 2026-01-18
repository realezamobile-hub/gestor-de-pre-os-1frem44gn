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
import { DollarSign, FileText, Link as LinkIcon, Phone } from 'lucide-react'
import { GeneratorConfigData } from '@/types'

interface GeneratorConfigProps {
  config: GeneratorConfigData
  onChange: (config: GeneratorConfigData) => void
}

export function GeneratorConfig({ config, onChange }: GeneratorConfigProps) {
  const handleChange = (field: keyof GeneratorConfigData, value: any) => {
    onChange({ ...config, [field]: value })
  }

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
          <div className="space-y-2">
            <Label>Cabeçalho</Label>
            <Textarea
              placeholder="Ex: 🔥 OFERTAS DO DIA 🔥"
              value={config.header}
              onChange={(e) => handleChange('header', e.target.value)}
              className="min-h-[80px]"
            />
          </div>
          <div className="space-y-2">
            <Label>Rodapé</Label>
            <Textarea
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
            <Input
              type="number"
              min="0"
              step="10"
              value={config.markup}
              onChange={(e) => handleChange('markup', Number(e.target.value))}
            />
            <p className="text-xs text-muted-foreground">
              Valor adicionado a TODOS os itens da lista pública.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
