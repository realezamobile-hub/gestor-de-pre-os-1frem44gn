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
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (user && open) {
      setFormData({
        name: user.name,
        phone: user.phone,
        role: user.role,
        status: user.status,
        companyId: user.companyId,
        canCreateList: user.canCreateList,
        canAccessEvaluation: user.canAccessEvaluation,
        canDeleteRecords: user.canDeleteRecords,
        canViewAllLists: user.canViewAllLists,
      })
      setAvatarPreview(user.avatarUrl || null)
      setAvatarFile(null)
    }
  }, [user, open])

  const handleChange = (key: keyof User, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        toast.error('Formato não suportado. Use JPG, PNG ou WebP.')
        return
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('A imagem deve ter no máximo 5MB')
        return
      }
      setAvatarFile(file)
      const objectUrl = URL.createObjectURL(file)
      setAvatarPreview(objectUrl)
    }
  }

  const handleSave = async () => {
    if (!user) return

    setIsLoading(true)
    try {
      // 1. Upload Avatar if changed
      if (avatarFile) {
        const uploadResult = await adminUploadAvatar(user.id, avatarFile)
        if (!uploadResult.success) {
          toast.error('Erro ao atualizar foto de perfil, mas salvando dados...')
          console.error('Avatar error:', uploadResult.error)
        }
      }

      // 2. Update User Data
      const result = await adminUpdateUser(user.id, formData)
      if (result.success) {
        toast.success('Usuário atualizado com sucesso')
        onOpenChange(false)
      } else {
        toast.error(
          'Erro ao atualizar usuário: ' +
            (result.error?.message || 'Erro desconhecido'),
        )
      }
    } catch (error) {
      console.error('Error updating user:', error)
      toast.error('Erro ao atualizar usuário')
    } finally {
      setIsLoading(false)
    }
  }

  if (!user) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Usuário</DialogTitle>
          <DialogDescription>
            Atualize as informações, foto e permissões do usuário.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {/* Avatar Section */}
          <div className="flex flex-col items-center gap-2">
            <div
              className="relative cursor-pointer group"
              onClick={() => fileInputRef.current?.click()}
            >
              <Avatar className="h-20 w-20 border-2 border-muted">
                <AvatarImage
                  src={
                    avatarPreview ||
                    `https://img.usecurling.com/ppl/medium?seed=${user.id}`
                  }
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
              variant="ghost"
              size="sm"
              className="text-xs h-7"
              onClick={() => fileInputRef.current?.click()}
            >
              <Camera className="w-3 h-3 mr-1.5" />
              Alterar Foto
            </Button>
            <Input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/png, image/jpeg, image/webp"
              onChange={handleFileChange}
            />
          </div>

          {/* Read-only info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-muted-foreground">ID do Usuário</Label>
              <Input
                value={user.id}
                disabled
                className="bg-muted font-mono text-xs"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground">E-mail</Label>
              <Input value={user.email} disabled className="bg-muted" />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-medium text-sm border-b pb-2">
              Informações Básicas
            </h3>
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
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  value={formData.phone || ''}
                  onChange={(e) => handleChange('phone', e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="role">Função</Label>
                <Select
                  value={formData.role}
                  onValueChange={(val: Role) => handleChange('role', val)}
                >
                  <SelectTrigger id="role">
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ADMIN">Admin (Gestor)</SelectItem>
                    <SelectItem value="VENDEDOR">Vendedor</SelectItem>
                    <SelectItem value="TECNICO">Técnico</SelectItem>
                    <SelectItem value="ADMINISTRATIVO">
                      Administrativo
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status da Conta</Label>
                <Select
                  value={formData.status}
                  onValueChange={(val: UserStatus) =>
                    handleChange('status', val)
                  }
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Ativo</SelectItem>
                    <SelectItem value="pending">Pendente</SelectItem>
                    <SelectItem value="blocked">Bloqueado</SelectItem>
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
                    <SelectValue placeholder="Selecione a empresa..." />
                  </SelectTrigger>
                  <SelectContent>
                    {companies.map((company) => (
                      <SelectItem key={company.id} value={company.id}>
                        {company.nome_fantasia}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <h3 className="font-medium text-sm border-b pb-2">
              Permissões de Acesso
            </h3>
            <div className="grid gap-4">
              <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                <div className="space-y-0.5">
                  <Label htmlFor="perm-list" className="text-base">
                    Criar Listas
                  </Label>
                  <div className="text-xs text-muted-foreground">
                    Permite gerar listas de preços e catálogos PDF.
                  </div>
                </div>
                <Switch
                  id="perm-list"
                  checked={formData.canCreateList || false}
                  onCheckedChange={(checked) =>
                    handleChange('canCreateList', checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                <div className="space-y-0.5">
                  <Label htmlFor="perm-eval" className="text-base">
                    Avaliação Técnica
                  </Label>
                  <div className="text-xs text-muted-foreground">
                    Acesso ao módulo de checklist e avaliação de aparelhos.
                  </div>
                </div>
                <Switch
                  id="perm-eval"
                  checked={formData.canAccessEvaluation || false}
                  onCheckedChange={(checked) =>
                    handleChange('canAccessEvaluation', checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                <div className="space-y-0.5">
                  <Label htmlFor="perm-view-all" className="text-base">
                    Ver Histórico Completo
                  </Label>
                  <div className="text-xs text-muted-foreground">
                    Permite visualizar listas geradas por outros usuários da
                    empresa.
                  </div>
                </div>
                <Switch
                  id="perm-view-all"
                  checked={formData.canViewAllLists || false}
                  onCheckedChange={(checked) =>
                    handleChange('canViewAllLists', checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm border-red-100 bg-red-50/10">
                <div className="space-y-0.5">
                  <Label
                    htmlFor="perm-delete"
                    className="text-base text-red-900"
                  >
                    Deletar Registros
                  </Label>
                  <div className="text-xs text-red-700/70">
                    Permite excluir produtos e dados históricos. Cuidado!
                  </div>
                </div>
                <Switch
                  id="perm-delete"
                  checked={formData.canDeleteRecords || false}
                  onCheckedChange={(checked) =>
                    handleChange('canDeleteRecords', checked)
                  }
                  className="data-[state=checked]:bg-red-600"
                />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
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
  )
}
