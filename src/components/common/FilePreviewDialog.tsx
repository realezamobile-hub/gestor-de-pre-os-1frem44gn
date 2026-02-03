import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { FileIcon, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface FilePreviewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  fileUrl: string | null
  fileName?: string
  fileType?: string // 'image' | 'document' | 'other'
}

export function FilePreviewDialog({
  open,
  onOpenChange,
  fileUrl,
  fileName,
  fileType = 'image',
}: FilePreviewDialogProps) {
  if (!fileUrl) return null

  const isImage =
    fileType === 'image' ||
    fileUrl.match(/\.(jpeg|jpg|gif|png|webp)$/i) ||
    fileName?.match(/\.(jpeg|jpg|gif|png|webp)$/i)

  const isPdf =
    fileUrl.match(/\.pdf$/i) ||
    fileName?.match(/\.pdf$/i) ||
    fileType === 'application/pdf'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-[90vw] max-h-[90vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="p-4 border-b bg-background z-10 shrink-0">
          <DialogTitle className="flex items-center gap-2 truncate pr-8">
            {isImage ? 'Visualizar Imagem' : 'Visualizar Arquivo'}
            {fileName && (
              <span className="text-muted-foreground font-normal text-sm truncate">
                - {fileName}
              </span>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-auto bg-slate-100 flex items-center justify-center p-4 min-h-[300px]">
          {isImage ? (
            <img
              src={fileUrl}
              alt="Preview"
              className="max-w-full max-h-full object-contain rounded shadow-sm"
            />
          ) : isPdf ? (
            <iframe
              src={fileUrl}
              className="w-full h-full min-h-[500px] rounded shadow-sm bg-white"
              title="PDF Preview"
            />
          ) : (
            <div className="text-center space-y-4">
              <div className="w-20 h-20 bg-slate-200 rounded-full flex items-center justify-center mx-auto">
                <FileIcon className="w-10 h-10 text-slate-500" />
              </div>
              <p className="text-muted-foreground">
                Este tipo de arquivo não pode ser visualizado diretamente aqui.
              </p>
              <Button asChild>
                <a href={fileUrl} target="_blank" rel="noreferrer">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Abrir em nova aba
                </a>
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
