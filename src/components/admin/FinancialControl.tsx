import { useEffect } from 'react'
import { useAuthStore } from '@/stores/useAuthStore'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Gift } from 'lucide-react'
import { cn } from '@/lib/utils'
import { OnlineUsers } from '@/components/admin/OnlineUsers'

export function FinancialControl() {
  const { users, fetchUsers, adminUpdateUser, grantTrial } = useAuthStore()

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const handleToggleAccess = async (userId: string, current: boolean) => {
    const result = await adminUpdateUser(userId, {
      accessAllowed: !current,
    })
    if (result.success) {
      toast.success(!current ? 'Acesso liberado!' : 'Acesso revogado!')
    } else {
      toast.error('Erro ao atualizar acesso')
    }
  }

  const handleSetExpiration = async (userId: string, date: string) => {
    const isoDate = date ? new Date(date).toISOString() : null
    const result = await adminUpdateUser(userId, {
      accessExpiresAt: isoDate,
    })
    if (!result.success) {
      toast.error('Erro ao atualizar data de expiração')
    }
  }

  const handleGrantTrial = async (userId: string) => {
    const result = await grantTrial(userId)
    if (result.success) {
      toast.success('Trial de 10 dias concedido com sucesso!')
    } else {
      toast.error('Erro ao conceder trial')
    }
  }

  const isPrivileged = (role: string, isSuperAdmin: boolean) =>
    isSuperAdmin || role === 'ADMIN'

  return (
    <div className="space-y-6">
      <OnlineUsers />
      <Card>
        <CardHeader>
          <CardTitle>Controle Financeiro de Acesso</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Acesso</TableHead>
                  <TableHead>Expira em</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {user.email}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn(
                          user.subscriptionStatus === 'active'
                            ? 'bg-green-50 text-green-700 border-green-200'
                            : user.subscriptionStatus === 'expired'
                              ? 'bg-red-50 text-red-700 border-red-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200',
                        )}
                      >
                        {user.subscriptionStatus === 'active'
                          ? 'Ativo'
                          : user.subscriptionStatus === 'expired'
                            ? 'Expirado'
                            : 'Pendente'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={!!user.accessAllowed}
                        onCheckedChange={() =>
                          handleToggleAccess(user.id, !!user.accessAllowed)
                        }
                        disabled={isPrivileged(user.role, user.isSuperAdmin)}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="date"
                        value={
                          user.accessExpiresAt
                            ? new Date(user.accessExpiresAt)
                                .toISOString()
                                .split('T')[0]
                            : ''
                        }
                        onChange={(e) =>
                          handleSetExpiration(user.id, e.target.value)
                        }
                        className="w-[150px]"
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleGrantTrial(user.id)}
                        disabled={isPrivileged(user.role, user.isSuperAdmin)}
                      >
                        <Gift className="w-3 h-3 mr-2" />
                        Trial 10 dias
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
