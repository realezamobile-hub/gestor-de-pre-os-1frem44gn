import { useState, useEffect } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/stores/useAuthStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import { Loader2, Smartphone, AlertCircle, ShieldAlert } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email é obrigatório')
    .email('Formato de email inválido'),
  password: z.string().min(1, 'Senha é obrigatória'),
})

type LoginFormValues = z.infer<typeof loginSchema>

export default function LoginPage() {
  const [localLoading, setLocalLoading] = useState(false)
  const [sessionMessage, setSessionMessage] = useState<string | null>(null)
  const navigate = useNavigate()
  const location = useLocation()
  const { login, currentUser, isLoading, logout } = useAuthStore()

  useEffect(() => {
    const msg = sessionStorage.getItem('session_invalidated_message')
    if (msg) {
      setSessionMessage(msg)
      sessionStorage.removeItem('session_invalidated_message')
    }
  }, [])

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  useEffect(() => {
    if (!isLoading && currentUser) {
      if (currentUser.status === 'blocked') {
        logout()
        toast.error('Sua conta está bloqueada. Entre em contato com o suporte.')
        return
      }

      const isAdmin = currentUser.isSuperAdmin || currentUser.role === 'ADMIN'
      const from = (location.state as any)?.from?.pathname || '/'

      if (currentUser.status === 'active' || isAdmin) {
        const isExpired =
          currentUser.accessExpiresAt &&
          new Date(currentUser.accessExpiresAt) < new Date()
        if (
          !isAdmin &&
          (!currentUser.accessAllowed ||
            currentUser.subscriptionStatus === 'expired' ||
            isExpired)
        ) {
          navigate('/access-denied', { replace: true })
        } else {
          navigate(from, { replace: true })
        }
      } else if (currentUser.status === 'pending') {
        navigate('/pending', { replace: true })
      }
    }
  }, [currentUser, isLoading, navigate, logout, location])

  const onSubmit = async (data: LoginFormValues) => {
    setLocalLoading(true)
    form.clearErrors('root')

    try {
      const result = await login(data.email, data.password)
      if (result.success) {
        toast.success('Login realizado com sucesso!')
      } else {
        const msg = result.error?.message?.toLowerCase() || ''
        if (msg.includes('invalid login credentials')) {
          form.setError('root', {
            message: 'Email ou senha incorretos. Verifique suas credenciais.',
          })
        } else {
          form.setError('root', {
            message:
              'Ocorreu um erro ao tentar fazer login. Tente novamente mais tarde.',
          })
        }
      }
    } catch (error) {
      form.setError('root', {
        message: 'Ocorreu um erro inesperado. Tente novamente.',
      })
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
          <CardTitle className="text-2xl font-bold text-center text-primary flex items-center justify-center gap-2">
            <div className="w-8 h-8 rounded bg-primary flex items-center justify-center text-white">
              <Smartphone className="w-5 h-5" />
            </div>
            RMcell
          </CardTitle>
          <CardDescription className="text-center">
            Entre com seu email para acessar o painel
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              {sessionMessage && (
                <Alert
                  variant="destructive"
                  className="bg-amber-50 text-amber-900 border-amber-200 flex items-start py-3"
                >
                  <ShieldAlert className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                  <AlertDescription className="ml-2 font-medium">
                    {sessionMessage}
                  </AlertDescription>
                </Alert>
              )}
              {form.formState.errors.root && (
                <Alert
                  variant="destructive"
                  className="bg-red-50 text-red-900 border-red-200 flex items-start py-3"
                >
                  <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 shrink-0" />
                  <AlertDescription className="ml-2 font-medium">
                    {form.formState.errors.root.message}
                  </AlertDescription>
                </Alert>
              )}

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="exemplo@email.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel>Senha</FormLabel>
                      <Link
                        to="/forgot-password"
                        className="text-sm font-medium text-primary hover:underline"
                      >
                        Esqueci minha senha
                      </Link>
                    </div>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
        </Form>
      </Card>
    </div>
  )
}
