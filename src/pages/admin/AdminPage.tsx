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
import { UserCheck, UserX, ShieldAlert, Power, Activity } from 'lucide-react'
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
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Administração</h1>
        <p className="text-muted-foreground">
          Gerencie usuários e acessos do sistema.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Usuários Totais
            </CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
            <ShieldAlert className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingUsers.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Online Agora</CardTitle>
            <Activity className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {
                users.filter(
                  (u) =>
                    u.currentSessionId &&
                    new Date().getTime() - new Date(u.lastActive).getTime() <
                      300000,
                ).length
              }
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="active" className="w-full">
        <TabsList>
          <TabsTrigger value="active">
            Usuários ({activeUsers.length})
          </TabsTrigger>
          <TabsTrigger value="pending">
            Pendentes
            {pendingUsers.length > 0 && (
              <Badge
                variant="destructive"
                className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-[10px]"
              >
                {pendingUsers.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Usuários Registrados</CardTitle>
              <CardDescription>
                Visão geral de todos os usuários com acesso à plataforma.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Visto por último</TableHead>
                    <TableHead>Sessão</TableHead>
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
                          <Avatar className="h-8 w-8">
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
                            variant={
                              user.status === 'blocked'
                                ? 'destructive'
                                : 'secondary'
                            }
                            className={
                              user.status === 'active'
                                ? 'bg-green-100 text-green-700'
                                : ''
                            }
                          >
                            {user.status === 'active' ? 'Ativo' : 'Bloqueado'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {formatDistanceToNow(new Date(user.lastActive), {
                            addSuffix: true,
                            locale: ptBR,
                          })}
                        </TableCell>
                        <TableCell>
                          {isOnline ? (
                            <Badge
                              variant="outline"
                              className="border-emerald-200 text-emerald-600 bg-emerald-50"
                            >
                              Online
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground text-xs">
                              -
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          {user.id !== currentUser.id && (
                            <>
                              {user.status === 'active' ? (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleReject(user.id)}
                                  className="text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                                >
                                  Bloquear
                                </Button>
                              ) : (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleApprove(user.id)}
                                  className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                                >
                                  Ativar
                                </Button>
                              )}

                              {isOnline && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleKillSession(user.id)}
                                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                  title="Derrubar sessão"
                                >
                                  <Power className="w-4 h-4" />
                                </Button>
                              )}
                            </>
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Solicitações de Acesso</CardTitle>
              <CardDescription>
                Aprove ou rejeite novos cadastros.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {pendingUsers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhuma solicitação pendente.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Usuário</TableHead>
                      <TableHead>Contato</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">
                          {user.name}
                          <br />
                          <span className="text-xs font-normal text-muted-foreground">
                            {user.email}
                          </span>
                        </TableCell>
                        <TableCell>{user.phone || '-'}</TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-destructive hover:bg-destructive hover:text-white"
                            onClick={() => handleReject(user.id)}
                          >
                            <UserX className="w-4 h-4 mr-1" /> Rejeitar
                          </Button>
                          <Button
                            size="sm"
                            className="bg-emerald-600 hover:bg-emerald-700"
                            onClick={() => handleApprove(user.id)}
                          >
                            <UserCheck className="w-4 h-4 mr-1" /> Aprovar
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
