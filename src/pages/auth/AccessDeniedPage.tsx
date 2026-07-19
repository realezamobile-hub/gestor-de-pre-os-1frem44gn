import { Link } from 'react-router-dom'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ShieldX } from 'lucide-react'

export default function AccessDeniedPage() {
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
          <p className="text-gray-600">
            Seu acesso ainda não foi liberado. Para utilizar o sistema, é
            necessário confirmar o pagamento da sua assinatura.
          </p>
          <div className="bg-amber-50 p-4 rounded-lg text-left">
            <p className="text-sm text-amber-800">
              Entre em contato com o administrador responsável para liberar seu
              acesso após a confirmação do pagamento.
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
