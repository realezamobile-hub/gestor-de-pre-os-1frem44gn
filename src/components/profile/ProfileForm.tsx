import { useState } from 'react'
import { useAuthStore } from '@/stores/useAuthStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Loader2, Save } from 'lucide-react'

export function ProfileForm() {
  const { currentUser, updateProfile } = useAuthStore()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    phone: currentUser?.phone || '',
    address: currentUser?.address || '',
    rg: currentUser?.rg || '',
    cpf: currentUser?.cpf || '',
    emergencyContactName: currentUser?.emergencyContactName || '',
    emergencyContactPhone: currentUser?.emergencyContactPhone || '',
  })

  if (!currentUser) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const result = await updateProfile(formData)
      if (result.success) {
        toast.success('Perfil atualizado com sucesso!')
      } else {
        toast.error('Erro ao atualizar perfil')
      }
    } catch (error) {
      toast.error('Erro inesperado')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setFormData((prev) => ({ ...prev, [id]: value }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          value={currentUser.email}
          disabled
          className="bg-muted text-muted-foreground"
        />
        <p className="text-xs text-muted-foreground">
          O email não pode ser alterado.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nome Completo</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Telefone / WhatsApp</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="(00) 00000-0000"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Endereço Completo</Label>
        <Input
          id="address"
          value={formData.address}
          onChange={handleChange}
          placeholder="Rua, Número, Bairro, Cidade - UF"
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="rg">RG</Label>
          <Input id="rg" value={formData.rg} onChange={handleChange} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="cpf">CPF</Label>
          <Input
            id="cpf"
            value={formData.cpf}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <div className="border-t pt-4">
        <h3 className="text-sm font-medium mb-4 text-gray-900">
          Contato de Emergência
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="emergencyContactName">Nome do Contato</Label>
            <Input
              id="emergencyContactName"
              value={formData.emergencyContactName}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="emergencyContactPhone">Telefone do Contato</Label>
            <Input
              id="emergencyContactPhone"
              value={formData.emergencyContactPhone}
              onChange={handleChange}
              placeholder="(00) 00000-0000"
              required
            />
          </div>
        </div>
      </div>

      <div className="pt-2">
        <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Salvar Alterações
        </Button>
      </div>
    </form>
  )
}
