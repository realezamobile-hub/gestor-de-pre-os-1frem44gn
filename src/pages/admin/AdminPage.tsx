import { useAuthStore } from '@/stores/useAuthStore'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  UserCheck,
  UserX,
  ShieldAlert,
  Power,
  Activity,
  Lock,
  Unlock,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { toast } from 'sonner'
import { Navigate } from 'react-router-dom'

export default function AdminPage() {
  const { users, updateUserStatus, killSession, currentUser } = useAuthStore()

  if (currentUser?.role !== 'admin') {
    return <Navigate to="/" replace />
  }

  const handleApprove = (id: string) => {
    updateUserStatus(id, 'active')
    toast.success('Usuário aprovado com sucesso')
  }

  const handleReject = (id: string) => {
    updateUserStatus(id, 'blocked')
    toast.info('Usuário bloqueado')
  }

  const handleKillSession = (id: string) => {
    killSession(id)
    toast.warning('Sessão do usuário derrubada')
  }

  const pendingUsers = users.filter((u) => u.status === 'pending')
  const activeUsers = users.filter((u) => u.status !== 'pending')

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Administração</h1>
        <p className="text-muted-foreground mt-1">
          Painel de controle de usuários e acessos.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Usuários
            </CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Registrados na plataforma
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-amber-200 bg-amber-50/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-amber-900">
              Aprovações Pendentes
            </CardTitle>
            <ShieldAlert className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-900">
              {pendingUsers.length}
            </div>
            <p className="text-xs text-amber-700 mt-1">Aguardando liberação</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-emerald-200 bg-emerald-50/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-emerald-900">
              Usuários Online
            </CardTitle>
            <Activity className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-900">
              {
                users.filter(
                  (u) =>
                    u.currentSessionId &&
                    new Date().getTime() - new Date(u.lastActive).getTime() <
                      300000,
                ).length
              }
            </div>
            <p className="text-xs text-emerald-700 mt-1">
              Ativos nos últimos 5 min
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
          <TabsTrigger value="active">Gerenciar Usuários</TabsTrigger>
          <TabsTrigger value="pending" className="relative">
            Solicitações
            {pendingUsers.length > 0 && (
              <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-red-500 animate-pulse" />
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Base de Usuários</CardTitle>
              <CardDescription>
                Gerencie o acesso e monitore a atividade dos usuários.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Atividade</TableHead>
                    <TableHead className="text-center">Sessão</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activeUsers.map((user) => {
                    const isOnline =
                      user.currentSessionId &&
                      new Date().getTime() -
                        new Date(user.lastActive).getTime() <
                        300000
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
                        <TableCell className="text-muted-foreground text-sm">
                          <div className="flex flex-col">
                            <span>
                              {formatDistanceToNow(new Date(user.lastActive), {
                                addSuffix: true,
                                locale: ptBR,
                              })}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          {isOnline ? (
                            <Badge
                              variant="secondary"
                              className="text-emerald-600 bg-emerald-50 border-0"
                            >
                              Online
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground text-xs">
                              Offline
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {user.id !== currentUser.id && (
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

                                {isOnline && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleKillSession(user.id)}
                                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                    title="Forçar Logout"
                                  >
                                    <Power className="w-4 h-4" />
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
        </TabsContent>

        <TabsContent value="pending" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Solicitações Pendentes</CardTitle>
              <CardDescription>
                Novos usuários aguardando aprovação para acessar o sistema.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {pendingUsers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
                  <UserCheck className="w-12 h-12 mb-3 text-gray-300" />
                  <p>Nenhuma solicitação pendente.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Usuário</TableHead>
                      <TableHead>Contato</TableHead>
                      <TableHead>Solicitado em</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>{user.name[0]}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div>{user.name}</div>
                              <div className="text-xs font-normal text-muted-foreground">
                                {user.email}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{user.phone || '-'}</TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-destructive hover:bg-destructive hover:text-white border-destructive/20"
                            onClick={() => handleReject(user.id)}
                          >
                            <UserX className="w-4 h-4 mr-2" /> Rejeitar
                          </Button>
                          <Button
                            size="sm"
                            className="bg-emerald-600 hover:bg-emerald-700"
                            onClick={() => handleApprove(user.id)}
                          >
                            <UserCheck className="w-4 h-4 mr-2" /> Aprovar
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
