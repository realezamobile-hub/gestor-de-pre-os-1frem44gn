import { useEffect } from 'react'
import { useAuthStore } from '@/stores/useAuthStore'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Lock, Users, ListChecks, Layers } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'
import { CategoryConfig } from '@/components/evaluation/CategoryConfig'
import { ChecklistConfig } from '@/components/evaluation/ChecklistConfig'

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
          Gerencie usuários e configurações do sistema.
        </p>
      </div>

      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users">
            <Users className="w-4 h-4 mr-2" />
            Usuários
          </TabsTrigger>
          <TabsTrigger value="categories">
            <Layers className="w-4 h-4 mr-2" />
            Categorias
          </TabsTrigger>
          <TabsTrigger value="checklist">
            <ListChecks className="w-4 h-4 mr-2" />
            Itens do Checklist
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>Usuários do Sistema</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <div className="p-4 text-center text-muted-foreground text-sm">
                  {users.length} usuários cadastrados.
                  <br />O gerenciamento completo de usuários está disponível no
                  painel Supabase.
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories">
          <CategoryConfig />
        </TabsContent>

        <TabsContent value="checklist">
          <ChecklistConfig />
        </TabsContent>
      </Tabs>
    </div>
  )
}
