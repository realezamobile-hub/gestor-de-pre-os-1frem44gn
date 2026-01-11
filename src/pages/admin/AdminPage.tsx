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
  Database,
  Ban,
  TrendingDown,
} from 'lucide-react'
import { Navigate } from 'react-router-dom'
import { UserManagement } from '@/components/admin/UserManagement'
import { PendingRequests } from '@/components/admin/PendingRequests'
import { DomainSettings } from '@/components/admin/DomainSettings'
import { BulkCleanup } from '@/components/admin/BulkCleanup'
import { SupplierBlacklist } from '@/components/admin/SupplierBlacklist'
import { PriceMonitor } from '@/components/admin/PriceMonitor'

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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Administração</h1>
          <p className="text-muted-foreground mt-1">
            Painel de controle de usuários, dados e monitoramento.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => fetchUsers()}>
          <RefreshCcw className="w-4 h-4 mr-2" />
          Atualizar Dados
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

      <Tabs defaultValue="monitor" className="w-full">
        <div className="w-full overflow-x-auto pb-2">
          <TabsList className="grid w-full min-w-[800px] grid-cols-6 md:w-auto">
            <TabsTrigger value="monitor" className="flex gap-2">
              <TrendingDown className="w-4 h-4" />
              Monitor
            </TabsTrigger>
            <TabsTrigger value="blacklist" className="flex gap-2">
              <Ban className="w-4 h-4" />
              Blacklist
            </TabsTrigger>
            <TabsTrigger value="active">Usuários</TabsTrigger>
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
            <TabsTrigger
              value="maintenance"
              className="flex gap-2 text-red-600 data-[state=active]:text-red-700"
            >
              <Database className="w-4 h-4" />
              Manutenção
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="monitor" className="mt-6 animate-fade-in">
          <PriceMonitor />
        </TabsContent>

        <TabsContent value="blacklist" className="mt-6 animate-fade-in">
          <SupplierBlacklist />
        </TabsContent>

        <TabsContent value="active" className="mt-6 animate-fade-in">
          <UserManagement />
        </TabsContent>

        <TabsContent value="pending" className="mt-6 animate-fade-in">
          <PendingRequests />
        </TabsContent>

        <TabsContent value="domain" className="mt-6 animate-fade-in">
          <DomainSettings />
        </TabsContent>

        <TabsContent value="maintenance" className="mt-6 animate-fade-in">
          <BulkCleanup />
        </TabsContent>
      </Tabs>
    </div>
  )
}
