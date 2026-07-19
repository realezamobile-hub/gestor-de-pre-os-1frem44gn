import { useEffect, useState } from 'react'
import { useAuthStore } from '@/stores/useAuthStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { UserEditDialog } from '@/components/admin/UserEditDialog'
import { UserInviteDialog } from '@/components/admin/UserInviteDialog'
import { Search, UserPlus, Pencil, Lock } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Link } from 'react-router-dom'
import { useCompanyStore } from '@/stores/useCompanyStore'

export default function UsersPage() {
  const { users, fetchUsers, currentUser } = useAuthStore()
  const { companies, fetchCompanies } = useCompanyStore()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [editUser, setEditUser] = useState<any>(null)
  const [showInvite, setShowInvite] = useState(false)

  useEffect(() => {
    fetchUsers()
    fetchCompanies()
  }, [fetchUsers, fetchCompanies])

  const isSuperAdmin = currentUser?.isSuperAdmin
  const currentCompanyId = currentUser?.companyId

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase())
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && u.accessAllowed) ||
      (statusFilter === 'blocked' && !u.accessAllowed) ||
      (statusFilter === 'trial' && u.subscriptionType === 'trial')
    return matchesSearch && matchesStatus
  })

  const getDaysRemaining = (nextBillingDate?: string | null) => {
    if (!nextBillingDate) return null
    return Math.ceil(
      (new Date(nextBillingDate).getTime() - Date.now()) /
        (1000 * 60 * 60 * 24),
    )
  }

  const getStatusBadge = (user: any) => {
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Gestão de Usuários
          </h1>
          <p className="text-muted-foreground">
            Gerencie usuários, assinaturas e acessos aos módulos.
          </p>
        </div>
        <Button onClick={() => setShowInvite(true)}>
          <UserPlus className="w-4 h-4 mr-2" />
          Novo Usuário
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou email..."
                className="pl-8"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="w-full md:w-[200px]">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="active">Ativos</SelectItem>
                  <SelectItem value="trial">Trial</SelectItem>
                  <SelectItem value="blocked">Bloqueados</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Função</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Mensalidade</TableHead>
                  <TableHead>Renovação</TableHead>
                  <TableHead>Dias</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => {
                  const days = getDaysRemaining(user.nextBillingDate)
                  return (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {user.email}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {user.role === 'ADMIN'
                          ? 'Admin'
                          : user.role === 'TECNICO'
                            ? 'Técnico'
                            : user.role === 'ADMINISTRATIVO'
                              ? 'Admin. Escritório'
                              : 'Vendedor'}
                      </TableCell>
                      <TableCell>{getStatusBadge(user)}</TableCell>
                      <TableCell className="text-sm">
                        {user.subscriptionType === 'trial' ? 'Trial' : 'Mensal'}
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
                            {days > 0 ? `${days}d` : 'Expirado'}
                          </span>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0"
                          onClick={() => setEditUser(user)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
                {filteredUsers.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="text-center text-muted-foreground py-8"
                    >
                      Nenhum usuário encontrado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <UserEditDialog
        user={editUser}
        open={!!editUser}
        onOpenChange={(open) => !open && setEditUser(null)}
        companies={companies}
        isSuperAdmin={isSuperAdmin}
      />

      <UserInviteDialog
        open={showInvite}
        onOpenChange={setShowInvite}
        companies={companies}
        isSuperAdmin={isSuperAdmin}
        currentCompanyId={currentCompanyId}
      />

      {!currentUser?.isSuperAdmin && currentUser?.role !== 'ADMIN' && (
        <div className="text-center py-12">
          <Lock className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="mb-4">Acesso restrito a administradores.</p>
          <Button asChild>
            <Link to="/">Voltar ao Painel</Link>
          </Button>
        </div>
      )}
    </div>
  )
}
