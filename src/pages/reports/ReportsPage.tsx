import { useEffect } from 'react'
import { useReportStore } from '@/stores/useReportStore'
import { useAuthStore } from '@/stores/useAuthStore'
import { ReportFilters } from '@/components/reports/ReportFilters'
import { ReportSummary } from '@/components/reports/ReportSummary'
import { ReportCharts } from '@/components/reports/ReportCharts'
import { BarChart3, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'

export default function ReportsPage() {
  const { fetchReportData } = useReportStore()
  const { currentUser } = useAuthStore()

  useEffect(() => {
    fetchReportData()
  }, [])

  if (!currentUser?.isSuperAdmin && currentUser?.role !== 'ADMIN') {
    return (
      <div className="h-screen flex flex-col items-center justify-center space-y-4">
        <Lock className="w-16 h-16 text-gray-300" />
        <h2 className="text-2xl font-bold text-gray-900">Acesso Negado</h2>
        <p className="text-muted-foreground">
          Apenas administradores podem acessar relatórios.
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
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <BarChart3 className="w-8 h-8 text-primary" />
          Relatórios Gerenciais
        </h1>
        <p className="text-muted-foreground mt-1">
          Analise o desempenho das avaliações e perfil dos aparelhos.
        </p>
      </div>

      <ReportFilters />
      <ReportSummary />
      <ReportCharts />
    </div>
  )
}
