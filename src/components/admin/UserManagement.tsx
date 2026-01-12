import { useAuthStore } from '@/stores/useAuthStore'
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
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
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
import { Role } from '@/types'
import { Label } from '@/components/ui/label'

export function UserManagement() {
  const {
    users,
    currentUser,
    updateUserStatus,
    toggleUserPermission,
    updateUserRole,
  } = useAuthStore()

  const activeUsers = users.filter((u) => u.status !== 'pending')

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
    permission: 'canCreateList' | 'canAccessEvaluation',
  ) => {
    await toggleUserPermission(id, permission)
    toast.success('Permissão atualizada')
  }

  const handleRoleChange = async (id: string, newRole: Role) => {
    await updateUserRole(id, newRole)
    toast.success(
      `Usuário promovido para ${newRole === 'admin' ? 'Administrador' : 'Usuário Padrão'}`,
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Base de Usuários</CardTitle>
        <CardDescription>
          Gerencie funções, permissões e acesso.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Usuário</TableHead>
              <TableHead>Função</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-center">Permissões</TableHead>
              <TableHead className="text-center">Último Acesso</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {activeUsers.map((user) => (
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
                <TableCell>
                  <Select
                    value={user.role}
                    onValueChange={(val: Role) =>
                      handleRoleChange(user.id, val)
                    }
                    disabled={user.id === currentUser?.id}
                  >
                    <SelectTrigger className="w-[130px] h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">Usuário</SelectItem>
                      <SelectItem value="admin">Administrador</SelectItem>
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
                  <div className="flex flex-col items-start gap-2 max-w-[150px] mx-auto">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={user.canCreateList}
                        onCheckedChange={() =>
                          handleTogglePermission(user.id, 'canCreateList')
                        }
                        disabled={user.id === currentUser?.id}
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
                          handleTogglePermission(user.id, 'canAccessEvaluation')
                        }
                        disabled={user.id === currentUser?.id}
                        id={`eval-${user.id}`}
                      />
                      <Label
                        htmlFor={`eval-${user.id}`}
                        className="text-xs font-normal cursor-pointer"
                      >
                        Avaliação
                      </Label>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(user.lastActive), {
                      addSuffix: true,
                      locale: ptBR,
                    })}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    {user.id !== currentUser?.id && (
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
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
