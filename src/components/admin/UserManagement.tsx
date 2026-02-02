import { useState, useEffect } from 'react'
import { useAuthStore } from '@/stores/useAuthStore'
import { useCompanyStore } from '@/stores/useCompanyStore'
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
import { Lock, Unlock, Pencil } from 'lucide-react'
import { toast } from 'sonner'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { User } from '@/types'
import { UserEditDialog } from './UserEditDialog'

export function UserManagement() {
  const users = useAuthStore((state) => state.users)
  const currentUser = useAuthStore((state) => state.currentUser)
  const updateUserStatus = useAuthStore((state) => state.updateUserStatus)

  const { companies, fetchCompanies } = useCompanyStore()
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  useEffect(() => {
    fetchCompanies()
  }, [])

  const isSuperAdmin = currentUser?.isSuperAdmin

  const filteredUsers = users.filter((u) => {
    if (u.status === 'pending') return false
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

  const canEditUser = (targetUser: User) => {
    if (isSuperAdmin) return true
    if (targetUser.id === currentUser?.id) return false
    if (targetUser.isSuperAdmin) return false
    return true
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Base de Usuários</CardTitle>
          <CardDescription>
            Gerencie funções, status e permissões de acesso dos usuários.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuário</TableHead>
                {isSuperAdmin && <TableHead>Empresa</TableHead>}
                <TableHead>Função</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={isSuperAdmin ? 5 : 4}
                    className="h-24 text-center text-muted-foreground"
                  >
                    Nenhum usuário encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => {
                  const canEdit = canEditUser(user)
                  const companyName =
                    companies.find((c) => c.id === user.companyId)
                      ?.nome_fantasia || '-'

                  return (
                    <TableRow key={user.id}>
                      <TableCell className="flex items-center gap-3">
                        <Avatar className="h-9 w-9 border bg-white">
                          <AvatarImage
                            src={user.avatarUrl || undefined}
                            className="object-cover"
                          />
                          <AvatarFallback>{user.name[0]}</AvatarFallback>
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
                          className={
                            user.status === 'active'
                              ? 'bg-green-50 text-green-700 border-green-200'
                              : 'bg-red-50 text-red-700 border-red-200'
                          }
                        >
                          {user.status === 'active' ? 'Ativo' : 'Bloqueado'}
                        </Badge>
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
                                <Pencil className="w-4 h-4 mr-2" />
                                Editar
                              </Button>

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
        </CardContent>
      </Card>

      <UserEditDialog
        user={selectedUser}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        companies={companies}
        isSuperAdmin={isSuperAdmin}
      />
    </>
  )
}
