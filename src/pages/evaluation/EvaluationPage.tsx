import { useEffect } from 'react'
import { useEvaluationStore } from '@/stores/useEvaluationStore'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { EvaluationChecklist } from '@/components/evaluation/EvaluationChecklist'
import { EvaluationHistory } from '@/components/evaluation/EvaluationHistory'
import { EvaluationConfig } from '@/components/evaluation/EvaluationConfig'
import { ClipboardCheck, History, Settings } from 'lucide-react'
import { useAuthStore } from '@/stores/useAuthStore'

export default function EvaluationPage() {
  const { fetchConfigs } = useEvaluationStore()
  const { currentUser } = useAuthStore()

  useEffect(() => {
    fetchConfigs()
  }, [])

  const canConfigure =
    currentUser?.role === 'ADMIN' || currentUser?.isSuperAdmin

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col space-y-4">
      <div className="flex flex-col">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          Avaliação Técnica
        </h1>
        <p className="text-muted-foreground">
          Realize avaliações, consulte histórico e configure parâmetros.
        </p>
      </div>

      <Tabs defaultValue="new" className="flex-1 flex flex-col overflow-hidden">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="new">
            <ClipboardCheck className="w-4 h-4 mr-2" />
            Nova Avaliação
          </TabsTrigger>
          <TabsTrigger value="history">
            <History className="w-4 h-4 mr-2" />
            Histórico
          </TabsTrigger>
          {canConfigure && (
            <TabsTrigger value="config">
              <Settings className="w-4 h-4 mr-2" />
              Configurações
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="new" className="flex-1 overflow-auto mt-4 p-1">
          <EvaluationChecklist />
        </TabsContent>

        <TabsContent value="history" className="flex-1 overflow-auto mt-4">
          <EvaluationHistory />
        </TabsContent>

        {canConfigure && (
          <TabsContent value="config" className="flex-1 overflow-auto mt-4">
            <EvaluationConfig />
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}
