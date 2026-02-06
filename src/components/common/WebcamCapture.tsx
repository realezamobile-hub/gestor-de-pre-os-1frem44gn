import { useState, useRef, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import {
  Camera,
  RefreshCw,
  CheckCircle2,
  XCircle,
  FlipHorizontal,
  AlertCircle,
} from 'lucide-react'
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
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>(
    'environment',
  )
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const checkCameras = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
        throw new Error('Câmera não suportada neste dispositivo/navegador')
      }

      const devices = await navigator.mediaDevices.enumerateDevices()
      const videoDevices = devices.filter(
        (device) => device.kind === 'videoinput',
      )
      setHasMultipleCameras(videoDevices.length > 1)
    } catch (error) {
      console.error('Error checking cameras:', error)
    }
  }

  const startCamera = async () => {
    setError(null)
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
    }

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Câmera não suportada neste dispositivo/navegador')
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      })

      setStream(mediaStream)
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        try {
          await videoRef.current.play()
        } catch (playError) {
          console.error('Error playing video:', playError)
        }
      }
    } catch (err: any) {
      console.error('Error accessing camera:', err)
      let msg = 'Não foi possível acessar a câmera.'
      if (
        err.name === 'NotAllowedError' ||
        err.name === 'PermissionDeniedError'
      ) {
        msg = 'Permissão da câmera negada. Verifique as configurações.'
      } else if (
        err.name === 'NotFoundError' ||
        err.name === 'DevicesNotFoundError'
      ) {
        msg = 'Nenhuma câmera encontrada.'
      }
      setError(msg)
      toast.error(msg)
    }
  }

  useEffect(() => {
    checkCameras()
  }, [])

  useEffect(() => {
    startCamera()
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [facingMode])

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
      setStream(null)
    }
  }, [stream])

  const toggleCamera = () => {
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'))
  }

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current
      const canvas = canvasRef.current

      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      const context = canvas.getContext('2d')
      if (context) {
        if (facingMode === 'user') {
          context.translate(canvas.width, 0)
          context.scale(-1, 1)
        }

        context.drawImage(video, 0, 0, canvas.width, canvas.height)

        const dataUrl = canvas.toDataURL('image/jpeg', 0.9)
        setCapturedImage(dataUrl)
      }
    }
  }

  const handleRetake = () => {
    setCapturedImage(null)
    if (!stream || !stream.active) {
      startCamera()
    }
  }

  const handleConfirm = () => {
    if (capturedImage && canvasRef.current) {
      canvasRef.current.toBlob(
        (blob) => {
          if (blob) {
            const file = new File([blob], `foto-doc-${Date.now()}.jpg`, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            })
            onCapture(file)
            stopCamera()
          }
        },
        'image/jpeg',
        0.9,
      )
    }
  }

  if (error) {
    return (
      <div
        className={cn(
          'flex flex-col items-center justify-center p-8 text-center bg-slate-50 rounded-lg border border-slate-200 gap-4',
          className,
        )}
      >
        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600">
          <AlertCircle className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <p className="font-medium text-slate-900">Erro na Câmera</p>
          <p className="text-sm text-slate-500 max-w-[250px] mx-auto">
            {error}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={startCamera}>
            <RefreshCw className="w-4 h-4 mr-2" /> Tentar Novamente
          </Button>
          <Button variant="secondary" onClick={onCancel}>
            Fechar
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'flex flex-col items-center gap-4 bg-slate-100 p-4 rounded-lg',
        className,
      )}
    >
      <div className="relative overflow-hidden rounded-lg bg-black aspect-[4/3] w-full max-w-[400px] shadow-inner flex items-center justify-center">
        {!capturedImage ? (
          <video
            ref={videoRef}
            className={cn(
              'w-full h-full object-cover',
              facingMode === 'user' && 'scale-x-[-1]',
            )}
            muted
            playsInline
            autoPlay
          />
        ) : (
          <img
            src={capturedImage}
            alt="Captured"
            className="w-full h-full object-contain"
          />
        )}
        <canvas ref={canvasRef} className="hidden" />
      </div>

      <div className="flex gap-2 w-full justify-center flex-wrap">
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

            {hasMultipleCameras && (
              <Button variant="secondary" onClick={toggleCamera} type="button">
                <FlipHorizontal className="w-4 h-4 mr-2" />
                Trocar Câmera
              </Button>
            )}

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
