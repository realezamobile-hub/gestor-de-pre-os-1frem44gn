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

const registerSchema = z
  .object({
    name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
    email: z.string().min(1, 'Email é obrigatório').email('Email inválido'),
    password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
    confirmPassword: z.string().min(1, 'Confirme sua senha'),
    phone: z.string().min(10, 'Telefone inválido'),
    address: z.string().min(5, 'Endereço obrigatório'),
    rg: z.string().min(5, 'RG obrigatório'),
    cpf: z.string().min(11, 'CPF obrigatório'),
    emergencyContactName: z.string().min(2, 'Nome do contato obrigatório'),
    emergencyContactPhone: z.string().min(10, 'Telefone do contato inválido'),
    avatarUrl: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  })

type RegisterFormValues = z.infer<typeof registerSchema>

export default function RegisterPage() {
  const navigate = useNavigate()
  const { register, currentUser, isLoading } = useAuthStore()
  const [localLoading, setLocalLoading] = useState(false)
  const [step, setStep] = useState(1)

  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [cropImage, setCropImage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
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
    },
    mode: 'onTouched',
  })

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
    form.setValue('avatarUrl', '')
    setCropImage(null)
  }

  const handlePresetSelect = (url: string) => {
    form.setValue('avatarUrl', url)
    setAvatarFile(null)
  }

  const handleNext = async () => {
    let fieldsToValidate: any[] = []
    if (step === 1) {
      fieldsToValidate = [
        'name',
        'email',
        'password',
        'confirmPassword',
        'phone',
      ]
    } else if (step === 2) {
      fieldsToValidate = [
        'address',
        'rg',
        'cpf',
        'emergencyContactName',
        'emergencyContactPhone',
      ]
    }

    const isValid = await form.trigger(fieldsToValidate)
    if (isValid) {
      setStep((prev) => prev + 1)
    }
  }

  const handleBack = () => {
    setStep((prev) => prev - 1)
  }

  const onSubmit = async (data: RegisterFormValues) => {
    setLocalLoading(true)

    try {
      const { confirmPassword, ...submitData } = data
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

  const avatarUrl = form.watch('avatarUrl')
  const name = form.watch('name')
  const avatarPreview = avatarFile
    ? URL.createObjectURL(avatarFile)
    : avatarUrl
      ? avatarUrl
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

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-4 pt-4">
              {step === 1 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome Completo</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Senha</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirmar Senha</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>WhatsApp</FormLabel>
                        <FormControl>
                          <Input
                            type="tel"
                            placeholder="(11) 99999-9999"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Endereço Completo</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Rua, Número, Bairro, Cidade - UF"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="rg"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>RG</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="cpf"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>CPF</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="border-t pt-2 mt-2">
                    <h4 className="text-sm font-medium mb-2 text-primary">
                      Contato de Emergência
                    </h4>
                    <div className="grid grid-cols-1 gap-3">
                      <FormField
                        control={form.control}
                        name="emergencyContactName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nome</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="emergencyContactPhone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Telefone</FormLabel>
                            <FormControl>
                              <Input type="tel" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
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
                          {name ? (
                            name[0].toUpperCase()
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
                    selectedAvatar={avatarUrl}
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
                {step < 3 ? (
                  <Button
                    className="flex-1"
                    type="button"
                    onClick={handleNext}
                    disabled={localLoading}
                  >
                    Próximo <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button
                    className="flex-1"
                    type="submit"
                    disabled={localLoading}
                  >
                    {localLoading && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Concluir Cadastro
                  </Button>
                )}
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
        </Form>
      </Card>
    </div>
  )
}
