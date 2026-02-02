import { useState, useRef } from 'react'
import { useAuthStore } from '@/stores/useAuthStore'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Camera, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export function AvatarUpload() {
  const { currentUser, uploadAvatar } = useAuthStore()
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!currentUser) return null

  const initials = currentUser.name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error(
        'Por favor selecione um arquivo de imagem válido (JPG, PNG, WebP)',
      )
      return
    }

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      toast.error('Formato não suportado. Use JPG, PNG ou WebP.')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      // 5MB limit
      toast.error('A imagem deve ter no máximo 5MB')
      return
    }

    setIsUploading(true)
    try {
      const result = await uploadAvatar(file)
      if (result.success) {
        toast.success('Foto de perfil atualizada!')
      } else {
        console.error('Upload result error:', result.error)
        toast.error('Erro ao atualizar foto. Tente novamente.')
      }
    } catch (error) {
      console.error('Upload exception:', error)
      toast.error('Erro inesperado no upload')
    } finally {
      setIsUploading(false)
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const triggerClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative group cursor-pointer" onClick={triggerClick}>
        <Avatar className="h-32 w-32 border-4 border-white shadow-lg">
          <AvatarImage
            src={
              currentUser.avatarUrl ||
              `https://img.usecurling.com/ppl/medium?seed=${currentUser.id}`
            }
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

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept="image/png, image/jpeg, image/webp"
        className="hidden"
      />

      <Button
        variant="outline"
        size="sm"
        onClick={triggerClick}
        disabled={isUploading}
      >
        {isUploading ? 'Enviando...' : 'Alterar Foto'}
      </Button>
      <p className="text-xs text-muted-foreground text-center">
        Suporta JPG, PNG e WebP até 5MB.
      </p>
    </div>
  )
}
