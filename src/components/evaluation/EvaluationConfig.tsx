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
import { Trash2, Plus, DollarSign } from 'lucide-react'
import { toast } from 'sonner'

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

  const handleAddModel = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newModel || !newBasePrice) return

    const result = await addBasePrice(newModel, parseFloat(newBasePrice))
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
    if (!newDiscountName || !newDiscountValue) return

    const result = await addDiscount(
      newDiscountName,
      parseFloat(newDiscountValue),
    )
    if (result.success) {
      setNewDiscountName('')
      setNewDiscountValue('')
      toast.success('Desconto adicionado com sucesso')
    } else {
      toast.error('Erro ao adicionar desconto')
    }
  }

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Preços Base por Modelo</CardTitle>
            <CardDescription>
              Defina o valor de compra para iPhones em perfeito estado.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddModel} className="flex gap-2 mb-4">
              <Input
                placeholder="Modelo (ex: iPhone 14 128GB)"
                value={newModel}
                onChange={(e) => setNewModel(e.target.value)}
                className="flex-1"
              />
              <Input
                placeholder="Preço (R$)"
                type="number"
                value={newBasePrice}
                onChange={(e) => setNewBasePrice(e.target.value)}
                className="w-24"
              />
              <Button type="submit" size="icon">
                <Plus className="w-4 h-4" />
              </Button>
            </form>
            <div className="rounded-md border max-h-[400px] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Modelo</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {basePrices.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">
                        {item.modelo}
                      </TableCell>
                      <TableCell className="text-right">
                        R$ {item.preco_base}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteBasePrice(item.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Descontos de Periféricos</CardTitle>
            <CardDescription>
              Valores a deduzir quando um defeito é identificado.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddDiscount} className="flex gap-2 mb-4">
              <Input
                placeholder="Defeito (ex: Tela Quebrada)"
                value={newDiscountName}
                onChange={(e) => setNewDiscountName(e.target.value)}
                className="flex-1"
              />
              <Input
                placeholder="Desc. (R$)"
                type="number"
                value={newDiscountValue}
                onChange={(e) => setNewDiscountValue(e.target.value)}
                className="w-24"
              />
              <Button type="submit" size="icon">
                <Plus className="w-4 h-4" />
              </Button>
            </form>
            <div className="rounded-md border max-h-[400px] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Defeito</TableHead>
                    <TableHead className="text-right">Dedução</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {peripheralDiscounts.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.nome}</TableCell>
                      <TableCell className="text-right text-red-600 font-bold">
                        - R$ {item.valor_desconto}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteDiscount(item.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
