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
import { AlertTriangle, Trash2, ShieldAlert } from 'lucide-react'
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
import { startOfDay } from 'date-fns'

export function BulkCleanup() {
  const [date, setDate] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const { clearAllProducts } = useProductStore()

  const handleCleanup = async () => {
    if (!date) return

    setLoading(true)
    try {
      const cleanupDate = startOfDay(new Date(date)).toISOString()

      const { error, count } = await supabase
        .from('produtos')
        .delete({ count: 'exact' })
        .lt('criado_em', cleanupDate)

      if (error) throw error

      toast.success(
        `${count ?? 0} produtos antigos foram removidos com sucesso.`,
      )
      setDate('')
    } catch (error) {
      console.error('Cleanup error:', error)
      toast.error('Erro ao realizar a limpeza de dados.')
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
      <Card className="border-red-100 bg-red-50/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-900">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            Limpeza por Data
          </CardTitle>
          <CardDescription>
            Remova produtos obsoletos do banco de dados anteriores a uma data.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="cleanup-date">
              Remover produtos criados antes de:
            </Label>
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
                className="border-red-200 text-red-700 hover:bg-red-50"
                disabled={!date || loading}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                {loading ? 'Processando...' : 'Excluir Registros Antigos'}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Você tem certeza absoluta?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta ação excluirá permanentemente todos os produtos criados
                  antes de{' '}
                  <span className="font-bold">
                    {date && new Date(date).toLocaleDateString('pt-BR')}
                  </span>
                  . Os dados não poderão ser recuperados.
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
