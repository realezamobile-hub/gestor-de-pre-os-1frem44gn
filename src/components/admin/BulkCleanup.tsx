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
import { AlertTriangle, Trash2, ShieldAlert, CalendarClock } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
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
import { addDays, format } from 'date-fns'

export function BulkCleanup() {
  const [date, setDate] = useState<string>('')
  const [dailyDate, setDailyDate] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const { clearAllProducts, fetchProducts, cleanupByDate } = useProductStore()

  const handleCleanup = async () => {
    if (!date) return

    setLoading(true)
    try {
      // Cleanup by SOLD DATE
      // Create date object from YYYY-MM-DD input string
      const selectedDate = new Date(date + 'T00:00:00')

      // Calculate the next day to use as upper bound (exclusive)
      const nextDay = addDays(selectedDate, 1)
      const cutoffDate = format(nextDay, 'yyyy-MM-dd')

      const { error, count } = await supabase
        .from('produtos')
        .delete({ count: 'exact' })
        .lt('data_venda', cutoffDate)

      if (error) throw error

      toast.success(
        `${count ?? 0} produtos vendidos foram removidos com sucesso.`,
      )

      // Refresh products list
      fetchProducts()

      setDate('')
    } catch (error) {
      console.error('Cleanup error:', error)
      toast.error('Erro ao realizar a limpeza de dados.')
    } finally {
      setLoading(false)
    }
  }

  const handleDailyCleanup = async () => {
    if (!dailyDate) return

    setLoading(true)
    try {
      const result = await cleanupByDate(dailyDate)
      if (result.success && result.data) {
        toast.success(
          `Limpeza concluída. ${result.data.products_deleted} produtos e ${result.data.messages_deleted} mensagens removidos.`,
        )
      } else {
        throw result.error
      }
      setDailyDate('')
    } catch (error) {
      console.error('Daily cleanup error:', error)
      toast.error('Erro ao realizar limpeza por data.')
    } finally {
      setLoading(false)
    }
  }

  const handleClearAll = async () => {
    setLoading(true)
    try {
      const result = await clearAllProducts()
      if (result.success) {
        toast.success('Todos os produtos foram removidos com sucesso.')
      } else {
        throw result.error
      }
    } catch (error) {
      console.error('Clear all error:', error)
      toast.error('Erro ao limpar banco de dados.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid gap-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Daily Cleanup Card */}
        <Card className="border-amber-100 bg-amber-50/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-900">
              <CalendarClock className="w-5 h-5 text-amber-600" />
              Limpeza Diária (Data Específica)
            </CardTitle>
            <CardDescription>
              Remove registros de produtos e mensagens criados em uma data.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="daily-date">Data dos registros:</Label>
              <Input
                id="daily-date"
                type="date"
                value={dailyDate}
                onChange={(e) => setDailyDate(e.target.value)}
                className="bg-white"
              />
            </div>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full border-amber-200 text-amber-800 hover:bg-amber-50"
                  disabled={!dailyDate || loading}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  {loading ? 'Processando...' : 'Limpar Registros do Dia'}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirmação de Limpeza</AlertDialogTitle>
                  <AlertDialogDescription>
                    Você está prestes a excluir todos os produtos e mensagens
                    processadas do dia{' '}
                    <strong>
                      {dailyDate &&
                        new Date(dailyDate + 'T00:00:00').toLocaleDateString(
                          'pt-BR',
                        )}
                    </strong>
                    .
                    <br />
                    <br />
                    Esta ação é útil para remover dados que perderam relevância
                    após 48h. A ação é irreversível.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDailyCleanup}
                    className="bg-amber-600 hover:bg-amber-700"
                  >
                    Confirmar Limpeza
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>

        {/* Sales Cleanup Card */}
        <Card className="border-red-100 bg-red-50/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-900">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              Limpeza por Data de Venda
            </CardTitle>
            <CardDescription>
              Remove produtos vendidos até uma data específica.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="cleanup-date">Vendidos em ou antes de:</Label>
              <Input
                id="cleanup-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="bg-white"
              />
            </div>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full border-red-200 text-red-700 hover:bg-red-50"
                  disabled={!date || loading}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  {loading ? 'Processando...' : 'Excluir Vendidos'}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    Você tem certeza absoluta?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta ação excluirá permanentemente todos os produtos com
                    data de venda em ou antes de{' '}
                    <span className="font-bold">
                      {date &&
                        new Date(date + 'T00:00:00').toLocaleDateString(
                          'pt-BR',
                        )}
                    </span>
                    .
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleCleanup}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Sim, excluir
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      </div>

      <Card className="border-destructive/30 bg-destructive/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <ShieldAlert className="w-5 h-5" />
            Resetar Banco de Dados
          </CardTitle>
          <CardDescription>
            Ação crítica. Remove TODOS os produtos do sistema.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                className="w-full sm:w-auto"
                disabled={loading}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                {loading ? 'Limpando...' : 'LIMPAR TUDO (TODOS OS PRODUTOS)'}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="text-destructive">
                  PERIGO: Limpar Tudo?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  Você está prestes a excluir <strong>TODOS</strong> os produtos
                  do banco de dados.
                  <br />
                  <br />
                  Isso geralmente é feito para reiniciar o sistema ou limpar
                  dados de teste. Esta ação é <strong>irreversível</strong>.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleClearAll}
                  className="bg-destructive hover:bg-destructive/90"
                >
                  Confirmar Exclusão Total
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  )
}
