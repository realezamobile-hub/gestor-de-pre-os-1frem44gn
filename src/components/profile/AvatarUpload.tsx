import { useState, useRef } from 'react'
import { useAuthStore } from '@/stores/useAuthStore'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Camera, Loader2, Image as ImageIcon } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { ImageCropper } from '@/components/common/ImageCropper'
import { AvatarSelection } from '@/components/common/AvatarSelection'

export function AvatarUpload() {
  const { currentUser, uploadAvatar, updateProfile } = useAuthStore()
  const [isUploading, setIsUploading] = useState(false)
  const [cropImage, setCropImage] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!currentUser) return null

  const initials = currentUser.name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Por favor selecione um arquivo de imagem válido')
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      setCropImage(reader.result as string)
    }
    reader.readAsDataURL(file)
    // Clear input so same file can be selected again
    e.target.value = ''
  }

  const handleCropComplete = async (blob: Blob) => {
    setCropImage(null)
    setIsUploading(true)

    // Create file from blob
    const file = new File([blob], 'avatar.jpg', { type: 'image/jpeg' })

    try {
      const result = await uploadAvatar(file)
      if (result.success) {
        toast.success('Foto de perfil atualizada!')
        setIsDialogOpen(false)
      } else {
        toast.error('Erro ao atualizar foto')
      }
    } catch (error) {
      toast.error('Erro inesperado no upload')
    } finally {
      setIsUploading(false)
    }
  }

  const handlePresetSelect = async (url: string) => {
    setIsUploading(true)
    try {
      const result = await updateProfile({ avatarUrl: url })
      if (result.success) {
        toast.success('Avatar atualizado!')
        setIsDialogOpen(false)
      } else {
        toast.error('Erro ao atualizar avatar')
      }
    } catch (error) {
      toast.error('Erro inesperado')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <div className="flex flex-col items-center gap-4">
        <DialogTrigger asChild>
          <div className="relative group cursor-pointer">
            <Avatar className="h-32 w-32 border-4 border-white shadow-lg bg-white">
              <AvatarImage
                src={currentUser.avatarUrl || undefined}
                className="object-cover"
              />
              <AvatarFallback className="text-3xl bg-primary/10 text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>

            <div
              className={cn(
                'absolute inset-0 rounded-full flex items-center justify-center bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200',
                isUploading && 'opacity-100 bg-black/60',
              )}
            >
              {isUploading ? (
                <Loader2 className="w-8 h-8 animate-spin" />
              ) : (
                <Camera className="w-8 h-8" />
              )}
            </div>
          </div>
        </DialogTrigger>

        <DialogTrigger asChild>
          <Button variant="outline" size="sm" disabled={isUploading}>
            {isUploading ? 'Atualizando...' : 'Alterar Foto'}
          </Button>
        </DialogTrigger>

        <p className="text-xs text-muted-foreground text-center">
          Clique na foto para alterar.
        </p>
      </div>

      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Alterar Foto de Perfil</DialogTitle>
        </DialogHeader>

        {cropImage ? (
          <ImageCropper
            imageSrc={cropImage}
            onCropComplete={handleCropComplete}
            onCancel={() => setCropImage(null)}
          />
        ) : (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="font-medium text-sm text-muted-foreground flex items-center gap-2">
                <ImageIcon className="w-4 h-4" />
                Upload de Imagem
              </div>
              <div
                className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="flex flex-col items-center gap-2">
                  <div className="p-3 bg-primary/10 rounded-full">
                    <Camera className="w-6 h-6 text-primary" />
                  </div>
                  <div className="text-sm font-medium text-gray-900">
                    Clique para selecionar uma foto
                  </div>
                  <p className="text-xs text-muted-foreground">
                    JPG, PNG ou WebP. Máx 5MB.
                  </p>
                </div>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept="image/png, image/jpeg, image/webp"
                className="hidden"
              />
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Ou escolha um avatar
                </span>
              </div>
            </div>

            <AvatarSelection
              selectedAvatar={currentUser.avatarUrl}
              onSelect={handlePresetSelect}
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
