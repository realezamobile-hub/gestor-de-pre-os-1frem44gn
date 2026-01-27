import { useState, useEffect } from 'react'
import { useCompanyStore } from '@/stores/useCompanyStore'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Building2,
  Plus,
  Pencil,
  Trash2,
  CheckCircle2,
  Loader2,
} from 'lucide-react'
import { toast } from 'sonner'
import { Company } from '@/types'

export function CompanyManagement() {
  const { companies, fetchCompanies, createCompany, updateCompany, isLoading } =
    useCompanyStore()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCompany, setEditingCompany] = useState<Company | null>(null)
  const [formData, setFormData] = useState({
    nome_fantasia: '',
    razao_social: '',
    cnpj: '',
    modulos_ativos: [] as string[],
  })

  useEffect(() => {
    fetchCompanies()
  }, [])

  const AVAILABLE_MODULES = [
    { id: 'catalogo', label: 'Catálogo de Produtos' },
    { id: 'generator', label: 'Gerador de Lista' },
    { id: 'evaluation', label: 'Avaliação Técnica' },
    { id: 'admin', label: 'Admin (Interno)' },
  ]

  const handleOpenDialog = (company?: Company) => {
    if (company) {
      setEditingCompany(company)
      setFormData({
        nome_fantasia: company.nome_fantasia,
        razao_social: company.razao_social || '',
        cnpj: company.cnpj || '',
        modulos_ativos: company.modulos_ativos || [],
      })
    } else {
      setEditingCompany(null)
      setFormData({
        nome_fantasia: '',
        razao_social: '',
        cnpj: '',
        modulos_ativos: ['catalogo'],
      })
    }
    setIsDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    let result

    if (editingCompany) {
      result = await updateCompany(editingCompany.id, formData)
    } else {
      result = await createCompany(formData)
    }

    if (result.success) {
      toast.success(
        editingCompany
          ? 'Empresa atualizada com sucesso!'
          : 'Empresa criada com sucesso!',
      )
      setIsDialogOpen(false)
    } else {
      toast.error('Erro ao salvar empresa')
    }
  }

  const toggleModule = (moduleId: string) => {
    setFormData((prev) => {
      if (prev.modulos_ativos.includes(moduleId)) {
        return {
          ...prev,
          modulos_ativos: prev.modulos_ativos.filter((m) => m !== moduleId),
        }
      } else {
        return {
          ...prev,
          modulos_ativos: [...prev.modulos_ativos, moduleId],
        }
      }
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Empresas</h2>
          <p className="text-sm text-muted-foreground">
            Gerencie as empresas e seus módulos ativos.
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="w-4 h-4 mr-2" />
          Nova Empresa
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome Fantasia</TableHead>
              <TableHead>CNPJ</TableHead>
              <TableHead>Módulos Ativos</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                </TableCell>
              </TableRow>
            ) : companies.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  Nenhuma empresa cadastrada.
                </TableCell>
              </TableRow>
            ) : (
              companies.map((company) => (
                <TableRow key={company.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-muted-foreground" />
                      {company.nome_fantasia}
                    </div>
                    {company.razao_social && (
                      <div className="text-xs text-muted-foreground ml-6">
                        {company.razao_social}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>{company.cnpj || '-'}</TableCell>
                  <TableCell>
                    <div className="flex gap-1 flex-wrap">
                      {company.modulos_ativos?.map((mod) => (
                        <span
                          key={mod}
                          className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          {AVAILABLE_MODULES.find((m) => m.id === mod)?.label ||
                            mod}
                        </span>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenDialog(company)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingCompany ? 'Editar Empresa' : 'Nova Empresa'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 py-2">
              <div className="grid gap-2">
                <Label htmlFor="nome">Nome Fantasia</Label>
                <Input
                  id="nome"
                  required
                  value={formData.nome_fantasia}
                  onChange={(e) =>
                    setFormData({ ...formData, nome_fantasia: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="razao">Razão Social</Label>
                <Input
                  id="razao"
                  value={formData.razao_social}
                  onChange={(e) =>
                    setFormData({ ...formData, razao_social: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="cnpj">CNPJ</Label>
                <Input
                  id="cnpj"
                  value={formData.cnpj}
                  onChange={(e) =>
                    setFormData({ ...formData, cnpj: e.target.value })
                  }
                />
              </div>

              <div className="space-y-3 pt-2">
                <Label>Módulos do Sistema</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {AVAILABLE_MODULES.map((module) => (
                    <div
                      key={module.id}
                      className="flex items-center space-x-2 border p-3 rounded-md hover:bg-muted/50 cursor-pointer"
                      onClick={() => toggleModule(module.id)}
                    >
                      <Checkbox
                        id={`mod-${module.id}`}
                        checked={formData.modulos_ativos.includes(module.id)}
                        onCheckedChange={() => toggleModule(module.id)}
                      />
                      <Label
                        htmlFor={`mod-${module.id}`}
                        className="cursor-pointer text-sm font-normal"
                      >
                        {module.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit">
                {editingCompany ? 'Salvar Alterações' : 'Criar Empresa'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
