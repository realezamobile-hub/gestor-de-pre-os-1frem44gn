import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { AvatarUpload } from '@/components/profile/AvatarUpload'
import { ProfileForm } from '@/components/profile/ProfileForm'
import { UserCircle } from 'lucide-react'

export default function ProfilePage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <UserCircle className="w-8 h-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Meu Perfil
          </h1>
          <p className="text-muted-foreground">
            Gerencie suas informações pessoais e foto de perfil.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column - Avatar */}
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Foto de Perfil</CardTitle>
              <CardDescription>
                Esta imagem será visível para outros usuários.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AvatarUpload />
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Details Form */}
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informações Pessoais</CardTitle>
              <CardDescription>
                Atualize seus dados de cadastro.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProfileForm />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
