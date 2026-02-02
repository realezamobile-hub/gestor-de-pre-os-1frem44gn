import { useState, useEffect, useRef } from 'react'
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { toast } from 'sonner'
import { Loader2, Upload, Camera } from 'lucide-react'

export default function RegisterPage() {
  const navigate = useNavigate()
  const { register, currentUser, isLoading } = useAuthStore()
  const [localLoading, setLocalLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
  })
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Redirect if already logged in
  useEffect(() => {
    if (!isLoading && currentUser) {
      if (currentUser.status === 'active' || currentUser.role === 'ADMIN') {
        navigate('/')
      } else if (currentUser.status === 'pending') {
        navigate('/pending')
      }
    }
  }, [currentUser, isLoading, navigate])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        toast.error('Formato não suportado. Use JPG, PNG ou WebP.')
        return
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('A imagem deve ter no máximo 5MB')
        return
      }
      setAvatarFile(file)
      const objectUrl = URL.createObjectURL(file)
      setAvatarPreview(objectUrl)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLocalLoading(true)

    try {
      const result = await register(
        formData.name,
        formData.email,
        formData.password,
        formData.phone,
        avatarFile,
      )
      if (result.success) {
        toast.success('Cadastro realizado com sucesso!')
        navigate('/pending')
      } else {
        toast.error(result.error?.message || 'Erro ao cadastrar')
      }
    } catch (error) {
      toast.error('Erro ao realizar cadastro')
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
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center text-primary">
            Criar Conta
          </CardTitle>
          <CardDescription className="text-center">
            Preencha seus dados para solicitar acesso
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="flex flex-col items-center justify-center gap-3 pb-2">
              <div
                className="relative cursor-pointer group"
                onClick={() => fileInputRef.current?.click()}
              >
                <Avatar className="w-24 h-24 border-2 border-dashed border-gray-300 group-hover:border-primary transition-colors">
                  <AvatarImage
                    src={avatarPreview || ''}
                    className="object-cover"
                  />
                  <AvatarFallback className="bg-gray-50 text-gray-400 group-hover:text-primary transition-colors">
                    <Camera className="w-8 h-8" />
                  </AvatarFallback>
                </Avatar>
                <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Upload className="w-6 h-6 text-white" />
                </div>
              </div>
              <Label
                htmlFor="avatar-upload"
                className="text-xs text-muted-foreground cursor-pointer hover:text-primary"
                onClick={() => fileInputRef.current?.click()}
              >
                Adicionar foto de perfil (Opcional)
              </Label>
              <Input
                id="avatar-upload"
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/png, image/jpeg, image/webp"
                onChange={handleFileChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Nome Completo</Label>
              <Input
                id="name"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                required
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">WhatsApp</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="(11) 99999-9999"
                required
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button className="w-full" type="submit" disabled={localLoading}>
              {localLoading && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Solicitar Acesso
            </Button>
            <div className="text-center text-sm">
              Já tem conta?{' '}
              <Link
                to="/login"
                className="text-primary hover:underline font-medium"
              >
                Fazer Login
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
