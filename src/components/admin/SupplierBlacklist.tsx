import { useState, useEffect } from 'react'
import { useProductStore } from '@/stores/useProductStore'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Ban, Trash2, Plus, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

export function SupplierBlacklist() {
  const {
    excludedSuppliers,
    fetchExcludedSuppliers,
    addExcludedSupplier,
    removeExcludedSupplier,
  } = useProductStore()
  const [newName, setNewName] = useState('')
  const [newPhone, setNewPhone] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetchExcludedSuppliers()
  }, [])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName && !newPhone) {
      toast.error('Informe ao menos o nome ou o telefone')
      return
    }

    setIsSubmitting(true)
    const result = await addExcludedSupplier(
      newName.trim() || null,
      newPhone.trim() || null,
    )
    setIsSubmitting(false)

    if (result.success) {
      toast.success('Fornecedor adicionado à lista de exclusão')
      setNewName('')
      setNewPhone('')
    } else {
      toast.error('Erro ao adicionar fornecedor')
    }
  }

  const handleRemove = async (id: string) => {
    const result = await removeExcludedSupplier(id)
    if (result.success) {
      toast.success('Fornecedor removido da lista')
    } else {
      toast.error('Erro ao remover fornecedor')
    }
  }

  return (
    <div className="grid gap-6 md:grid-cols-12">
      <div className="md:col-span-4 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Ban className="w-5 h-5 text-red-600" />
              Adicionar Exclusão
            </CardTitle>
            <CardDescription>
              Produtos deste fornecedor serão ocultados automaticamente.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="s-name">Nome do Fornecedor</Label>
                <Input
                  id="s-name"
                  placeholder="Ex: Fornecedor XYZ"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="s-phone">Telefone (Exato)</Label>
                <Input
                  id="s-phone"
                  placeholder="Ex: (11) 99999-9999"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-red-600 hover:bg-red-700"
                disabled={isSubmitting || (!newName && !newPhone)}
              >
                {isSubmitting ? (
                  'Adicionando...'
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" /> Bloquear
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Alert className="bg-amber-50 border-amber-200">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertTitle className="text-amber-800">Atenção</AlertTitle>
          <AlertDescription className="text-amber-700 text-xs mt-1">
            A filtragem por telefone requer correspondência exata. Certifique-se
            de usar o mesmo formato salvo nos produtos.
          </AlertDescription>
        </Alert>
      </div>

      <div className="md:col-span-8">
        <Card className="h-full">
          <CardHeader>
            <CardTitle>Fornecedores Bloqueados</CardTitle>
            <CardDescription>
              Lista de fornecedores impedidos de aparecer no sistema.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {excludedSuppliers.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
                <Ban className="w-12 h-12 mb-3 mx-auto text-gray-300" />
                <p>Nenhum fornecedor bloqueado.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Telefone</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {excludedSuppliers.map((supplier) => (
                    <TableRow key={supplier.id}>
                      <TableCell className="font-medium">
                        {supplier.nome || (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {supplier.telefone || (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleRemove(supplier.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
