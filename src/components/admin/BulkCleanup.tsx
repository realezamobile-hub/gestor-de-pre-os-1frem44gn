import { useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Trash2,
  CalendarClock,
  ShieldAlert,
  AlertTriangle,
  Banknote,
} from 'lucide-react'
import { useProductStore } from '@/stores/useProductStore'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { endOfDay, format } from 'date-fns'
import { useAuthStore } from '@/stores/useAuthStore'

export function BulkCleanup() {
  const [date, setDate] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [zeroValueLoading, setZeroValueLoading] = useState(false)
  const { cleanupOldRecords, deleteZeroValueProducts } = useProductStore()
  const { currentUser } = useAuthStore()

  const canDelete = currentUser?.canDeleteRecords || false

  const handleCleanup = async () => {
    if (!date) return

    setLoading(true)
    try {
      // Calculate end of day for the selected date to include records created on that day
      // date string is YYYY-MM-DD
      const selectedDate = new Date(date + 'T00:00:00')
      const targetDate = endOfDay(selectedDate).toISOString()

      const result = await cleanupOldRecords(targetDate)

      if (result.success) {
        toast.success(`Limpeza concluída com sucesso.`, {
          description: `${result.data.products_deleted} produtos e ${result.data.messages_deleted} mensagens removidos.`,
        })
        setDate('')
      } else {
        throw result.error
      }
    } catch (error) {
      console.error('Cleanup error:', error)
      toast.error('Erro ao realizar limpeza de registros.')
    } finally {
      setLoading(false)
    }
  }

  const handleZeroValueCleanup = async () => {
    if (!currentUser?.companyId) {
      toast.error('Empresa não identificada.')
      return
    }

    setZeroValueLoading(true)
    try {
      const result = await deleteZeroValueProducts(currentUser.companyId)

      if (result.success) {
        toast.success('Registros deletados com sucesso!')
      } else {
        throw result.error
      }
    } catch (error: any) {
      console.error('Zero value cleanup error:', error)
      toast.error('Erro ao deletar registros. Tente novamente.')
    } finally {
      setZeroValueLoading(false)
    }
  }

  return (
    <div className="grid gap-6">
      {canDelete ? (
        <Card className="border-red-100 bg-red-50/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-900">
              <CalendarClock className="w-5 h-5 text-red-600" />
              Limpeza de Histórico Antigo
            </CardTitle>
            <CardDescription>
              Ferramenta para remover registros antigos do banco de dados para
              liberar espaço e manter a performance.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                <div className="text-sm text-amber-800">
                  <p className="font-medium mb-1">Atenção: Ação Irreversível</p>
                  <p>Esta ação excluirá permanentemente:</p>
                  <ul className="list-disc pl-5 mt-1 space-y-1">
                    <li>
                      Todos os <strong>produtos</strong> criados até a data
                      selecionada (inclusive).
                    </li>
                    <li>
                      Todas as <strong>mensagens processadas</strong> recebidas
                      até a data selecionada (inclusive).
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="grid w-full items-end gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="cleanup-date">Selecionar Data Limite</Label>
                <Input
                  id="cleanup-date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="bg-white"
                />
                <p className="text-xs text-muted-foreground">
                  Registros desta data e anteriores serão apagados.
                </p>
              </div>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    className="w-full"
                    disabled={!date || loading}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    {loading ? 'Processando...' : 'Excluir Registros Antigos'}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Confirmar Exclusão em Massa
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      Você está prestes a excluir permanentemente dados do
                      sistema até o dia{' '}
                      <strong>
                        {' '}
                        {date &&
                          format(new Date(date + 'T00:00:00'), 'dd/MM/yyyy')}
                      </strong>
                      .
                      <br />
                      <br />
                      Esta ação não pode ser desfeita. Tem certeza que deseja
                      continuar?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleCleanup}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Sim, excluir tudo
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-red-200 bg-red-50 opacity-60">
          <CardContent className="pt-6 text-center text-red-800">
            <ShieldAlert className="w-12 h-12 mx-auto mb-2 text-red-500" />
            <h3 className="text-lg font-semibold">
              Limpeza de Histórico Restrita
            </h3>
            <p>Você não tem permissão para remover registros antigos.</p>
          </CardContent>
        </Card>
      )}

      <Card className="border-orange-100 bg-orange-50/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-900">
            <Banknote className="w-5 h-5 text-orange-600" />
            Limpeza de Produtos Inválidos
          </CardTitle>
          <CardDescription>
            Remover produtos que não possuem valor definido (zero, negativo ou
            nulo).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-orange-200 bg-orange-50 p-4">
            <p className="text-sm text-orange-800">
              Isso removerá todos os produtos com <strong>valor R$ 0,00</strong>{' '}
              ou sem preço cadastrado (nulo). Útil para limpar importações
              incorretas ou produtos incompletos.
            </p>
          </div>

          <div className="flex justify-end">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  className="w-full md:w-auto bg-orange-600 hover:bg-orange-700"
                  disabled={zeroValueLoading}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  {zeroValueLoading
                    ? 'Processando...'
                    : 'Deletar registros com valor <= 0,00'}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    Confirmar Limpeza de Produtos
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    Tem certeza que deseja excluir permanentemente todos os
                    produtos com valor zero ou nulo? Esta ação não pode ser
                    desfeita.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleZeroValueCleanup}
                    className="bg-orange-600 hover:bg-orange-700"
                  >
                    Confirmar Limpeza
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
