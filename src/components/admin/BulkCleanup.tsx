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
  AlertTriangle,
  Trash2,
  ShieldAlert,
  CalendarClock,
  CalendarRange,
} from 'lucide-react'
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
import { useAuthStore } from '@/stores/useAuthStore'

export function BulkCleanup() {
  const [date, setDate] = useState<string>('')
  const [dailyDate, setDailyDate] = useState<string>('')
  const [cleanupDate, setCleanupDate] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const {
    clearAllProducts,
    fetchProducts,
    cleanupByDate,
    performDailyCleanup,
    deleteSoldItems,
  } = useProductStore()
  const { currentUser } = useAuthStore()

  const canDelete = currentUser?.canDeleteRecords || false

  const handleCleanup = async () => {
    if (!date) return

    setLoading(true)
    try {
      // Cleanup by SOLD DATE
      const selectedDate = new Date(date + 'T00:00:00')
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

  const handleCleanupUpToDate = async () => {
    if (!cleanupDate) return

    setLoading(true)
    try {
      const result = await performDailyCleanup(cleanupDate)
      if (result.success && result.data) {
        toast.success(
          `Limpeza concluída. ${result.data.products_deleted} produtos vendidos e ${result.data.messages_deleted} mensagens removidos com sucesso.`,
        )
      } else {
        throw result.error
      }
      setCleanupDate('')
    } catch (error) {
      console.error('Cleanup up to date error:', error)
      toast.error('Erro ao realizar limpeza de histórico.')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteSold = async () => {
    setLoading(true)
    try {
      const result = await deleteSoldItems()
      if (result.success) {
        toast.success(
          `${result.count} produtos vendidos/sem estoque foram removidos.`,
        )
      } else {
        throw result.error
      }
    } catch (error) {
      console.error('Delete sold error:', error)
      toast.error('Erro ao excluir produtos vendidos.')
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

  if (!canDelete) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="pt-6 text-center text-red-800">
          <ShieldAlert className="w-12 h-12 mx-auto mb-2 text-red-500" />
          <h3 className="text-lg font-semibold">Acesso Restrito</h3>
          <p>Você não tem permissão para executar ferramentas de limpeza.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Full Cleanup Up to Date (New Feature) */}
        <Card className="border-purple-100 bg-purple-50/10 md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-900">
              <CalendarRange className="w-5 h-5 text-purple-600" />
              Limpeza Diária (Mensagens e Vendidos)
            </CardTitle>
            <CardDescription>
              Remove mensagens processadas (data de recebimento) e produtos
              vendidos (data de venda) <strong>até a data selecionada</strong>{' '}
              (inclusive).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid w-full grid-cols-1 md:grid-cols-2 items-end gap-4">
              <div className="space-y-2">
                <Label htmlFor="cleanup-upto-date">Limpar dados até:</Label>
                <Input
                  id="cleanup-upto-date"
                  type="date"
                  value={cleanupDate}
                  onChange={(e) => setCleanupDate(e.target.value)}
                  className="bg-white"
                />
              </div>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                    disabled={!cleanupDate || loading}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    {loading ? 'Processando...' : 'Executar Limpeza Diária'}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Confirmação de Limpeza</AlertDialogTitle>
                    <AlertDialogDescription>
                      Você está prestes a excluir registros antigos do banco de
                      dados.
                      <br />
                      <br />
                      <strong>Ação:</strong> Excluir mensagens recebidas e
                      produtos vendidos até o dia{' '}
                      <strong>
                        {cleanupDate &&
                          new Date(
                            cleanupDate + 'T00:00:00',
                          ).toLocaleDateString('pt-BR')}
                      </strong>{' '}
                      (inclusive).
                      <br />
                      <br />
                      Esta ação é irreversível e ajuda a manter o sistema limpo.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleCleanupUpToDate}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      Confirmar Limpeza
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>

        {/* Daily Cleanup Card */}
        <Card className="border-amber-100 bg-amber-50/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-900">
              <CalendarClock className="w-5 h-5 text-amber-600" />
              Limpeza por Data (Criação)
            </CardTitle>
            <CardDescription>
              Remove registros criados exatamente na data selecionada.
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
                    criados no dia{' '}
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

        {/* Sold Cleanup Card (Date based) */}
        <Card className="border-red-100 bg-red-50/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-900">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              Limpeza por Data de Venda (Legado)
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
                  {loading ? 'Processando...' : 'Excluir Vendidos (Data)'}
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

        {/* Full Sold Cleanup Card */}
        <Card className="border-blue-100 bg-blue-50/10 md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <Trash2 className="w-5 h-5 text-blue-600" />
              Excluir Todos os Vendidos / Sem Estoque
            </CardTitle>
            <CardDescription>
              Remove imediatamente todos os produtos marcados como sem estoque
              ou com data de venda.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  disabled={loading}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  {loading
                    ? 'Processando...'
                    : 'Limpar Todos os Vendidos e Sem Estoque'}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Limpar Catálogo?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Isso removerá <strong>todos</strong> os produtos que não
                    estão em estoque ou que já foram vendidos, independentemente
                    da data.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteSold}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Confirmar Limpeza
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>

        <Card className="border-destructive/30 bg-destructive/5 md:col-span-2">
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
                    Você está prestes a excluir <strong>TODOS</strong> os
                    produtos do banco de dados.
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
    </div>
  )
}
