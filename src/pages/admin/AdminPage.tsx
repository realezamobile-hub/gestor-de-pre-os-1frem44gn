import { useEffect } from 'react'
import { useAuthStore } from '@/stores/useAuthStore'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  UserCheck,
  ShieldAlert,
  Activity,
  RefreshCcw,
  Globe,
} from 'lucide-react'
import { Navigate } from 'react-router-dom'
import { UserManagement } from '@/components/admin/UserManagement'
import { PendingRequests } from '@/components/admin/PendingRequests'
import { DomainSettings } from '@/components/admin/DomainSettings'

export default function AdminPage() {
  const { users, fetchUsers, currentUser } = useAuthStore()

  useEffect(() => {
    fetchUsers()
  }, [])

  if (currentUser?.role !== 'admin') {
    return <Navigate to="/" replace />
  }

  const pendingUsers = users.filter((u) => u.status === 'pending')

  return (
    <div className="space-y-8 pb-12">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Administração</h1>
          <p className="text-muted-foreground mt-1">
            Painel de controle de usuários e acessos.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => fetchUsers()}>
          <RefreshCcw className="w-4 h-4 mr-2" />
          Atualizar Lista
        </Button>
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
          </CardContent>
        </Card>
        <Card className="shadow-sm border-emerald-200 bg-emerald-50/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-emerald-900">
              Usuários Recentes
            </CardTitle>
            <Activity className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-900">
              {
                users.filter(
                  (u) =>
                    new Date().getTime() - new Date(u.lastActive).getTime() <
                    24 * 60 * 60 * 1000,
                ).length
              }
            </div>
            <p className="text-xs text-emerald-700 mt-1">
              Ativos nas últimas 24h
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:w-[600px]">
          <TabsTrigger value="active">Gerenciar Usuários</TabsTrigger>
          <TabsTrigger value="pending" className="relative">
            Solicitações
            {pendingUsers.length > 0 && (
              <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-red-500 animate-pulse" />
            )}
          </TabsTrigger>
          <TabsTrigger value="domain" className="flex gap-2">
            <Globe className="w-4 h-4" />
            Domínio
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-6">
          <UserManagement />
        </TabsContent>

        <TabsContent value="pending" className="mt-6">
          <PendingRequests />
        </TabsContent>

        <TabsContent value="domain" className="mt-6">
          <DomainSettings />
        </TabsContent>
      </Tabs>
    </div>
  )
}
