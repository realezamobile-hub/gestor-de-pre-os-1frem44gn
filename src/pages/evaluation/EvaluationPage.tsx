import { useEffect } from 'react'
import { EvaluationChecklist } from '@/components/evaluation/EvaluationChecklist'
import { useEvaluationStore } from '@/stores/useEvaluationStore'

export default function EvaluationPage() {
  const { fetchConfigs } = useEvaluationStore()

  useEffect(() => {
    fetchConfigs()
  }, [])

  return (
    <div className="h-[calc(100vh-4rem)]">
      <EvaluationChecklist />
    </div>
  )
}
