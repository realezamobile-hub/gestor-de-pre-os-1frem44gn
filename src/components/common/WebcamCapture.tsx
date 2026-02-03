import { useState, useRef, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import {
  Camera,
  RefreshCw,
  CheckCircle2,
  XCircle,
  FlipHorizontal,
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
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user')
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false)

  const checkCameras = async () => {
    try {
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
    // Stop any existing stream first
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
    }

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      })

      setStream(mediaStream)
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        // Ensure play is called
        try {
          await videoRef.current.play()
        } catch (playError) {
          console.error('Error playing video:', playError)
        }
      }
    } catch (err) {
      console.error('Error accessing camera:', err)
      toast.error('Não foi possível acessar a câmera. Verifique as permissões.')
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

      // Set canvas dimensions to match video
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      const context = canvas.getContext('2d')
      if (context) {
        // Mirror if user facing
        if (facingMode === 'user') {
          context.translate(canvas.width, 0)
          context.scale(-1, 1)
        }

        context.drawImage(video, 0, 0, canvas.width, canvas.height)

        const dataUrl = canvas.toDataURL('image/jpeg', 0.85)
        setCapturedImage(dataUrl)
      }
    }
  }

  const handleRetake = () => {
    setCapturedImage(null)
    // If stream was stopped or lost, restart it
    if (!stream || !stream.active) {
      startCamera()
    }
  }

  const handleConfirm = () => {
    if (capturedImage && canvasRef.current) {
      canvasRef.current.toBlob(
        (blob) => {
          if (blob) {
            // Create a clean File object from blob
            const file = new File([blob], `foto-doc-${Date.now()}.jpg`, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            })
            onCapture(file)
            stopCamera()
          }
        },
        'image/jpeg',
        0.85,
      )
    }
  }

  return (
    <div
      className={cn(
        'flex flex-col items-center gap-4 bg-slate-100 p-4 rounded-lg',
        className,
      )}
    >
      <div className="relative overflow-hidden rounded-lg bg-black aspect-[4/3] w-full max-w-[400px] shadow-inner">
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
            className="w-full h-full object-cover"
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
