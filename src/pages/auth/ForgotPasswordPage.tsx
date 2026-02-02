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
import { toast } from 'sonner'
import { Loader2, ArrowLeft, Mail } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSent, setIsSent] = useState(false)
  const { resetPasswordForEmail } = useAuthStore()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const result = await resetPasswordForEmail(email)
      if (result.success) {
        setIsSent(true)
        toast.success('Email de recuperação enviado!')
      } else {
        toast.error(result.error?.message || 'Erro ao enviar email')
      }
    } catch (error) {
      toast.error('Erro inesperado')
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
            <div className="text-center space-y-4 py-4">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <Mail className="w-8 h-8 text-blue-600" />
              </div>
              <p className="text-sm text-gray-600">
                Enviamos um email para <strong>{email}</strong> com instruções
                para redefinir sua senha.
              </p>
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
