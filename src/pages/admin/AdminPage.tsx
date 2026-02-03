import { useEffect } from 'react'
import { useAuthStore } from '@/stores/useAuthStore'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Lock, ShieldCheck, Globe, Wrench } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'
import { BulkCleanup } from '@/components/admin/BulkCleanup'
import { DomainSettings } from '@/components/admin/DomainSettings'
import { SupplierBlacklist } from '@/components/admin/SupplierBlacklist'

export default function AdminPage() {
  const { currentUser, fetchUsers } = useAuthStore()

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
        <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
        <p className="text-muted-foreground">
          Gerencie as configurações gerais do sistema e manutenção.
        </p>
      </div>

      <Tabs defaultValue="maintenance" className="space-y-4">
        <div className="overflow-x-auto pb-2">
          <TabsList className="inline-flex">
            <TabsTrigger value="maintenance">
              <Wrench className="w-4 h-4 mr-2" />
              Manutenção
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

        <TabsContent value="maintenance">
          <BulkCleanup />
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
