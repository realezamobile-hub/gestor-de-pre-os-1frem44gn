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
import { Loader2, Upload, Camera, ArrowRight, ArrowLeft } from 'lucide-react'
import { ImageCropper } from '@/components/common/ImageCropper'
import { AvatarSelection } from '@/components/common/AvatarSelection'
import { Dialog, DialogContent } from '@/components/ui/dialog'

export default function RegisterPage() {
  const navigate = useNavigate()
  const { register, currentUser, isLoading } = useAuthStore()
  const [localLoading, setLocalLoading] = useState(false)
  const [step, setStep] = useState(1)

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: '',
    rg: '',
    cpf: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    avatarUrl: '',
  })

  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [cropImage, setCropImage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

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
      const reader = new FileReader()
      reader.onload = () => {
        setCropImage(reader.result as string)
      }
      reader.readAsDataURL(file)
      e.target.value = ''
    }
  }

  const handleCropComplete = (blob: Blob) => {
    const file = new File([blob], 'avatar.jpg', { type: 'image/jpeg' })
    setAvatarFile(file)
    setFormData((prev) => ({ ...prev, avatarUrl: '' }))
    setCropImage(null)
  }

  const handlePresetSelect = (url: string) => {
    setFormData((prev) => ({ ...prev, avatarUrl: url }))
    setAvatarFile(null)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setFormData((prev) => ({ ...prev, [id]: value }))
  }

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault()

    if (step === 1) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.email)) {
        toast.error('Por favor, insira um email válido.')
        return
      }

      if (formData.password.length < 6) {
        toast.error('A senha deve ter pelo menos 6 caracteres.')
        return
      }

      if (formData.password !== formData.confirmPassword) {
        toast.error('As senhas não coincidem.')
        return
      }
    }

    setStep((prev) => prev + 1)
  }

  const handleBack = () => {
    setStep((prev) => prev - 1)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLocalLoading(true)

    try {
      const { confirmPassword, ...submitData } = formData
      const result = await register({
        ...submitData,
        avatarFile,
      })

      if (result.success) {
        toast.success('Cadastro realizado com sucesso!')
        navigate('/pending')
      } else {
        let errorMsg = result.error?.message || 'Erro ao cadastrar'
        if (errorMsg.toLowerCase().includes('already registered')) {
          errorMsg = 'Este email já está cadastrado em nossa base.'
        }
        toast.error(errorMsg)
      }
    } catch (error) {
      toast.error('Erro ao realizar cadastro')
    } finally {
      setLocalLoading(false)
    }
  }

  const avatarPreview = avatarFile
    ? URL.createObjectURL(avatarFile)
    : formData.avatarUrl
      ? formData.avatarUrl
      : null

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <Dialog
        open={!!cropImage}
        onOpenChange={(open) => !open && setCropImage(null)}
      >
        <DialogContent className="sm:max-w-md">
          {cropImage && (
            <ImageCropper
              imageSrc={cropImage}
              onCropComplete={handleCropComplete}
              onCancel={() => setCropImage(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      <Card className="w-full max-w-lg shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center text-primary">
            Criar Conta
          </CardTitle>
          <CardDescription className="text-center">
            {step === 1
              ? 'Dados Pessoais'
              : step === 2
                ? 'Documentação e Endereço'
                : 'Foto de Perfil'}
          </CardDescription>
          <div className="flex justify-center gap-2 mt-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={`h-1.5 w-8 rounded-full transition-colors ${step >= i ? 'bg-primary' : 'bg-gray-200'}`}
              />
            ))}
          </div>
        </CardHeader>

        <form onSubmit={step === 3 ? handleSubmit : handleNext}>
          <CardContent className="space-y-4 pt-4">
            {step === 1 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome Completo</Label>
                  <Input
                    id="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">Senha</Label>
                    <Input
                      id="password"
                      type="password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      required
                      value={formData.confirmPassword}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">WhatsApp</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="(11) 99999-9999"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="space-y-2">
                  <Label htmlFor="address">Endereço Completo</Label>
                  <Input
                    id="address"
                    placeholder="Rua, Número, Bairro, Cidade - UF"
                    required
                    value={formData.address}
                    onChange={handleChange}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="rg">RG</Label>
                    <Input
                      id="rg"
                      required
                      value={formData.rg}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cpf">CPF</Label>
                    <Input
                      id="cpf"
                      required
                      value={formData.cpf}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div className="border-t pt-2 mt-2">
                  <h4 className="text-sm font-medium mb-2 text-primary">
                    Contato de Emergência
                  </h4>
                  <div className="grid grid-cols-1 gap-3">
                    <div className="space-y-1">
                      <Label htmlFor="emergencyContactName">Nome</Label>
                      <Input
                        id="emergencyContactName"
                        required
                        value={formData.emergencyContactName}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="emergencyContactPhone">Telefone</Label>
                      <Input
                        id="emergencyContactPhone"
                        type="tel"
                        required
                        value={formData.emergencyContactPhone}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="flex flex-col items-center justify-center gap-4">
                  <div
                    className="relative cursor-pointer group"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Avatar className="w-32 h-32 border-4 border-white shadow-md group-hover:ring-4 ring-primary/20 transition-all">
                      <AvatarImage
                        src={avatarPreview || ''}
                        className="object-cover"
                      />
                      <AvatarFallback className="bg-gray-100 text-gray-400 group-hover:text-primary transition-colors text-4xl">
                        {formData.name ? (
                          formData.name[0].toUpperCase()
                        ) : (
                          <Camera className="w-10 h-10" />
                        )}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Upload className="w-8 h-8 text-white" />
                    </div>
                    {avatarFile && (
                      <div className="absolute bottom-0 right-0 bg-primary text-white p-1 rounded-full border-2 border-white shadow-sm">
                        <Upload className="w-4 h-4" />
                      </div>
                    )}
                  </div>

                  <div className="text-center">
                    <Label
                      htmlFor="avatar-upload"
                      className="text-sm font-medium text-primary cursor-pointer hover:underline"
                    >
                      Carregar Foto Personalizada
                    </Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      Clique acima para upload e recorte
                    </p>
                  </div>

                  <Input
                    id="avatar-upload"
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/png, image/jpeg, image/webp"
                    onChange={handleFileChange}
                  />
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-muted-foreground">
                      Ou escolha um avatar
                    </span>
                  </div>
                </div>

                <AvatarSelection
                  selectedAvatar={formData.avatarUrl}
                  onSelect={handlePresetSelect}
                />
              </div>
            )}
          </CardContent>

          <CardFooter className="flex flex-col gap-4">
            <div className="flex w-full gap-3">
              {step > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  disabled={localLoading}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar
                </Button>
              )}
              <Button className="flex-1" type="submit" disabled={localLoading}>
                {localLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : step === 3 ? (
                  'Concluir Cadastro'
                ) : (
                  <>
                    Próximo <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>

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
