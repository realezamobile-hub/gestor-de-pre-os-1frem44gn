import { useAuthStore } from '@/stores/useAuthStore'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { UserCheck, UserX } from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function PendingRequests() {
  const { users, updateUserStatus } = useAuthStore()

  const pendingUsers = users.filter((u) => u.status === 'pending')

  const handleApprove = async (id: string) => {
    await updateUserStatus(id, 'active')
    toast.success('Usuário aprovado com sucesso')
  }

  const handleReject = async (id: string) => {
    await updateUserStatus(id, 'blocked')
    toast.info('Usuário bloqueado')
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Solicitações Pendentes</CardTitle>
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
  )
}
