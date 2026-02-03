import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { WebcamCapture } from '@/components/common/WebcamCapture'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Camera, Loader2, Save, User } from 'lucide-react'
import { formatCPF, formatPhone, validateCPF } from '@/lib/utils'
import { useClientStore } from '@/stores/useClientStore'
import { Client } from '@/types'
import { toast } from 'sonner'
import { fetchAddressByCEP } from '@/services/cep'

interface ClientFormProps {
  initialData?: Partial<Client>
  onSubmit: (data: any) => Promise<boolean>
  onCancel: () => void
  isEditing?: boolean
}

export function ClientForm({
  initialData,
  onSubmit,
  onCancel,
  isEditing = false,
}: ClientFormProps) {
  const { uploadClientPhoto } = useClientStore()

  const [formData, setFormData] = useState({
    nome: initialData?.nome || '',
    cpf: initialData?.cpf || '',
    rg: initialData?.rg || '',
    data_nascimento: initialData?.data_nascimento || '',
    email: initialData?.email || '',
    telefone: initialData?.telefone || '',
    genero: initialData?.genero || '',
    origem: initialData?.origem || '',
    cep: initialData?.cep || '',
    rua: initialData?.rua || '',
    numero: initialData?.numero || '',
    complemento: initialData?.complemento || '',
    bairro: initialData?.bairro || '',
    municipio: initialData?.municipio || '',
    estado: initialData?.estado || '',
    nome_contato_emergencia: initialData?.nome_contato_emergencia || '',
    telefone_contato_emergencia: initialData?.telefone_contato_emergencia || '',
    observacoes: initialData?.observacoes || '',
    url_foto: initialData?.url_foto || '',
  })

  const [showCamera, setShowCamera] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false)
  const [loadingCep, setLoadingCep] = useState(false)

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleCepBlur = async () => {
    // Only search if CEP has 8 digits (excluding mask)
    const cleanCep = formData.cep.replace(/\D/g, '')
    if (cleanCep.length !== 8) return

    setLoadingCep(true)
    const address = await fetchAddressByCEP(cleanCep)
    setLoadingCep(false)

    if (address) {
      setFormData((prev) => ({
        ...prev,
        rua: address.logradouro || prev.rua,
        bairro: address.bairro || prev.bairro,
        municipio: address.localidade || prev.municipio,
        estado: address.uf || prev.estado,
        complemento: address.complemento || prev.complemento,
      }))
      toast.success('Endereço encontrado!')
    } else {
      toast.error('CEP não encontrado')
    }
  }

  const handlePhotoCapture = async (file: File) => {
    setShowCamera(false)
    setIsUploadingPhoto(true)

    const result = await uploadClientPhoto(file)

    setIsUploadingPhoto(false)
    if (result.success && result.url) {
      setFormData((prev) => ({ ...prev, url_foto: result.url! }))
      toast.success('Foto capturada com sucesso!')
    } else {
      toast.error('Erro ao salvar foto.')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateCPF(formData.cpf)) {
      toast.error('CPF inválido')
      return
    }

    if (!formData.nome || !formData.telefone || !formData.cpf) {
      toast.error('Preencha os campos obrigatórios (*)')
      return
    }

    setIsSubmitting(true)
    const success = await onSubmit(formData)
    setIsSubmitting(false)

    if (success) {
      toast.success(
        isEditing
          ? 'Dados do cliente atualizados!'
          : 'Cliente cadastrado com sucesso!',
      )
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in">
      <div className="flex flex-col items-center gap-4 pb-4 border-b">
        {showCamera ? (
          <WebcamCapture
            onCapture={handlePhotoCapture}
            onCancel={() => setShowCamera(false)}
            className="w-full max-w-md shadow-lg"
          />
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div className="relative group">
              <Avatar className="w-32 h-32 border-4 border-white shadow-md">
                <AvatarImage
                  src={formData.url_foto || undefined}
                  className="object-cover"
                />
                <AvatarFallback className="bg-gray-100 text-4xl">
                  {formData.nome ? (
                    formData.nome[0].toUpperCase()
                  ) : (
                    <User className="w-12 h-12 text-gray-300" />
                  )}
                </AvatarFallback>
              </Avatar>
              <Button
                type="button"
                size="icon"
                variant="secondary"
                className="absolute bottom-0 right-0 rounded-full shadow-md"
                onClick={() => setShowCamera(true)}
                disabled={isUploadingPhoto}
              >
                {isUploadingPhoto ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Camera className="w-4 h-4" />
                )}
              </Button>
            </div>
            <span className="text-sm text-muted-foreground">
              Clique na câmera para adicionar foto
            </span>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold text-lg flex items-center gap-2 text-primary border-b pb-2">
          <User className="w-5 h-5" /> Dados Pessoais
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome Completo *</Label>
            <Input
              id="nome"
              value={formData.nome}
              onChange={(e) => handleChange('nome', e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cpf">CPF *</Label>
            <Input
              id="cpf"
              value={formData.cpf}
              onChange={(e) => handleChange('cpf', formatCPF(e.target.value))}
              maxLength={14}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="rg">RG</Label>
            <Input
              id="rg"
              value={formData.rg}
              onChange={(e) => handleChange('rg', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="data_nascimento">Data de Nascimento</Label>
            <Input
              id="data_nascimento"
              type="date"
              value={formData.data_nascimento}
              onChange={(e) => handleChange('data_nascimento', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="genero">Gênero</Label>
            <Select
              value={formData.genero}
              onValueChange={(v) => handleChange('genero', v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Masculino">Masculino</SelectItem>
                <SelectItem value="Feminino">Feminino</SelectItem>
                <SelectItem value="Outro">Outro</SelectItem>
                <SelectItem value="NaoInformado">
                  Prefiro não informar
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="origem">Origem do Cliente</Label>
            <Select
              value={formData.origem}
              onValueChange={(v) => handleChange('origem', v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Como nos conheceu?" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Instagram">Instagram</SelectItem>
                <SelectItem value="Facebook">Facebook</SelectItem>
                <SelectItem value="Google">Google</SelectItem>
                <SelectItem value="Indicacao">Indicação</SelectItem>
                <SelectItem value="Passante">Passante</SelectItem>
                <SelectItem value="Outro">Outro</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="telefone">Telefone / WhatsApp *</Label>
            <Input
              id="telefone"
              value={formData.telefone}
              onChange={(e) =>
                handleChange('telefone', formatPhone(e.target.value))
              }
              maxLength={15}
              required
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold text-lg text-primary border-b pb-2">
          Endereço
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2 relative">
            <Label htmlFor="cep">CEP</Label>
            <div className="relative">
              <Input
                id="cep"
                value={formData.cep}
                onChange={(e) => handleChange('cep', e.target.value)}
                onBlur={handleCepBlur}
                placeholder="00000-000"
                className="pr-8"
              />
              {loadingCep && (
                <Loader2 className="w-4 h-4 absolute right-2 top-3 animate-spin text-muted-foreground" />
              )}
            </div>
            <p className="text-[10px] text-muted-foreground">
              Digite para buscar automaticamente
            </p>
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="rua">Rua / Avenida</Label>
            <Input
              id="rua"
              value={formData.rua}
              onChange={(e) => handleChange('rua', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="numero">Número</Label>
            <Input
              id="numero"
              value={formData.numero}
              onChange={(e) => handleChange('numero', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="complemento">Complemento</Label>
            <Input
              id="complemento"
              value={formData.complemento}
              onChange={(e) => handleChange('complemento', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bairro">Bairro</Label>
            <Input
              id="bairro"
              value={formData.bairro}
              onChange={(e) => handleChange('bairro', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="municipio">Cidade</Label>
            <Input
              id="municipio"
              value={formData.municipio}
              onChange={(e) => handleChange('municipio', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="estado">Estado (UF)</Label>
            <Input
              id="estado"
              value={formData.estado}
              onChange={(e) => handleChange('estado', e.target.value)}
              maxLength={2}
              placeholder="UF"
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold text-lg text-primary border-b pb-2">
          Outras Informações
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="nome_contato_emergencia">
              Contato de Emergência
            </Label>
            <Input
              id="nome_contato_emergencia"
              value={formData.nome_contato_emergencia}
              onChange={(e) =>
                handleChange('nome_contato_emergencia', e.target.value)
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="telefone_contato_emergencia">Tel. Emergência</Label>
            <Input
              id="telefone_contato_emergencia"
              value={formData.telefone_contato_emergencia}
              onChange={(e) =>
                handleChange(
                  'telefone_contato_emergencia',
                  formatPhone(e.target.value),
                )
              }
              maxLength={15}
            />
          </div>
          <div className="col-span-1 md:col-span-2 space-y-2">
            <Label htmlFor="observacoes">Observações Internas</Label>
            <Textarea
              id="observacoes"
              value={formData.observacoes}
              onChange={(e) => handleChange('observacoes', e.target.value)}
              placeholder="Notas sobre o cliente..."
              className="h-24"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-emerald-600 hover:bg-emerald-700"
        >
          {isSubmitting ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          {isEditing ? 'Atualizar Cliente' : 'Cadastrar Cliente'}
        </Button>
      </div>
    </form>
  )
}
