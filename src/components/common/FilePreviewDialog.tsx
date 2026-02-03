import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { FileIcon, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { isImageFile, isPdfFile } from '@/lib/utils'

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
  fileType,
}: FilePreviewDialogProps) {
  if (!fileUrl) return null

  const isImage =
    fileType === 'image' ||
    isImageFile(fileUrl) ||
    (fileName && isImageFile(fileName))

  const isPdf =
    fileType === 'application/pdf' ||
    isPdfFile(fileUrl) ||
    (fileName && isPdfFile(fileName))

  const handleOpenExternal = () => {
    window.open(fileUrl, '_blank')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-[90vw] max-h-[90vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="p-4 border-b bg-background z-10 shrink-0 flex flex-row items-center justify-between space-y-0">
          <DialogTitle className="flex items-center gap-2 truncate pr-4">
            {isImage
              ? 'Visualizar Imagem'
              : isPdf
                ? 'Visualizar Documento'
                : 'Arquivo'}
            {fileName && (
              <span className="text-muted-foreground font-normal text-sm truncate max-w-[200px] sm:max-w-md hidden sm:inline-block">
                - {fileName}
              </span>
            )}
          </DialogTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleOpenExternal}
            className="gap-2 text-primary hover:text-primary/80"
          >
            <ExternalLink className="w-4 h-4" />
            <span className="hidden sm:inline">Abrir no Navegador</span>
          </Button>
        </DialogHeader>

        <div className="flex-1 overflow-auto bg-slate-100 flex items-center justify-center p-4 min-h-[300px] relative">
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
              <Button onClick={handleOpenExternal}>
                <ExternalLink className="w-4 h-4 mr-2" />
                Abrir em nova aba
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
