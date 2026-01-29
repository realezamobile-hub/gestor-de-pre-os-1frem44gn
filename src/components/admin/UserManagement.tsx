import { useEffect } from 'react'
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
import { Switch } from '@/components/ui/switch'
import { Lock, Unlock } from 'lucide-react'
import { toast } from 'sonner'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Role, User } from '@/types'
import { Label } from '@/components/ui/label'

export function UserManagement() {
  // Use precise selectors to avoid broad re-renders
  const users = useAuthStore((state) => state.users)
  const currentUser = useAuthStore((state) => state.currentUser)
  const updateUserStatus = useAuthStore((state) => state.updateUserStatus)
  const toggleUserPermission = useAuthStore(
    (state) => state.toggleUserPermission,
  )
  const updateUserRole = useAuthStore((state) => state.updateUserRole)
  const updateUserCompany = useAuthStore((state) => state.updateUserCompany)

  const { companies, fetchCompanies } = useCompanyStore()

  useEffect(() => {
    fetchCompanies()
  }, [])

  const activeUsers = users.filter((u) => u.status !== 'pending')
  const isSuperAdmin = currentUser?.isSuperAdmin

  const handleApprove = async (id: string) => {
    await updateUserStatus(id, 'active')
    toast.success('Usuário ativado com sucesso')
  }

  const handleReject = async (id: string) => {
    await updateUserStatus(id, 'blocked')
    toast.info('Usuário bloqueado')
  }

  const handleTogglePermission = async (
    id: string,
    permission:
      | 'canCreateList'
      | 'canAccessEvaluation'
      | 'canDeleteRecords'
      | 'canViewAllLists',
  ) => {
    await toggleUserPermission(id, permission)
    toast.success('Permissão atualizada')
  }

  const handleRoleChange = async (id: string, newRole: Role) => {
    await updateUserRole(id, newRole)
    toast.success(`Função atualizada para ${newRole}`)
  }

  const handleCompanyChange = async (id: string, companyId: string) => {
    await updateUserCompany(id, companyId)
    toast.success('Empresa do usuário atualizada')
  }

  // Helper to determine edit permissions
  const canEditUser = (targetUser: User) => {
    // Super Admins have unrestricted control (can edit everyone including themselves)
    if (isSuperAdmin) return true

    // Normal Admins cannot edit themselves (to prevent lockout) or Super Admins
    if (targetUser.id === currentUser?.id) return false
    if (targetUser.isSuperAdmin) return false

    // Normal Admins can edit other users
    return true
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Base de Usuários</CardTitle>
        <CardDescription>
          Gerencie funções, empresas e permissões.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Usuário</TableHead>
              {isSuperAdmin && <TableHead>Empresa</TableHead>}
              <TableHead>Função (Cargo)</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-center">Permissões Extras</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {activeUsers.map((user) => {
              const canEdit = canEditUser(user)
              return (
                <TableRow key={user.id}>
                  <TableCell className="flex items-center gap-3">
                    <Avatar className="h-9 w-9 border">
                      <AvatarImage
                        src={`https://img.usecurling.com/ppl/thumbnail?seed=${user.id}`}
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
                      <Select
                        value={user.companyId || ''}
                        onValueChange={(val) =>
                          handleCompanyChange(user.id, val)
                        }
                        disabled={!canEdit}
                      >
                        <SelectTrigger className="w-[140px] h-8">
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                        <SelectContent>
                          {companies.map((c) => (
                            <SelectItem key={c.id} value={c.id}>
                              {c.nome_fantasia}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                  )}

                  <TableCell>
                    <Select
                      value={user.role}
                      onValueChange={(val: Role) =>
                        handleRoleChange(user.id, val)
                      }
                      disabled={!canEdit}
                    >
                      <SelectTrigger className="w-[140px] h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ADMIN">Admin (Gestor)</SelectItem>
                        <SelectItem value="VENDEDOR">Vendedor</SelectItem>
                        <SelectItem value="TECNICO">Técnico</SelectItem>
                        <SelectItem value="ADMINISTRATIVO">
                          Administrativo
                        </SelectItem>
                      </SelectContent>
                    </Select>
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
                  <TableCell className="text-center">
                    <div className="flex flex-col items-start gap-2 max-w-[220px] mx-auto">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={user.canCreateList}
                          onCheckedChange={() =>
                            handleTogglePermission(user.id, 'canCreateList')
                          }
                          disabled={!canEdit}
                          id={`list-${user.id}`}
                        />
                        <Label
                          htmlFor={`list-${user.id}`}
                          className="text-xs font-normal cursor-pointer"
                        >
                          Criar Lista
                        </Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={user.canAccessEvaluation}
                          onCheckedChange={() =>
                            handleTogglePermission(
                              user.id,
                              'canAccessEvaluation',
                            )
                          }
                          disabled={!canEdit}
                          id={`eval-${user.id}`}
                        />
                        <Label
                          htmlFor={`eval-${user.id}`}
                          className="text-xs font-normal cursor-pointer"
                        >
                          Avaliação
                        </Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={user.canViewAllLists}
                          onCheckedChange={() =>
                            handleTogglePermission(user.id, 'canViewAllLists')
                          }
                          disabled={!canEdit}
                          id={`view-all-${user.id}`}
                          className="data-[state=checked]:bg-blue-600"
                        />
                        <Label
                          htmlFor={`view-all-${user.id}`}
                          className="text-xs font-normal cursor-pointer text-blue-700"
                        >
                          Ver Histórico Completo
                        </Label>
                      </div>
                      {isSuperAdmin && (
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={user.canDeleteRecords}
                            onCheckedChange={() =>
                              handleTogglePermission(
                                user.id,
                                'canDeleteRecords',
                              )
                            }
                            disabled={!canEdit}
                            id={`del-${user.id}`}
                            className="data-[state=checked]:bg-red-500"
                          />
                          <Label
                            htmlFor={`del-${user.id}`}
                            className="text-xs font-normal cursor-pointer text-red-700"
                          >
                            Deletar Dados
                          </Label>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {canEdit && (
                        <>
                          {user.status === 'active' ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleReject(user.id)}
                              className="text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                              title="Bloquear Acesso"
                            >
                              <Lock className="w-4 h-4 mr-1" />
                              Bloquear
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleApprove(user.id)}
                              className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                              title="Restaurar Acesso"
                            >
                              <Unlock className="w-4 h-4 mr-1" />
                              Ativar
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
