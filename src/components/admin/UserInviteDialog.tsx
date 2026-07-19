import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Role, Company, SubscriptionType } from '@/types'
import { useAuthStore } from '@/stores/useAuthStore'
import { toast } from 'sonner'
import { Loader2, UserPlus } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'

const ALL_MODULES = [
  { key: 'melhor_preco', label: 'Melhor Preço' },
  { key: 'leads', label: 'Leads' },
  { key: 'generator', label: 'Gerador de Lista' },
  { key: 'evaluation', label: 'Avaliação Técnica' },
  { key: 'cadastro', label: 'Cadastro' },
  { key: 'reports', label: 'Relatórios' },
  { key: 'admin', label: 'Configurações' },
]

interface UserInviteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  companies?: Company[]
  isSuperAdmin?: boolean
  currentCompanyId?: string
}

export function UserInviteDialog({
  open,
  onOpenChange,
  companies = [],
  isSuperAdmin = false,
  currentCompanyId,
}: UserInviteDialogProps) {
  const { inviteUser } = useAuthStore()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'VENDEDOR' as Role,
    companyId: currentCompanyId || '',
    subscriptionType: 'trial' as SubscriptionType,
    monthlyFee: '',
    activeModules: ['melhor_preco'] as string[],
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.email || !formData.password) {
      toast.error('Preencha todos os campos obrigatórios')
      return
    }
    if (formData.password.length < 6) {
      toast.error('A senha deve ter no mínimo 6 caracteres')
      return
    }
    if (formData.subscriptionType === 'monthly' && !formData.monthlyFee) {
      toast.error('Informe o valor da mensalidade')
      return
    }

    setIsLoading(true)
    try {
      const result = await inviteUser({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        companyId: formData.companyId || undefined,
        subscriptionType: formData.subscriptionType,
        monthlyFee:
          formData.subscriptionType === 'monthly'
            ? Number(formData.monthlyFee)
            : undefined,
        activeModules: formData.activeModules,
      })
      if (result.success) {
        toast.success('Usuário criado com sucesso!')
        setFormData({
          name: '',
          email: '',
          password: '',
          role: 'VENDEDOR',
          companyId: currentCompanyId || '',
          subscriptionType: 'trial',
          monthlyFee: '',
          activeModules: ['melhor_preco'],
        })
        onOpenChange(false)
      } else {
        toast.error(result.error?.message || 'Erro ao criar usuário')
      }
    } catch (error: any) {
      toast.error(error?.message || 'Erro inesperado ao criar usuário')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Criar Novo Usuário</DialogTitle>
          <DialogDescription>
            Crie um novo usuário no sistema. As credenciais serão gerenciadas
            pelo administrador.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="name">
              Nome Completo <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              placeholder="Ex: João da Silva"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">
              Email <span className="text-red-500">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="Ex: joao@exemplo.com"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">
              Senha <span className="text-red-500">*</span>
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="Mínimo 6 caracteres"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">Função</Label>
            <Select
              value={formData.role}
              onValueChange={(val: Role) =>
                setFormData({ ...formData, role: val })
              }
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

          <div className="space-y-2">
            <Label htmlFor="subscriptionType">Tipo de Assinatura</Label>
            <Select
              value={formData.subscriptionType}
              onValueChange={(val: SubscriptionType) =>
                setFormData({ ...formData, subscriptionType: val })
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

          {formData.subscriptionType === 'monthly' && (
            <div className="space-y-2">
              <Label htmlFor="monthlyFee">
                Mensalidade (R$) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="monthlyFee"
                type="number"
                step="0.01"
                min="0"
                placeholder="Ex: 99.90"
                value={formData.monthlyFee}
                onChange={(e) =>
                  setFormData({ ...formData, monthlyFee: e.target.value })
                }
                required
              />
            </div>
          )}

          {isSuperAdmin && companies.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="company">Empresa</Label>
              <Select
                value={formData.companyId}
                onValueChange={(val) =>
                  setFormData({ ...formData, companyId: val })
                }
              >
                <SelectTrigger id="company">
                  <SelectValue placeholder="Selecione a empresa..." />
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

          <div className="space-y-2">
            <Label>Módulos de Acesso</Label>
            <p className="text-xs text-muted-foreground">
              Selecione os módulos que o usuário poderá acessar.
            </p>
            <div className="grid grid-cols-2 gap-2 pt-1">
              {ALL_MODULES.map((mod) => (
                <div key={mod.key} className="flex items-center gap-2">
                  <Checkbox
                    id={`invite-mod-${mod.key}`}
                    checked={formData.activeModules.includes(mod.key)}
                    onCheckedChange={() => {
                      const current = formData.activeModules
                      const updated = current.includes(mod.key)
                        ? current.filter((m) => m !== mod.key)
                        : [...current, mod.key]
                      setFormData({ ...formData, activeModules: updated })
                    }}
                  />
                  <Label
                    htmlFor={`invite-mod-${mod.key}`}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {mod.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <UserPlus className="w-4 h-4 mr-2" />
              )}
              Criar Usuário
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
