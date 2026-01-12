import { useState } from 'react'
import { useEvaluationStore } from '@/stores/useEvaluationStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Trash2, Plus, DollarSign, Smartphone, Wrench } from 'lucide-react'
import { toast } from 'sonner'
import { ScrollArea } from '@/components/ui/scroll-area'

export function EvaluationConfig() {
  const {
    basePrices,
    peripheralDiscounts,
    addBasePrice,
    deleteBasePrice,
    addDiscount,
    deleteDiscount,
  } = useEvaluationStore()

  const [newModel, setNewModel] = useState('')
  const [newBasePrice, setNewBasePrice] = useState('')
  const [newDiscountName, setNewDiscountName] = useState('')
  const [newDiscountValue, setNewDiscountValue] = useState('')
  const [isSubmittingModel, setIsSubmittingModel] = useState(false)
  const [isSubmittingDiscount, setIsSubmittingDiscount] = useState(false)

  const handleAddModel = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newModel || !newBasePrice) {
      toast.error('Preencha todos os campos do modelo')
      return
    }

    setIsSubmittingModel(true)
    const result = await addBasePrice(newModel, parseFloat(newBasePrice))
    setIsSubmittingModel(false)

    if (result.success) {
      setNewModel('')
      setNewBasePrice('')
      toast.success('Modelo adicionado com sucesso')
    } else {
      toast.error('Erro ao adicionar modelo')
    }
  }

  const handleAddDiscount = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newDiscountName || !newDiscountValue) {
      toast.error('Preencha todos os campos do desconto')
      return
    }

    setIsSubmittingDiscount(true)
    const result = await addDiscount(
      newDiscountName,
      parseFloat(newDiscountValue),
    )
    setIsSubmittingDiscount(false)

    if (result.success) {
      setNewDiscountName('')
      setNewDiscountValue('')
      toast.success('Desconto adicionado com sucesso')
    } else {
      toast.error('Erro ao adicionar desconto')
    }
  }

  const handleDeleteModel = async (id: string) => {
    if (confirm('Tem certeza que deseja remover este modelo?')) {
      const result = await deleteBasePrice(id)
      if (result.success) {
        toast.success('Modelo removido')
      } else {
        toast.error('Erro ao remover modelo')
      }
    }
  }

  const handleDeleteDiscount = async (id: string) => {
    if (confirm('Tem certeza que deseja remover este desconto?')) {
      const result = await deleteDiscount(id)
      if (result.success) {
        toast.success('Desconto removido')
      } else {
        toast.error('Erro ao remover desconto')
      }
    }
  }

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Base Prices Section */}
      <Card className="flex flex-col h-[600px]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-primary" />
            Preços Base por Modelo
          </CardTitle>
          <CardDescription>
            Gerencie o valor de compra para aparelhos em perfeito estado.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col gap-4 overflow-hidden">
          <form
            onSubmit={handleAddModel}
            className="flex gap-2 items-end bg-slate-50 p-3 rounded-lg border"
          >
            <div className="flex-1 space-y-1">
              <Label htmlFor="model" className="text-xs">
                Modelo
              </Label>
              <Input
                id="model"
                placeholder="Ex: iPhone 14 128GB"
                value={newModel}
                onChange={(e) => setNewModel(e.target.value)}
                className="bg-white"
              />
            </div>
            <div className="w-28 space-y-1">
              <Label htmlFor="price" className="text-xs">
                Preço Base (R$)
              </Label>
              <Input
                id="price"
                placeholder="0.00"
                type="number"
                min="0"
                step="0.01"
                value={newBasePrice}
                onChange={(e) => setNewBasePrice(e.target.value)}
                className="bg-white"
              />
            </div>
            <Button
              type="submit"
              size="icon"
              disabled={isSubmittingModel}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </form>

          <div className="rounded-md border flex-1 overflow-hidden relative">
            <ScrollArea className="h-full">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50 sticky top-0">
                    <TableHead>Modelo</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {basePrices.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={3}
                        className="text-center text-muted-foreground py-8"
                      >
                        Nenhum modelo cadastrado.
                      </TableCell>
                    </TableRow>
                  ) : (
                    basePrices.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">
                          {item.modelo}
                        </TableCell>
                        <TableCell className="text-right">
                          R${' '}
                          {item.preco_base.toLocaleString('pt-BR', {
                            minimumFractionDigits: 2,
                          })}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteModel(item.id)}
                            className="text-muted-foreground hover:text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
          </div>
        </CardContent>
      </Card>

      {/* Peripheral Discounts Section */}
      <Card className="flex flex-col h-[600px]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="w-5 h-5 text-red-500" />
            Descontos de Periféricos
          </CardTitle>
          <CardDescription>
            Defina os valores a serem deduzidos para cada defeito encontrado.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col gap-4 overflow-hidden">
          <form
            onSubmit={handleAddDiscount}
            className="flex gap-2 items-end bg-slate-50 p-3 rounded-lg border"
          >
            <div className="flex-1 space-y-1">
              <Label htmlFor="discountName" className="text-xs">
                Defeito / Peça
              </Label>
              <Input
                id="discountName"
                placeholder="Ex: Tela Quebrada"
                value={newDiscountName}
                onChange={(e) => setNewDiscountName(e.target.value)}
                className="bg-white"
              />
            </div>
            <div className="w-28 space-y-1">
              <Label htmlFor="discountValue" className="text-xs">
                Dedução (R$)
              </Label>
              <Input
                id="discountValue"
                placeholder="0.00"
                type="number"
                min="0"
                step="0.01"
                value={newDiscountValue}
                onChange={(e) => setNewDiscountValue(e.target.value)}
                className="bg-white"
              />
            </div>
            <Button
              type="submit"
              size="icon"
              disabled={isSubmittingDiscount}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </form>

          <div className="rounded-md border flex-1 overflow-hidden relative">
            <ScrollArea className="h-full">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50 sticky top-0">
                    <TableHead>Defeito</TableHead>
                    <TableHead className="text-right">Dedução</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {peripheralDiscounts.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={3}
                        className="text-center text-muted-foreground py-8"
                      >
                        Nenhum desconto cadastrado.
                      </TableCell>
                    </TableRow>
                  ) : (
                    peripheralDiscounts.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">
                          {item.nome}
                        </TableCell>
                        <TableCell className="text-right font-bold text-red-600">
                          - R${' '}
                          {item.valor_desconto.toLocaleString('pt-BR', {
                            minimumFractionDigits: 2,
                          })}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteDiscount(item.id)}
                            className="text-muted-foreground hover:text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
