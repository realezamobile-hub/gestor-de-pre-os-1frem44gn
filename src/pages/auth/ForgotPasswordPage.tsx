import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '@/stores/useAuthStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { toast } from 'sonner'
import { Loader2, ArrowLeft, Mail, Info } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSent, setIsSent] = useState(false)
  const { resetPasswordForEmail } = useAuthStore()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setIsLoading(true)

    try {
      const result = await resetPasswordForEmail(email)
      setIsSent(true)

      if (result.success) {
        toast.success('Solicitação processada com sucesso!')
      } else {
        // Prevent email enumeration attacks by silently logging the error
        console.error('Password reset error:', result.error)
      }
    } catch (error) {
      toast.error('Erro inesperado ao solicitar recuperação')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center text-primary">
            Recuperar Senha
          </CardTitle>
          <CardDescription className="text-center">
            {isSent
              ? 'Verifique sua caixa de entrada'
              : 'Digite seu email para receber um link de recuperação'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isSent ? (
            <div className="text-center space-y-6 py-4">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <Mail className="w-8 h-8 text-blue-600" />
              </div>
              <Alert className="bg-blue-50 border-blue-200 text-blue-800 text-left flex items-start">
                <Info className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                <AlertDescription className="ml-2 leading-relaxed text-sm">
                  Se o e-mail <strong>{email}</strong> existir em nossa base, um
                  link de recuperação será enviado com as instruções para
                  redefinir sua senha.
                </AlertDescription>
              </Alert>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="exemplo@email.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <Button className="w-full" type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Enviar Link de Recuperação
              </Button>
            </form>
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button
            variant="link"
            asChild
            className="text-sm text-muted-foreground"
          >
            <Link to="/login" className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Voltar para Login
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
