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
  Building2,
  ClipboardCheck,
  ArrowRight,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { UserManagement } from '@/components/admin/UserManagement'
import { PendingRequests } from '@/components/admin/PendingRequests'
import { DomainSettings } from '@/components/admin/DomainSettings'
import { BulkCleanup } from '@/components/admin/BulkCleanup'
import { SupplierBlacklist } from '@/components/admin/SupplierBlacklist'
import { PriceMonitor } from '@/components/admin/PriceMonitor'
import { CompanyManagement } from '@/components/admin/CompanyManagement'

export default function AdminPage() {
  // Use selectors to prevent unnecessary re-renders of the main page
  const currentUser = useAuthStore((state) => state.currentUser)
  const users = useAuthStore((state) => state.users)
  const fetchUsers = useAuthStore((state) => state.fetchUsers)

  const isSuperAdmin = currentUser?.isSuperAdmin
  const isAdmin = currentUser?.role === 'ADMIN' || isSuperAdmin

  useEffect(() => {
    if (isAdmin) {
      fetchUsers()
    }
  }, [isAdmin]) // fetchUsers is stable from store

  // Calculate stats safely even if empty
  const pendingUsers = users.filter((u) => u.status === 'pending')
  const activeRecentUsers = users.filter(
    (u) =>
      new Date().getTime() - new Date(u.lastActive).getTime() <
      24 * 60 * 60 * 1000,
  )

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Administração</h1>
          <p className="text-muted-foreground mt-1">
            Painel de controle de usuários, dados e configurações
            {isSuperAdmin ? ' globais' : ''}.
          </p>
        </div>
        <div className="flex gap-2">
          {isSuperAdmin && (
            <Button variant="secondary" size="sm" asChild>
              <Link to="/evaluation">
                <ClipboardCheck className="w-4 h-4 mr-2" />
                Módulo de Avaliação
                <ArrowRight className="w-3 h-3 ml-2 opacity-50" />
              </Link>
            </Button>
          )}
          {isAdmin && (
            <Button variant="outline" size="sm" onClick={() => fetchUsers()}>
              <RefreshCcw className="w-4 h-4 mr-2" />
              Atualizar Dados
            </Button>
          )}
        </div>
      </div>

      {isAdmin && (
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
                {activeRecentUsers.length}
              </div>
              <p className="text-xs text-emerald-700 mt-1">
                Ativos nas últimas 24h
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs
        defaultValue={isAdmin ? 'active' : 'maintenance'}
        className="w-full"
      >
        <div className="w-full overflow-x-auto pb-2">
          <TabsList className="flex w-full md:w-auto justify-start md:justify-center overflow-x-auto gap-1">
            {isAdmin && <TabsTrigger value="active">Usuários</TabsTrigger>}
            {isSuperAdmin && (
              <TabsTrigger value="companies" className="flex gap-2">
                <Building2 className="w-4 h-4" />
                Cadastros
              </TabsTrigger>
            )}
            {isAdmin && (
              <TabsTrigger value="pending" className="relative">
                Solicitações
                {pendingUsers.length > 0 && (
                  <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-red-500 animate-pulse" />
                )}
              </TabsTrigger>
            )}
            {isAdmin && (
              <TabsTrigger value="monitor" className="flex gap-2">
                <TrendingDown className="w-4 h-4" />
                Monitor
              </TabsTrigger>
            )}
            {isAdmin && (
              <TabsTrigger value="blacklist" className="flex gap-2">
                <Ban className="w-4 h-4" />
                Blacklist
              </TabsTrigger>
            )}
            {isAdmin && (
              <TabsTrigger value="domain" className="flex gap-2">
                <Globe className="w-4 h-4" />
                Domínio
              </TabsTrigger>
            )}
            <TabsTrigger
              value="maintenance"
              className="flex gap-2 text-red-600 data-[state=active]:text-red-700"
            >
              <Database className="w-4 h-4" />
              Manutenção
            </TabsTrigger>
          </TabsList>
        </div>

        {isAdmin && (
          <TabsContent value="active" className="mt-6 animate-fade-in">
            <UserManagement />
          </TabsContent>
        )}

        {isSuperAdmin && (
          <TabsContent value="companies" className="mt-6 animate-fade-in">
            <CompanyManagement />
          </TabsContent>
        )}

        {isAdmin && (
          <TabsContent value="pending" className="mt-6 animate-fade-in">
            <PendingRequests />
          </TabsContent>
        )}

        {isAdmin && (
          <TabsContent value="monitor" className="mt-6 animate-fade-in">
            <PriceMonitor />
          </TabsContent>
        )}

        {isAdmin && (
          <TabsContent value="blacklist" className="mt-6 animate-fade-in">
            <SupplierBlacklist />
          </TabsContent>
        )}

        {isAdmin && (
          <TabsContent value="domain" className="mt-6 animate-fade-in">
            <DomainSettings />
          </TabsContent>
        )}

        <TabsContent value="maintenance" className="mt-6 animate-fade-in">
          <BulkCleanup />
        </TabsContent>
      </Tabs>
    </div>
  )
}
