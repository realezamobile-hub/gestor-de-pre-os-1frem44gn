import { useState, useEffect, useRef } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Role,
  User,
  UserStatus,
  Company,
  SubscriptionStatus,
  SubscriptionType,
} from '@/types'
import { useAuthStore } from '@/stores/useAuthStore'
import { toast } from 'sonner'
import { Loader2, Camera, Upload, Trash2, RefreshCw } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AvatarSelection } from '@/components/common/AvatarSelection'
import { ImageCropper } from '@/components/common/ImageCropper'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface UserEditDialogProps {
  user: User | null
  open: boolean
  onOpenChange: (open: boolean) => void
  companies?: Company[]
  isSuperAdmin?: boolean
}

const ALL_MODULES = [
  { key: 'melhor_preco', label: 'Melhor Preço' },
  { key: 'leads', label: 'Leads' },
  { key: 'generator', label: 'Gerador de Lista' },
  { key: 'evaluation', label: 'Avaliação Técnica' },
  { key: 'cadastro', label: 'Cadastro' },
  { key: 'reports', label: 'Relatórios' },
  { key: 'admin', label: 'Configurações' },
]

export function UserEditDialog({
  user,
  open,
  onOpenChange,
  companies = [],
  isSuperAdmin = false,
}: UserEditDialogProps) {
  const { adminUpdateUser, adminUploadAvatar, deleteUser, renewUser } =
    useAuthStore()
  const [isLoading, setIsLoading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isRenewing, setIsRenewing] = useState(false)
  const [formData, setFormData] = useState<Partial<User>>({})
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [cropImage, setCropImage] = useState<string | null>(null)
  const [showCropModal, setShowCropModal] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (user && open) {
      setFormData({
        name: user.name,
        phone: user.phone,
        role: user.role,
        status: user.status,
        companyId: user.companyId,
        address: user.address,
        rg: user.rg,
        cpf: user.cpf,
        emergencyContactName: user.emergencyContactName,
        emergencyContactPhone: user.emergencyContactPhone,
        avatarUrl: user.avatarUrl,
        canCreateList: user.canCreateList,
        canAccessEvaluation: user.canAccessEvaluation,
        canDeleteRecords: user.canDeleteRecords,
        canViewAllLists: user.canViewAllLists,
        subscriptionStatus: user.subscriptionStatus,
        accessAllowed: user.accessAllowed,
        accessExpiresAt: user.accessExpiresAt,
        subscriptionType: user.subscriptionType,
        monthlyFee: user.monthlyFee,
        nextBillingDate: user.nextBillingDate,
        activeModules: user.activeModules || ['melhor_preco'],
      })
      setAvatarFile(null)
      setCropImage(null)
    }
  }, [user, open])

  const handleChange = (key: keyof User, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }))
  }

  const toggleModule = (moduleKey: string) => {
    const current = formData.activeModules || []
    const updated = current.includes(moduleKey)
      ? current.filter((m) => m !== moduleKey)
      : [...current, moduleKey]
    handleChange('activeModules', updated)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        toast.error('Formato não suportado')
        return
      }
      const reader = new FileReader()
      reader.onload = () => {
        setCropImage(reader.result as string)
        setShowCropModal(true)
      }
      reader.readAsDataURL(file)
      e.target.value = ''
    }
  }

  const handleCropComplete = (blob: Blob) => {
    const file = new File([blob], 'avatar.jpg', { type: 'image/jpeg' })
    setAvatarFile(file)
    setShowCropModal(false)
    setCropImage(null)
  }

  const handlePresetSelect = (url: string) => {
    handleChange('avatarUrl', url)
    setAvatarFile(null)
  }

  const handleSave = async () => {
    if (!user) return
    setIsLoading(true)
    try {
      const updatedFormData = { ...formData }
      if (avatarFile) {
        const uploadResult = await adminUploadAvatar(user.id, avatarFile)
        if (!uploadResult.success) {
          toast.error('Erro ao atualizar foto, mas salvando dados...')
        } else if (uploadResult.url) {
          updatedFormData.avatarUrl = uploadResult.url
        }
      }
      const result = await adminUpdateUser(user.id, updatedFormData)
      if (result.success) {
        toast.success('Usuário atualizado com sucesso')
        onOpenChange(false)
      } else {
        toast.error('Erro ao atualizar usuário')
      }
    } catch (error) {
      toast.error('Erro ao atualizar usuário')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRenew = async () => {
    if (!user) return
    setIsRenewing(true)
    try {
      const result = await renewUser(user.id)
      if (result.success) {
        toast.success('Renovação OK! Acesso estendido.')
      } else {
        toast.error('Erro ao renovar acesso')
      }
    } catch {
      toast.error('Erro inesperado ao renovar')
    } finally {
      setIsRenewing(false)
    }
  }

  const handleDelete = async () => {
    if (!user) return
    setIsDeleting(true)
    try {
      const result = await deleteUser(user.id)
      if (result.success) {
        toast.success('Usuário excluído com sucesso')
        setShowDeleteDialog(false)
        onOpenChange(false)
      } else {
        toast.error(result.error?.message || 'Erro ao excluir usuário.')
      }
    } catch (error: any) {
      toast.error(error?.message || 'Erro inesperado ao excluir usuário')
    } finally {
      setIsDeleting(false)
    }
  }

  if (!user) return null

  const displayAvatar = avatarFile
    ? URL.createObjectURL(avatarFile)
    : formData.avatarUrl
  const daysRemaining = formData.nextBillingDate
    ? Math.ceil(
        (new Date(formData.nextBillingDate).getTime() - Date.now()) /
          (1000 * 60 * 60 * 24),
      )
    : null

  return (
    <>
      <Dialog open={showCropModal} onOpenChange={setShowCropModal}>
        <DialogContent className="sm:max-w-md">
          {cropImage && (
            <ImageCropper
              imageSrc={cropImage}
              onCropComplete={handleCropComplete}
              onCancel={() => setShowCropModal(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Usuário</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o usuário{' '}
              <strong>{user.name}</strong>? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              Cancelar
            </AlertDialogCancel>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Excluir Definitivamente
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Usuário: {user.name}</DialogTitle>
            <DialogDescription>
              Gerencie todas as informações do perfil do usuário.
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="w-full justify-start overflow-x-auto">
              <TabsTrigger value="basic">Básico & Foto</TabsTrigger>
              <TabsTrigger value="docs">Documentos</TabsTrigger>
              <TabsTrigger value="subscription">
                Assinatura & Acesso
              </TabsTrigger>
              <TabsTrigger value="modules">Módulos</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-6 pt-4">
              <div className="flex flex-col sm:flex-row gap-6 items-start border-b pb-6">
                <div className="flex flex-col items-center gap-3">
                  <div
                    className="relative cursor-pointer group"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Avatar className="h-24 w-24 border-2 border-muted">
                      <AvatarImage
                        src={displayAvatar || undefined}
                        className="object-cover"
                      />
                      <AvatarFallback className="text-xl">
                        {user.name[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Upload className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs w-full"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Camera className="w-3 h-3 mr-1.5" />
                    Upload
                  </Button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/png, image/jpeg, image/webp"
                    onChange={handleFileChange}
                  />
                </div>
                <div className="flex-1 space-y-4 w-full">
                  <Label>Avatar Predefinido</Label>
                  <AvatarSelection
                    selectedAvatar={formData.avatarUrl}
                    onSelect={handlePresetSelect}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome Completo</Label>
                  <Input
                    id="name"
                    value={formData.name || ''}
                    onChange={(e) => handleChange('name', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email (Apenas Leitura)</Label>
                  <Input value={user.email} disabled className="bg-muted" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    value={formData.phone || ''}
                    onChange={(e) => handleChange('phone', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Função</Label>
                  <Select
                    value={formData.role}
                    onValueChange={(val: Role) => handleChange('role', val)}
                  >
                    <SelectTrigger id="role">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ADMIN">Admin</SelectItem>
                      <SelectItem value="VENDEDOR">Vendedor</SelectItem>
                      <SelectItem value="TECNICO">Técnico</SelectItem>
                      <SelectItem value="ADMINISTRATIVO">
                        Admin. (Escritório)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {isSuperAdmin && companies.length > 0 && (
                <div className="space-y-2">
                  <Label htmlFor="company">Empresa</Label>
                  <Select
                    value={formData.companyId || ''}
                    onValueChange={(val) => handleChange('companyId', val)}
                  >
                    <SelectTrigger id="company">
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      {companies.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.nome_fantasia}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </TabsContent>

            <TabsContent value="docs" className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="address">Endereço</Label>
                <Input
                  id="address"
                  value={formData.address || ''}
                  onChange={(e) => handleChange('address', e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="rg">RG</Label>
                  <Input
                    id="rg"
                    value={formData.rg || ''}
                    onChange={(e) => handleChange('rg', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cpf">CPF</Label>
                  <Input
                    id="cpf"
                    value={formData.cpf || ''}
                    onChange={(e) => handleChange('cpf', e.target.value)}
                  />
                </div>
              </div>
              <div className="border-t pt-4 mt-2">
                <h3 className="text-sm font-medium mb-3">
                  Contato de Emergência
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="ecName">Nome</Label>
                    <Input
                      id="ecName"
                      value={formData.emergencyContactName || ''}
                      onChange={(e) =>
                        handleChange('emergencyContactName', e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ecPhone">Telefone</Label>
                    <Input
                      id="ecPhone"
                      value={formData.emergencyContactPhone || ''}
                      onChange={(e) =>
                        handleChange('emergencyContactPhone', e.target.value)
                      }
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="subscription" className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="subscriptionType">Tipo de Assinatura</Label>
                  <Select
                    value={formData.subscriptionType || 'trial'}
                    onValueChange={(val: SubscriptionType) =>
                      handleChange('subscriptionType', val)
                    }
                  >
                    <SelectTrigger id="subscriptionType">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="trial">Trial (10 dias)</SelectItem>
                      <SelectItem value="monthly">Mensal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subscriptionStatus">
                    Status da Assinatura
                  </Label>
                  <Select
                    value={formData.subscriptionStatus || 'pending'}
                    onValueChange={(val: SubscriptionStatus) =>
                      handleChange('subscriptionStatus', val)
                    }
                  >
                    <SelectTrigger id="subscriptionStatus">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">
                        Aguardando Pagamento
                      </SelectItem>
                      <SelectItem value="active">Ativo</SelectItem>
                      <SelectItem value="expired">Expirado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {formData.subscriptionType === 'monthly' && (
                <div className="space-y-2">
                  <Label htmlFor="monthlyFee">Mensalidade (R$)</Label>
                  <Input
                    id="monthlyFee"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.monthlyFee ?? ''}
                    onChange={(e) =>
                      handleChange(
                        'monthlyFee',
                        e.target.value ? Number(e.target.value) : null,
                      )
                    }
                  />
                </div>
              )}

              <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                <div className="space-y-0.5">
                  <Label htmlFor="accessAllowed" className="text-base">
                    Acesso Liberado
                  </Label>
                  <div className="text-xs text-muted-foreground">
                    Permite que o usuário acesse o sistema
                  </div>
                </div>
                <Switch
                  id="accessAllowed"
                  checked={!!formData.accessAllowed}
                  onCheckedChange={(checked) =>
                    handleChange('accessAllowed', checked)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="accessExpiresAt">Expira em</Label>
                <Input
                  id="accessExpiresAt"
                  type="date"
                  value={
                    formData.accessExpiresAt
                      ? new Date(formData.accessExpiresAt)
                          .toISOString()
                          .split('T')[0]
                      : ''
                  }
                  onChange={(e) =>
                    handleChange(
                      'accessExpiresAt',
                      e.target.value
                        ? new Date(e.target.value).toISOString()
                        : null,
                    )
                  }
                />
              </div>

              {formData.nextBillingDate && (
                <div className="bg-blue-50 p-3 rounded-lg flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-900">
                      Próxima Cobrança
                    </p>
                    <p className="text-xs text-blue-700">
                      {format(
                        new Date(formData.nextBillingDate),
                        "dd 'de' MMMM 'de' yyyy",
                        { locale: ptBR },
                      )}
                      {daysRemaining !== null &&
                        ` • ${daysRemaining > 0 ? `${daysRemaining} dia(s) restante(s)` : 'Expirado'}`}
                    </p>
                  </div>
                  {formData.subscriptionType === 'monthly' && (
                    <Button
                      size="sm"
                      variant="default"
                      onClick={handleRenew}
                      disabled={isRenewing}
                    >
                      {isRenewing ? (
                        <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                      ) : (
                        <RefreshCw className="w-3 h-3 mr-1" />
                      )}
                      Renovação OK
                    </Button>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="status">Status da Conta</Label>
                <Select
                  value={formData.status}
                  onValueChange={(val: UserStatus) =>
                    handleChange('status', val)
                  }
                >
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Ativo</SelectItem>
                    <SelectItem value="pending">Pendente</SelectItem>
                    <SelectItem value="blocked">Bloqueado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>

            <TabsContent value="modules" className="space-y-4 pt-4">
              <div>
                <h3 className="text-sm font-medium mb-1">Módulos do Sistema</h3>
                <p className="text-xs text-muted-foreground mb-4">
                  Selecione quais módulos este usuário pode acessar.
                </p>
                <div className="grid gap-3">
                  {ALL_MODULES.map((mod) => (
                    <div
                      key={mod.key}
                      className="flex items-center justify-between rounded-lg border p-3 shadow-sm"
                    >
                      <div className="flex items-center gap-3">
                        <Checkbox
                          id={`mod-${mod.key}`}
                          checked={
                            formData.activeModules?.includes(mod.key) ?? false
                          }
                          onCheckedChange={() => toggleModule(mod.key)}
                        />
                        <Label
                          htmlFor={`mod-${mod.key}`}
                          className="text-sm font-medium cursor-pointer"
                        >
                          {mod.label}
                        </Label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="text-sm font-medium mb-3">
                  Permissões Avançadas
                </h3>
                <div className="grid gap-3">
                  {[
                    {
                      key: 'canCreateList',
                      label: 'Criar Listas',
                      desc: 'Gerar catálogos e listas',
                    },
                    {
                      key: 'canAccessEvaluation',
                      label: 'Avaliação Técnica',
                      desc: 'Acesso ao checklist',
                    },
                    {
                      key: 'canViewAllLists',
                      label: 'Ver Histórico Global',
                      desc: 'Ver listas de outros',
                    },
                    {
                      key: 'canDeleteRecords',
                      label: 'Deletar Registros',
                      desc: 'Excluir dados (Perigoso)',
                      danger: true,
                    },
                  ].map((perm) => (
                    <div
                      key={perm.key}
                      className={cn(
                        'flex items-center justify-between rounded-lg border p-3 shadow-sm',
                        perm.danger && 'border-red-100 bg-red-50/20',
                      )}
                    >
                      <div className="space-y-0.5">
                        <Label
                          htmlFor={`perm-${perm.key}`}
                          className={cn(
                            'text-sm font-medium',
                            perm.danger && 'text-red-900',
                          )}
                        >
                          {perm.label}
                        </Label>
                        <div className="text-xs text-muted-foreground">
                          {perm.desc}
                        </div>
                      </div>
                      <Switch
                        id={`perm-${perm.key}`}
                        checked={!!formData[perm.key as keyof User]}
                        onCheckedChange={(checked) =>
                          handleChange(perm.key as keyof User, checked)
                        }
                        className={
                          perm.danger ? 'data-[state=checked]:bg-red-600' : ''
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex flex-col-reverse sm:flex-row sm:justify-between sm:items-center gap-4 mt-6">
            <Button
              type="button"
              variant="destructive"
              onClick={() => setShowDeleteDialog(true)}
              className="w-full sm:w-auto"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Excluir Usuário
            </Button>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="w-full sm:w-auto"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSave}
                disabled={isLoading}
                className="w-full sm:w-auto"
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Salvar Alterações
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
