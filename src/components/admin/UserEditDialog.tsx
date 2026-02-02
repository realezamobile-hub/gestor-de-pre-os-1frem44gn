import { useState, useEffect, useRef } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Role, User, UserStatus, Company } from '@/types'
import { useAuthStore } from '@/stores/useAuthStore'
import { toast } from 'sonner'
import { Loader2, Camera, Upload } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AvatarSelection } from '@/components/common/AvatarSelection'
import { ImageCropper } from '@/components/common/ImageCropper'

interface UserEditDialogProps {
  user: User | null
  open: boolean
  onOpenChange: (open: boolean) => void
  companies?: Company[]
  isSuperAdmin?: boolean
}

export function UserEditDialog({
  user,
  open,
  onOpenChange,
  companies = [],
  isSuperAdmin = false,
}: UserEditDialogProps) {
  const { adminUpdateUser, adminUploadAvatar } = useAuthStore()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<Partial<User>>({})
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [cropImage, setCropImage] = useState<string | null>(null)
  const [showCropModal, setShowCropModal] = useState(false)
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
      })
      setAvatarFile(null)
      setCropImage(null)
    }
  }, [user, open])

  const handleChange = (key: keyof User, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }))
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
    // Clear preset if custom file is set (just preview for now)
    // Actual url clear happens on save if we want, but upload happens separately usually?
    // In admin dialog, let's keep it simple: upload sets avatarUrl
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
      // 1. Upload Avatar if changed via file
      if (avatarFile) {
        const uploadResult = await adminUploadAvatar(user.id, avatarFile)
        if (!uploadResult.success) {
          toast.error('Erro ao atualizar foto, mas salvando dados...')
        }
        // Note: adminUploadAvatar already updates the profile in DB
      }

      // 2. Update User Data (including avatarUrl if preset selected)
      const result = await adminUpdateUser(user.id, formData)

      if (result.success) {
        toast.success('Usuário atualizado com sucesso')
        onOpenChange(false)
      } else {
        toast.error('Erro ao atualizar usuário')
      }
    } catch (error) {
      console.error('Error updating user:', error)
      toast.error('Erro ao atualizar usuário')
    } finally {
      setIsLoading(false)
    }
  }

  if (!user) return null

  const displayAvatar = avatarFile
    ? URL.createObjectURL(avatarFile)
    : formData.avatarUrl

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
              <TabsTrigger value="permissions">Permissões</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-6 pt-4">
              {/* Avatar Section */}
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
                  <div className="flex flex-col gap-2 w-full">
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

            <TabsContent value="permissions" className="space-y-4 pt-4">
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

              <div className="grid gap-4 mt-4">
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
                          'text-base',
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
            </TabsContent>
          </Tabs>

          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
