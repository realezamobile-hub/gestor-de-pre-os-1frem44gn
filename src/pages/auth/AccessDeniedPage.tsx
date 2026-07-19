import { Link } from 'react-router-dom'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ShieldX, Clock, CreditCard } from 'lucide-react'

export default function AccessDeniedPage() {
  const msg = sessionStorage.getItem('session_invalidated_message')
  const displayMessage = msg || 'Seu acesso ao sistema está restrito.'

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <Card className="w-full max-w-md shadow-lg text-center">
        <CardHeader>
          <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <ShieldX className="w-6 h-6 text-red-600" />
          </div>
          <CardTitle className="text-2xl font-bold">Acesso Restrito</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600">{displayMessage}</p>
          <div className="space-y-3 text-left">
            <div className="flex items-start gap-3 bg-amber-50 p-3 rounded-lg">
              <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-900">
                  Período Expirado
                </p>
                <p className="text-xs text-amber-700">
                  Seu trial ou assinatura mensal pode ter expirado.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 bg-blue-50 p-3 rounded-lg">
              <CreditCard className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-900">Renovação</p>
                <p className="text-xs text-blue-700">
                  Entre em contato com o administrador para renovar seu acesso
                  após a confirmação do pagamento.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button asChild variant="outline" className="w-full">
            <Link to="/login">Voltar para Login</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
