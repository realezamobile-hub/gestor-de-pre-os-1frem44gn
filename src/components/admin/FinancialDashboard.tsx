import { useEffect, useState, useCallback } from 'react'
import { useAuthStore } from '@/stores/useAuthStore'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DollarSign,
  Users,
  Wifi,
  RefreshCw,
  CheckCircle2,
  Clock,
} from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { PaymentLog } from '@/types'

interface PaymentLogRow {
  id: string
  profile_id: string
  amount: number
  payment_date: string
  created_by_admin_id: string | null
  created_at: string
  profiles?: { name: string | null } | null
}

export function FinancialDashboard() {
  const {
    users,
    fetchUsers,
    onlineUsers,
    fetchOnlineUsers,
    currentUser,
    renewUser,
  } = useAuthStore()
  const [payments, setPayments] = useState<PaymentLogRow[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [renewingId, setRenewingId] = useState<string | null>(null)

  const fetchPayments = useCallback(async () => {
    const { data, error } = await supabase
      .from('payment_logs')
      .select(
        'id, profile_id, amount, payment_date, created_by_admin_id, created_at, profiles:profile_id(name)',
      )
      .order('payment_date', { ascending: false })
      .limit(50)
    if (!error && data) {
      setPayments(data as unknown as PaymentLogRow[])
    }
  }, [])

  const loadAll = useCallback(async () => {
    setIsLoading(true)
    await Promise.all([fetchUsers(), fetchOnlineUsers(), fetchPayments()])
    setIsLoading(false)
  }, [fetchUsers, fetchOnlineUsers, fetchPayments])

  useEffect(() => {
    loadAll()
    const interval = setInterval(() => {
      fetchOnlineUsers()
    }, 30000)
    return () => clearInterval(interval)
  }, [loadAll, fetchOnlineUsers])

  const totalRevenue = payments.reduce((sum, p) => sum + Number(p.amount), 0)
  const activeUsers = users.filter((u) => u.accessAllowed).length
  const onlineCount = onlineUsers.length

  const getDaysRemaining = (nextBillingDate?: string | null) => {
    if (!nextBillingDate) return null
    const diff = new Date(nextBillingDate).getTime() - Date.now()
    return Math.ceil(diff / (1000 * 60 * 60 * 24))
  }

  const getStatusBadge = (user: (typeof users)[0]) => {
    if (!user.accessAllowed) {
      return (
        <Badge
          variant="outline"
          className="bg-red-100 text-red-800 border-red-200"
        >
          Bloqueado
        </Badge>
      )
    }
    if (user.subscriptionType === 'trial') {
      return (
        <Badge
          variant="outline"
          className="bg-amber-100 text-amber-800 border-amber-200"
        >
          Trial
        </Badge>
      )
    }
    return (
      <Badge
        variant="outline"
        className="bg-emerald-100 text-emerald-800 border-emerald-200"
      >
        Ativo
      </Badge>
    )
  }

  const handleRenew = async (userId: string) => {
    setRenewingId(userId)
    try {
      const result = await renewUser(userId)
      if (result.success) {
        toast.success('Renovação registrada com sucesso!')
        await loadAll()
      } else {
        toast.error('Erro ao renovar acesso')
      }
    } catch {
      toast.error('Erro inesperado ao renovar')
    } finally {
      setRenewingId(null)
    }
  }

  const isAdmin = currentUser?.isSuperAdmin || currentUser?.role === 'ADMIN'

  if (!isAdmin) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          Acesso restrito a administradores.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Dashboard Financeiro</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={loadAll}
          disabled={isLoading}
        >
          <RefreshCw
            className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`}
          />
          Atualizar
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <DollarSign className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              R${' '}
              {totalRevenue.toLocaleString('pt-BR', {
                minimumFractionDigits: 2,
              })}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {payments.length} pagamento(s) registrado(s)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Usuários Ativos
            </CardTitle>
            <Users className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeUsers}</div>
            <p className="text-xs text-muted-foreground mt-1">
              de {users.length} total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Online Agora</CardTitle>
            <Wifi className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {onlineCount}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              ativos nos últimos 5 min
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Status dos Usuários</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Mensalidade</TableHead>
                  <TableHead>Renovação</TableHead>
                  <TableHead>Dias Restantes</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users
                  .filter((u) => !u.isSuperAdmin)
                  .map((user) => {
                    const days = getDaysRemaining(user.nextBillingDate)
                    const isOnline = onlineUsers.some((ou) => ou.id === user.id)
                    return (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {isOnline && (
                              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            )}
                            <div>
                              <p className="font-medium">{user.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {user.email}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(user)}</TableCell>
                        <TableCell className="text-sm capitalize">
                          {user.subscriptionType === 'trial'
                            ? 'Trial'
                            : 'Mensal'}
                        </TableCell>
                        <TableCell className="text-sm">
                          {user.monthlyFee
                            ? `R$ ${Number(user.monthlyFee).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                            : '-'}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {user.nextBillingDate
                            ? format(
                                new Date(user.nextBillingDate),
                                'dd/MM/yyyy',
                                { locale: ptBR },
                              )
                            : '-'}
                        </TableCell>
                        <TableCell>
                          {days !== null ? (
                            <span
                              className={
                                days <= 3
                                  ? 'text-red-600 font-medium'
                                  : days <= 7
                                    ? 'text-amber-600'
                                    : 'text-muted-foreground'
                              }
                            >
                              {days > 0 ? `${days} dia(s)` : 'Expirado'}
                            </span>
                          ) : (
                            '-'
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {user.subscriptionType === 'monthly' && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8"
                              onClick={() => handleRenew(user.id)}
                              disabled={renewingId === user.id}
                            >
                              {renewingId === user.id ? (
                                <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                              ) : (
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                              )}
                              Renovar
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Usuários Online
          </CardTitle>
        </CardHeader>
        <CardContent>
          {onlineUsers.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nenhum usuário online no momento.
            </p>
          ) : (
            <div className="space-y-2">
              {onlineUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-slate-50"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <div>
                      <p className="text-sm font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {user.lastActive
                      ? `Última atividade: ${format(new Date(user.lastActive), 'dd/MM HH:mm', { locale: ptBR })}`
                      : '-'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {payments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Histórico de Pagamentos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Data</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.slice(0, 20).map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-medium">
                        {payment.profiles?.name || 'N/A'}
                      </TableCell>
                      <TableCell className="text-green-600 font-medium">
                        R${' '}
                        {Number(payment.amount).toLocaleString('pt-BR', {
                          minimumFractionDigits: 2,
                        })}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(
                          new Date(payment.payment_date),
                          'dd/MM/yyyy HH:mm',
                          { locale: ptBR },
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
