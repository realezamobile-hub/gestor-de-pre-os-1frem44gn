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
import { AlertTriangle, Trash2 } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
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

  const handleCleanup = async () => {
    if (!date) return

    setLoading(true)
    try {
      // Use start of day for the selected date to ensure we delete everything strictly before that date
      // e.g. selected 2024-01-02 -> delete everything < 2024-01-02 00:00:00
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

  return (
    <Card className="border-red-100 bg-red-50/10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-red-900">
          <AlertTriangle className="w-5 h-5 text-red-600" />
          Limpeza de Dados Antigos
        </CardTitle>
        <CardDescription>
          Remova produtos obsoletos do banco de dados em massa. Essa ação é
          irreversível.
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
            <Button variant="destructive" disabled={!date || loading}>
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
                Sim, excluir tudo
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  )
}
