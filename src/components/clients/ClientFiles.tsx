import { useState, useEffect } from 'react'
import { useClientStore } from '@/stores/useClientStore'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { FileIcon, ImageIcon, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FilePreviewDialog } from '@/components/common/FilePreviewDialog'

interface ClientFilesProps {
  clientId: string
}

export function ClientFiles({ clientId }: ClientFilesProps) {
  const { fetchClientEvaluations } = useClientStore()
  const [files, setFiles] = useState<
    { url: string; name: string; date: string; type: string }[]
  >([])
  const [loading, setLoading] = useState(true)
  const [previewFile, setPreviewFile] = useState<{
    url: string
    name: string
  } | null>(null)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      const evals = await fetchClientEvaluations(clientId)
      const allFiles: any[] = []

      evals.forEach((ev) => {
        let extraFiles: any[] = []
        try {
          if (typeof ev.arquivos_consulta === 'string') {
            extraFiles = JSON.parse(ev.arquivos_consulta)
          } else if (Array.isArray(ev.arquivos_consulta)) {
            extraFiles = ev.arquivos_consulta
          }
        } catch (e) {
          console.error('Error parsing files', e)
        }

        extraFiles.forEach((f: any) => {
          allFiles.push({
            url: f.url,
            name: f.name || 'Sem nome',
            type: f.type || 'document',
            date: ev.created_at,
          })
        })

        if (ev.url_print_seguranca) {
          allFiles.push({
            url: ev.url_print_seguranca,
            name: 'Print Segurança',
            type: 'image',
            date: ev.created_at,
          })
        }
        if (ev.url_foto_documento) {
          allFiles.push({
            url: ev.url_foto_documento,
            name: 'Foto Documento',
            type: 'image',
            date: ev.created_at,
          })
        }
      })

      setFiles(allFiles)
      setLoading(false)
    }
    load()
  }, [clientId])

  if (loading)
    return <div className="p-4 text-center">Carregando arquivos...</div>

  if (files.length === 0)
    return (
      <div className="p-8 text-center bg-gray-50 rounded border text-muted-foreground">
        Nenhum arquivo encontrado para este cliente.
      </div>
    )

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {files.map((file, idx) => (
          <Card key={idx} className="hover:shadow-md transition-shadow">
            <CardHeader className="p-4 pb-2">
              <div className="flex justify-between items-start">
                <div className="bg-slate-100 p-2 rounded">
                  {file.type === 'image' ||
                  file.url.match(/\.(jpg|jpeg|png|webp)$/i) ? (
                    <ImageIcon className="w-6 h-6 text-blue-500" />
                  ) : (
                    <FileIcon className="w-6 h-6 text-slate-500" />
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    setPreviewFile({ url: file.url, name: file.name })
                  }
                >
                  <Eye className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-2">
              <p className="font-medium text-sm truncate" title={file.name}>
                {file.name}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {new Date(file.date).toLocaleDateString()}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <FilePreviewDialog
        open={!!previewFile}
        onOpenChange={(open) => !open && setPreviewFile(null)}
        fileUrl={previewFile?.url || null}
        fileName={previewFile?.name}
      />
    </>
  )
}
