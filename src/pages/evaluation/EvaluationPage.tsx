import { useEffect } from 'react'
import { useEvaluationStore } from '@/stores/useEvaluationStore'
import { useAuthStore } from '@/stores/useAuthStore'
import { EvaluationConfig } from '@/components/evaluation/EvaluationConfig'
import { EvaluationChecklist } from '@/components/evaluation/EvaluationChecklist'
import { EvaluationHistory } from '@/components/evaluation/EvaluationHistory'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { ClipboardCheck, History, Settings2, ShieldAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'

export default function EvaluationPage() {
  const { fetchConfigs } = useEvaluationStore()
  const { currentUser } = useAuthStore()

  useEffect(() => {
    fetchConfigs()
  }, [])

  if (!currentUser?.canAccessEvaluation && currentUser?.role !== 'admin') {
    return (
      <div className="h-full flex flex-col items-center justify-center space-y-4">
        <ShieldAlert className="w-16 h-16 text-gray-300" />
        <h2 className="text-2xl font-bold text-gray-900">Acesso Restrito</h2>
        <p className="text-muted-foreground text-center max-w-md">
          Você não tem permissão para acessar o módulo de avaliação.
          <br />
          Solicite acesso ao administrador.
        </p>
        <Button asChild>
          <Link to="/">Voltar ao Painel</Link>
        </Button>
      </div>
    )
  }

  const isAdmin = currentUser?.role === 'admin'

  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3 text-gray-900">
          <ClipboardCheck className="w-8 h-8 text-primary" />
          Avaliação Técnica
        </h1>
        <p className="text-muted-foreground mt-1">
          Inspeção guiada, cálculo de preço e histórico de avaliações.
        </p>
      </div>

      <Tabs defaultValue="new" className="flex-1 flex flex-col min-h-0">
        <div className="flex items-center justify-between mb-4">
          <TabsList className="grid grid-cols-2 md:grid-cols-3 w-full md:w-auto">
            <TabsTrigger value="new">
              <ClipboardCheck className="w-4 h-4 mr-2" />
              Nova Avaliação
            </TabsTrigger>
            <TabsTrigger value="history">
              <History className="w-4 h-4 mr-2" />
              Histórico
            </TabsTrigger>
            {isAdmin && (
              <TabsTrigger value="config">
                <Settings2 className="w-4 h-4 mr-2" />
                Configurações
              </TabsTrigger>
            )}
          </TabsList>
        </div>

        <TabsContent value="new" className="flex-1 min-h-0 mt-0">
          <EvaluationChecklist />
        </TabsContent>

        <TabsContent value="history" className="flex-1 overflow-auto mt-0">
          <EvaluationHistory />
        </TabsContent>

        {isAdmin && (
          <TabsContent value="config" className="flex-1 overflow-auto mt-0">
            <EvaluationConfig />
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}
