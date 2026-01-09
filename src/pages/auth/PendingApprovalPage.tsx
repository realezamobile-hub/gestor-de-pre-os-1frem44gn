import { Link } from 'react-router-dom'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Clock, CheckCircle2 } from 'lucide-react'

export default function PendingApprovalPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <Card className="w-full max-w-md shadow-lg text-center">
        <CardHeader>
          <div className="mx-auto w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mb-4">
            <Clock className="w-6 h-6 text-amber-600" />
          </div>
          <CardTitle className="text-2xl font-bold">
            Aprovação Pendente
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600">
            Seu cadastro foi recebido com sucesso! Para garantir a segurança da
            plataforma, um administrador precisa aprovar sua conta.
          </p>
          <div className="bg-blue-50 p-4 rounded-lg flex items-start gap-3 text-left">
            <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <p className="text-sm text-blue-800">
              Você receberá uma notificação ou poderá tentar fazer login
              novamente mais tarde.
            </p>
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
