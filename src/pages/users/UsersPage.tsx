import { useState, useEffect } from 'react'
import { useAuthStore } from '@/stores/useAuthStore'
import { useCompanyStore } from '@/stores/useCompanyStore'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Lock,
  Unlock,
  Pencil,
  Search,
  Users,
  CircleDollarSign,
} from 'lucide-react'
import { toast } from 'sonner'
import { User } from '@/types'
import { UserEditDialog } from '@/components/admin/UserEditDialog'
import { UserInviteDialog } from '@/components/admin/UserInviteDialog'
import { useDebounce } from '@/hooks/use-debounce'
import { cn } from '@/lib/utils'

export default function UsersPage() {
  const {
    currentUser,
    users,
    fetchUsers,
    updateUserStatus,
    releaseUser,
    isLoading: isAuthLoading,
  } = useAuthStore()
  const { companies, fetchCompanies } = useCompanyStore()
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearch = useDebounce(searchTerm, 300)

  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false)

  useEffect(() => {
    fetchUsers()
    fetchCompanies()
  }, [])

  const isSuperAdmin = currentUser?.isSuperAdmin

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      (u.phone && u.phone.includes(debouncedSearch))

    if (!matchesSearch) return false
    if (isSuperAdmin) return true
    return u.companyId === currentUser?.companyId
  })

  const handleApprove = async (id: string) => {
    await updateUserStatus(id, 'active')
    toast.success('Usuário ativado com sucesso')
  }

  const handleReject = async (id: string) => {
    await updateUserStatus(id, 'blocked')
    toast.info('Usuário bloqueado')
  }

  const handleEditClick = (user: User) => {
    setSelectedUser(user)
    setIsEditDialogOpen(true)
  }

  const handleReleaseToggle = async (user: User) => {
    const newAccessAllowed = !user.accessAllowed
    const newStatus = newAccessAllowed ? 'active' : 'expired'
    const result = await releaseUser(user.id, newAccessAllowed, newStatus)
    if (result.success) {
      toast.success(
        newAccessAllowed ? 'Acesso liberado com sucesso!' : 'Acesso bloqueado!',
      )
    } else {
      toast.error('Erro ao atualizar acesso do usuário')
    }
  }

  const canEditUser = (targetUser: User) => {
    if (isSuperAdmin) return true
    if (targetUser.id === currentUser?.id) return false
    if (targetUser.isSuperAdmin) return false
    return true
  }

  const canManageAccess = (targetUser: User) => {
    if (!canEditUser(targetUser)) return false
    if (targetUser.role === 'ADMIN' || targetUser.isSuperAdmin) return false
    return true
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col space-y-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          Gestão de Usuários
        </h1>
        <p className="text-muted-foreground">
          Gerencie o acesso, permissões e assinaturas dos usuários do sistema.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por Nome, Email ou Telefone..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button onClick={() => setIsInviteDialogOpen(true)}>
          <Users className="w-4 h-4 mr-2" />
          Novo Usuário
        </Button>
      </div>

      <div className="border rounded-md bg-white flex-1 overflow-auto shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50 sticky top-0">
              <TableHead>Usuário</TableHead>
              {isSuperAdmin && <TableHead>Empresa</TableHead>}
              <TableHead>Função</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Assinatura</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isAuthLoading && users.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={isSuperAdmin ? 6 : 5}
                  className="h-24 text-center"
                >
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={isSuperAdmin ? 6 : 5}
                  className="h-24 text-center text-muted-foreground"
                >
                  <div className="flex flex-col items-center justify-center py-6">
                    <Users className="w-10 h-10 text-slate-300 mb-2" />
                    <p>Nenhum usuário encontrado.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => {
                const canEdit = canEditUser(user)
                const canRelease = canManageAccess(user)
                const companyName =
                  companies.find((c) => c.id === user.companyId)
                    ?.nome_fantasia || '-'

                return (
                  <TableRow key={user.id} className="hover:bg-slate-50">
                    <TableCell className="flex items-center gap-3">
                      <Avatar className="h-9 w-9 border bg-white">
                        <AvatarImage
                          src={user.avatarUrl || undefined}
                          className="object-cover"
                        />
                        <AvatarFallback className="bg-slate-100">
                          {user.name[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {user.email}
                        </div>
                      </div>
                    </TableCell>

                    {isSuperAdmin && (
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">
                            {companyName}
                          </span>
                          <span className="text-xs text-muted-foreground font-mono">
                            {user.companyId?.slice(0, 8)}...
                          </span>
                        </div>
                      </TableCell>
                    )}

                    <TableCell>
                      <Badge
                        variant="outline"
                        className="font-normal bg-slate-50"
                      >
                        {user.role}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn(
                          user.status === 'active'
                            ? 'bg-green-50 text-green-700 border-green-200'
                            : user.status === 'pending'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-red-50 text-red-700 border-red-200',
                        )}
                      >
                        {user.status === 'active'
                          ? 'Ativo'
                          : user.status === 'pending'
                            ? 'Pendente'
                            : 'Bloqueado'}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      {user.isSuperAdmin || user.role === 'ADMIN' ? (
                        <Badge
                          variant="outline"
                          className="bg-blue-50 text-blue-700 border-blue-200"
                        >
                          Total
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className={cn(
                            user.accessAllowed &&
                              user.subscriptionStatus === 'active'
                              ? 'bg-green-50 text-green-700 border-green-200'
                              : user.subscriptionStatus === 'expired'
                                ? 'bg-red-50 text-red-700 border-red-200'
                                : 'bg-amber-50 text-amber-700 border-amber-200',
                          )}
                        >
                          {user.accessAllowed &&
                          user.subscriptionStatus === 'active'
                            ? 'Acesso Liberado'
                            : user.subscriptionStatus === 'expired'
                              ? 'Expirado'
                              : 'Aguardando Pagamento'}
                        </Badge>
                      )}
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {canEdit && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditClick(user)}
                              title="Editar Usuário"
                            >
                              <Pencil className="w-3 h-3 mr-2" />
                              Editar
                            </Button>

                            {canRelease && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleReleaseToggle(user)}
                                className={cn(
                                  'h-9 w-9',
                                  user.accessAllowed
                                    ? 'text-amber-600 hover:text-amber-700 hover:bg-amber-50'
                                    : 'text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50',
                                )}
                                title={
                                  user.accessAllowed
                                    ? 'Bloquear Acesso'
                                    : 'Liberar Usuário'
                                }
                              >
                                <CircleDollarSign className="w-4 h-4" />
                              </Button>
                            )}

                            {user.status === 'active' ? (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleReject(user.id)}
                                className="text-amber-600 hover:text-amber-700 hover:bg-amber-50 h-9 w-9"
                                title="Bloquear Acesso"
                              >
                                <Lock className="w-4 h-4" />
                              </Button>
                            ) : (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleApprove(user.id)}
                                className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 h-9 w-9"
                                title="Restaurar Acesso"
                              >
                                <Unlock className="w-4 h-4" />
                              </Button>
                            )}
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      <UserEditDialog
        user={selectedUser}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        companies={companies}
        isSuperAdmin={isSuperAdmin}
      />

      <UserInviteDialog
        open={isInviteDialogOpen}
        onOpenChange={setIsInviteDialogOpen}
        companies={companies}
        isSuperAdmin={isSuperAdmin}
        currentCompanyId={currentUser?.companyId}
      />
    </div>
  )
}
