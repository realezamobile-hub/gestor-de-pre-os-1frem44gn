import { useState, useEffect } from 'react'
import { useClientStore } from '@/stores/useClientStore'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Search,
  Plus,
  User,
  Pencil,
  History,
  MapPin,
  Phone,
  Mail,
  Files,
} from 'lucide-react'
import { formatPhone, formatCPF } from '@/lib/utils'
import { ClientForm } from '@/components/clients/ClientForm'
import { ClientHistory } from '@/components/clients/ClientHistory'
import { ClientFiles } from '@/components/clients/ClientFiles'
import { useDebounce } from '@/hooks/use-debounce'
import { toast } from 'sonner'
import { Client } from '@/types'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'

export default function ClientsPage() {
  const { clients, searchClients, isLoading, createClient, updateClient } =
    useClientStore()
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearch = useDebounce(searchTerm, 500)

  // State for Dialogs/Sheets
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  const [viewingClient, setViewingClient] = useState<Client | null>(null)

  useEffect(() => {
    searchClients(debouncedSearch)
  }, [debouncedSearch])

  const handleCreate = async (data: any) => {
    const result = await createClient(data)
    if (result.success) {
      setIsCreateOpen(false)
      return true
    } else {
      toast.error('Erro ao cadastrar: ' + (result.error?.message || ''))
      return false
    }
  }

  const handleUpdate = async (data: any) => {
    if (!editingClient) return false
    const result = await updateClient(editingClient.id, data)
    if (result.success) {
      setEditingClient(null)
      // Update view if open
      if (viewingClient?.id === editingClient.id) {
        setViewingClient({ ...viewingClient, ...data })
      }
      return true
    } else {
      toast.error('Erro ao atualizar: ' + (result.error?.message || ''))
      return false
    }
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Gestão de Clientes
          </h1>
          <p className="text-muted-foreground">
            Cadastre, edite e visualize o histórico de seus clientes.
          </p>
        </div>
        <Button
          onClick={() => setIsCreateOpen(true)}
          className="bg-primary shadow-sm"
        >
          <Plus className="w-4 h-4 mr-2" /> Novo Cliente
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por Nome ou CPF..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="border rounded-md bg-white flex-1 overflow-auto shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50 sticky top-0">
              <TableHead className="w-[80px]">Foto</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>CPF</TableHead>
              <TableHead>Contato</TableHead>
              <TableHead>Local</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  </div>
                </TableCell>
              </TableRow>
            ) : clients.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-24 text-center text-muted-foreground"
                >
                  Nenhum cliente encontrado.
                </TableCell>
              </TableRow>
            ) : (
              clients.map((client) => (
                <TableRow key={client.id} className="hover:bg-slate-50">
                  <TableCell>
                    <Avatar className="h-10 w-10 border border-slate-200">
                      <AvatarImage
                        src={client.url_foto || undefined}
                        className="object-cover"
                      />
                      <AvatarFallback className="bg-slate-100">
                        {client.nome[0]}
                      </AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell className="font-medium">{client.nome}</TableCell>
                  <TableCell>{formatCPF(client.cpf)}</TableCell>
                  <TableCell>{formatPhone(client.telefone)}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {client.municipio
                      ? `${client.municipio}/${client.estado}`
                      : '-'}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setViewingClient(client)}
                    >
                      Ver Perfil
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingClient(client)}
                    >
                      <Pencil className="w-3 h-3 mr-2" /> Editar
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Create Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Novo Cliente</DialogTitle>
          </DialogHeader>
          <ClientForm
            onSubmit={handleCreate}
            onCancel={() => setIsCreateOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog
        open={!!editingClient}
        onOpenChange={(open) => !open && setEditingClient(null)}
      >
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Cliente</DialogTitle>
          </DialogHeader>
          {editingClient && (
            <ClientForm
              initialData={editingClient}
              onSubmit={handleUpdate}
              onCancel={() => setEditingClient(null)}
              isEditing={true}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* View Profile Sheet */}
      <Sheet
        open={!!viewingClient}
        onOpenChange={(open) => !open && setViewingClient(null)}
      >
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto p-0">
          {viewingClient && (
            <div className="flex flex-col h-full">
              <div className="bg-slate-900 text-white p-6 pb-10">
                <SheetHeader className="text-left mb-6">
                  <SheetTitle className="text-white flex items-center justify-between">
                    Perfil do Cliente
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        setEditingClient(viewingClient)
                        setViewingClient(null)
                      }}
                    >
                      <Pencil className="w-3 h-3 mr-2" /> Editar
                    </Button>
                  </SheetTitle>
                </SheetHeader>
                <div className="flex items-center gap-4">
                  <Avatar className="h-24 w-24 border-4 border-white/10">
                    <AvatarImage
                      src={viewingClient.url_foto || undefined}
                      className="object-cover"
                    />
                    <AvatarFallback className="text-2xl bg-white/10 text-white">
                      {viewingClient.nome[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="text-2xl font-bold">{viewingClient.nome}</h2>
                    <p className="text-slate-400 flex items-center gap-2 mt-1">
                      <MapPin className="w-3 h-3" />
                      {viewingClient.municipio
                        ? `${viewingClient.municipio} - ${viewingClient.estado}`
                        : 'Sem localização'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex-1 p-6 space-y-8 bg-white -mt-4 rounded-t-xl">
                <Tabs defaultValue="info" className="w-full">
                  <TabsList className="w-full justify-start mb-6">
                    <TabsTrigger value="info">
                      <User className="w-4 h-4 mr-2" /> Dados
                    </TabsTrigger>
                    <TabsTrigger value="history">
                      <History className="w-4 h-4 mr-2" /> Histórico
                    </TabsTrigger>
                    <TabsTrigger value="files">
                      <Files className="w-4 h-4 mr-2" /> Arquivos
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent
                    value="info"
                    className="space-y-6 animate-in fade-in"
                  >
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="space-y-1">
                        <span className="text-muted-foreground flex items-center gap-1">
                          <User className="w-3 h-3" /> CPF
                        </span>
                        <p className="font-medium">
                          {formatCPF(viewingClient.cpf)}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-muted-foreground flex items-center gap-1">
                          <Phone className="w-3 h-3" /> Telefone
                        </span>
                        <p className="font-medium">
                          {formatPhone(viewingClient.telefone)}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-muted-foreground flex items-center gap-1">
                          <Mail className="w-3 h-3" /> Email
                        </span>
                        <p className="font-medium">
                          {viewingClient.email || '-'}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-muted-foreground">Origem</span>
                        <p className="font-medium">
                          {viewingClient.origem || '-'}
                        </p>
                      </div>
                      <div className="col-span-2 space-y-1">
                        <span className="text-muted-foreground">
                          Endereço Completo
                        </span>
                        <p className="font-medium">
                          {[
                            viewingClient.rua,
                            viewingClient.numero,
                            viewingClient.complemento,
                            viewingClient.bairro,
                            viewingClient.cep,
                          ]
                            .filter(Boolean)
                            .join(', ') ||
                            viewingClient.endereco ||
                            '-'}
                        </p>
                      </div>
                    </div>

                    {viewingClient.observacoes && (
                      <div className="space-y-2 bg-yellow-50 p-4 rounded-lg border border-yellow-100">
                        <span className="text-xs font-bold text-yellow-700 uppercase">
                          Observações Internas
                        </span>
                        <p className="text-sm text-yellow-900 leading-relaxed whitespace-pre-wrap">
                          {viewingClient.observacoes}
                        </p>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent
                    value="history"
                    className="space-y-4 animate-in fade-in"
                  >
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                      <History className="w-5 h-5 text-primary" /> Histórico de
                      Avaliações
                    </h3>
                    <ClientHistory clientId={viewingClient.id} />
                  </TabsContent>

                  <TabsContent
                    value="files"
                    className="space-y-4 animate-in fade-in"
                  >
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                      <Files className="w-5 h-5 text-primary" /> Arquivos e
                      Documentos
                    </h3>
                    <ClientFiles clientId={viewingClient.id} />
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
