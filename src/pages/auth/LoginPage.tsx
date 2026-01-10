import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
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
import { Loader2 } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [localLoading, setLocalLoading] = useState(false)
  const navigate = useNavigate()
  const { login, currentUser, isLoading, logout } = useAuthStore()

  // Redirect if already logged in
  useEffect(() => {
    if (!isLoading && currentUser) {
      if (currentUser.status === 'active' || currentUser.role === 'admin') {
        navigate('/')
      } else if (currentUser.status === 'pending') {
        navigate('/pending')
      } else if (currentUser.status === 'blocked') {
        // If user is blocked but has a session, logout force them out
        logout()
        toast.error('Sua conta está bloqueada. Entre em contato com o suporte.')
      }
    }
  }, [currentUser, isLoading, navigate, logout])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLocalLoading(true)

    try {
      const result = await login(email, password)
      if (result.success) {
        toast.success('Login realizado com sucesso!')
        navigate('/')
      } else {
        toast.error(result.error?.message || 'Erro ao realizar login')
      }
    } catch (error) {
      toast.error('Erro inesperado')
    } finally {
      setLocalLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center text-primary">
            PriceApp
          </CardTitle>
          <CardDescription className="text-center">
            Entre com seu email para acessar o painel
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
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
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button className="w-full" type="submit" disabled={localLoading}>
              {localLoading && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Entrar
            </Button>
            <div className="text-center text-sm">
              Não tem uma conta?{' '}
              <Link
                to="/register"
                className="text-primary hover:underline font-medium"
              >
                Registrar-se
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
