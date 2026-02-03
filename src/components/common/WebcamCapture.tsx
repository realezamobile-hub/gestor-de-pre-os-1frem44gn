import { useState, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Camera, RefreshCw, CheckCircle2, XCircle } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface WebcamCaptureProps {
  onCapture: (file: File) => void
  onCancel: () => void
  className?: string
}

export function WebcamCapture({
  onCapture,
  onCancel,
  className,
}: WebcamCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isStreaming, setIsStreaming] = useState(false)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
      })
      setStream(mediaStream)
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        videoRef.current.play()
      }
      setIsStreaming(true)
    } catch (err) {
      console.error('Error accessing camera:', err)
      toast.error('Não foi possível acessar a câmera. Verifique as permissões.')
      onCancel()
    }
  }

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
      setStream(null)
      setIsStreaming(false)
    }
  }, [stream])

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current
      const canvas = canvasRef.current

      // Set canvas dimensions to match video
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      const context = canvas.getContext('2d')
      if (context) {
        // Flip horizontally for mirroring effect if needed, but usually raw capture is better
        // context.translate(canvas.width, 0);
        // context.scale(-1, 1);
        context.drawImage(video, 0, 0, canvas.width, canvas.height)

        const dataUrl = canvas.toDataURL('image/jpeg', 0.85)
        setCapturedImage(dataUrl)
        stopCamera()
      }
    }
  }

  const handleRetake = () => {
    setCapturedImage(null)
    startCamera()
  }

  const handleConfirm = () => {
    if (capturedImage && canvasRef.current) {
      canvasRef.current.toBlob(
        (blob) => {
          if (blob) {
            const file = new File([blob], `capture-${Date.now()}.jpg`, {
              type: 'image/jpeg',
            })
            onCapture(file)
          }
        },
        'image/jpeg',
        0.85,
      )
    }
  }

  // Start camera on mount
  useState(() => {
    startCamera()
    return () => stopCamera()
  })

  return (
    <div
      className={cn(
        'flex flex-col items-center gap-4 bg-slate-100 p-4 rounded-lg',
        className,
      )}
    >
      <div className="relative overflow-hidden rounded-lg bg-black aspect-[4/3] w-full max-w-[400px]">
        {!capturedImage ? (
          <video
            ref={videoRef}
            className="w-full h-full object-cover mirror"
            muted
            playsInline
          />
        ) : (
          <img
            src={capturedImage}
            alt="Captured"
            className="w-full h-full object-cover"
          />
        )}
        <canvas ref={canvasRef} className="hidden" />
      </div>

      <div className="flex gap-4 w-full justify-center">
        {!capturedImage ? (
          <>
            <Button
              variant="outline"
              onClick={() => {
                stopCamera()
                onCancel()
              }}
              type="button"
            >
              <XCircle className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button
              onClick={capturePhoto}
              type="button"
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Camera className="w-4 h-4 mr-2" />
              Tirar Foto
            </Button>
          </>
        ) : (
          <>
            <Button variant="outline" onClick={handleRetake} type="button">
              <RefreshCw className="w-4 h-4 mr-2" />
              Tirar Novamente
            </Button>
            <Button
              onClick={handleConfirm}
              type="button"
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Confirmar
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
