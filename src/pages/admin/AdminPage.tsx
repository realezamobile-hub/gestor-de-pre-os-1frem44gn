import { useEffect } from 'react'
import { useAuthStore } from '@/stores/useAuthStore'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Lock,
  Users,
  ListChecks,
  Layers,
  ShieldCheck,
  Globe,
  Wrench,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'
import { CategoryConfig } from '@/components/evaluation/CategoryConfig'
import { ChecklistConfig } from '@/components/evaluation/ChecklistConfig'
import { BulkCleanup } from '@/components/admin/BulkCleanup'
import { DomainSettings } from '@/components/admin/DomainSettings'
import { SupplierBlacklist } from '@/components/admin/SupplierBlacklist'

export default function AdminPage() {
  const { currentUser, fetchUsers, users } = useAuthStore()

  useEffect(() => {
    if (currentUser?.role === 'ADMIN' || currentUser?.isSuperAdmin) {
      fetchUsers()
    }
  }, [currentUser])

  if (!currentUser?.isSuperAdmin && currentUser?.role !== 'ADMIN') {
    return (
      <div className="h-screen flex flex-col items-center justify-center space-y-4">
        <Lock className="w-16 h-16 text-gray-300" />
        <h2 className="text-2xl font-bold text-gray-900">Acesso Negado</h2>
        <p className="text-muted-foreground">
          Apenas administradores podem acessar esta área.
        </p>
        <Button asChild>
          <Link to="/">Voltar ao Painel</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Administração</h1>
        <p className="text-muted-foreground">
          Gerencie usuários, configurações e manutenção do sistema.
        </p>
      </div>

      <Tabs defaultValue="users" className="space-y-4">
        <div className="overflow-x-auto pb-2">
          <TabsList className="inline-flex">
            <TabsTrigger value="users">
              <Users className="w-4 h-4 mr-2" />
              Usuários
            </TabsTrigger>
            <TabsTrigger value="maintenance">
              <Wrench className="w-4 h-4 mr-2" />
              Manutenção
            </TabsTrigger>
            <TabsTrigger value="categories">
              <Layers className="w-4 h-4 mr-2" />
              Categorias
            </TabsTrigger>
            <TabsTrigger value="checklist">
              <ListChecks className="w-4 h-4 mr-2" />
              Itens Checklist
            </TabsTrigger>
            <TabsTrigger value="domain">
              <Globe className="w-4 h-4 mr-2" />
              Domínio
            </TabsTrigger>
            <TabsTrigger value="blacklist">
              <ShieldCheck className="w-4 h-4 mr-2" />
              Blacklist
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>Usuários do Sistema</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border bg-slate-50">
                <div className="p-8 text-center text-muted-foreground text-sm">
                  <div className="mb-4">
                    <Users className="w-12 h-12 mx-auto text-slate-300" />
                  </div>
                  <p className="font-medium text-lg text-slate-900">
                    {users.length} usuários cadastrados
                  </p>
                  <p className="mt-2">
                    O gerenciamento completo de usuários e permissões está
                    disponível no painel Supabase.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="maintenance">
          <BulkCleanup />
        </TabsContent>

        <TabsContent value="categories">
          <CategoryConfig />
        </TabsContent>

        <TabsContent value="checklist">
          <ChecklistConfig />
        </TabsContent>

        <TabsContent value="domain">
          <DomainSettings />
        </TabsContent>

        <TabsContent value="blacklist">
          <SupplierBlacklist />
        </TabsContent>
      </Tabs>
    </div>
  )
}
