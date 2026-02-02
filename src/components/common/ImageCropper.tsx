import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Check, X, ZoomIn, ZoomOut } from 'lucide-react'

interface ImageCropperProps {
  imageSrc: string
  onCropComplete: (blob: Blob) => void
  onCancel: () => void
}

export function ImageCropper({
  imageSrc,
  onCropComplete,
  onCancel,
}: ImageCropperProps) {
  const [zoom, setZoom] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 })

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const imgRef = useRef<HTMLImageElement>(new Image())

  const CROP_SIZE = 280

  useEffect(() => {
    imgRef.current.src = imageSrc
    imgRef.current.onload = () => {
      // Calculate initial fit
      const aspect = imgRef.current.width / imgRef.current.height
      let w, h
      if (aspect > 1) {
        h = CROP_SIZE
        w = h * aspect
      } else {
        w = CROP_SIZE
        h = w / aspect
      }
      setImageSize({ width: w, height: h })
    }
  }, [imageSrc])

  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true)
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
    setDragStart({ x: clientX - offset.x, y: clientY - offset.y })
  }

  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging) return
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
    setOffset({
      x: clientX - dragStart.x,
      y: clientY - dragStart.y,
    })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleSave = () => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Output size (optimized)
    const OUTPUT_SIZE = 400
    canvas.width = OUTPUT_SIZE
    canvas.height = OUTPUT_SIZE

    // Draw parameters
    const scale = OUTPUT_SIZE / CROP_SIZE

    // Fill white background just in case
    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(0, 0, OUTPUT_SIZE, OUTPUT_SIZE)

    ctx.save()
    // Move to center to apply transforms
    ctx.translate(OUTPUT_SIZE / 2, OUTPUT_SIZE / 2)
    ctx.scale(zoom, zoom)
    ctx.translate(-OUTPUT_SIZE / 2, -OUTPUT_SIZE / 2)

    // Draw image respecting user offset
    // offset is in CROP_SIZE coords, need to scale to OUTPUT_SIZE
    const x = offset.x * scale + (OUTPUT_SIZE - imageSize.width * scale) / 2
    const y = offset.y * scale + (OUTPUT_SIZE - imageSize.height * scale) / 2
    const w = imageSize.width * scale
    const h = imageSize.height * scale

    ctx.drawImage(imgRef.current, x, y, w, h)
    ctx.restore()

    canvas.toBlob(
      (blob) => {
        if (blob) onCropComplete(blob)
      },
      'image/jpeg',
      0.85,
    )
  }

  return (
    <div className="flex flex-col gap-4 items-center animate-in fade-in zoom-in-95 duration-200">
      <div className="relative border-4 border-dashed border-gray-200 rounded-lg p-2 bg-gray-50">
        <div
          ref={containerRef}
          className="relative overflow-hidden bg-white shadow-inner cursor-move touch-none"
          style={{ width: CROP_SIZE, height: CROP_SIZE }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleMouseDown}
          onTouchMove={handleMouseMove}
          onTouchEnd={handleMouseUp}
        >
          {/* Grid Overlay */}
          <div className="absolute inset-0 z-10 pointer-events-none border border-white/30 grid grid-cols-3 grid-rows-3">
            <div className="border-r border-b border-white/30"></div>
            <div className="border-r border-b border-white/30"></div>
            <div className="border-b border-white/30"></div>
            <div className="border-r border-b border-white/30"></div>
            <div className="border-r border-b border-white/30"></div>
            <div className="border-b border-white/30"></div>
            <div className="border-r border-white/30"></div>
            <div className="border-r border-white/30"></div>
            <div></div>
          </div>

          {/* Image */}
          <div
            className="absolute top-1/2 left-1/2 origin-center will-change-transform"
            style={{
              width: imageSize.width,
              height: imageSize.height,
              transform: `translate(-50%, -50%) translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
            }}
          >
            <img
              src={imageSrc}
              alt="Crop target"
              className="w-full h-full object-contain pointer-events-none select-none"
              draggable={false}
            />
          </div>
        </div>
      </div>

      <div className="w-full max-w-[280px] space-y-4">
        <div className="flex items-center gap-2">
          <ZoomOut className="w-4 h-4 text-muted-foreground" />
          <Slider
            value={[zoom]}
            min={1}
            max={3}
            step={0.1}
            onValueChange={(val) => setZoom(val[0])}
            className="flex-1"
          />
          <ZoomIn className="w-4 h-4 text-muted-foreground" />
        </div>

        <div className="flex justify-between gap-2">
          <Button variant="outline" onClick={onCancel} className="flex-1">
            <X className="w-4 h-4 mr-2" /> Cancelar
          </Button>
          <Button onClick={handleSave} className="flex-1">
            <Check className="w-4 h-4 mr-2" /> Confirmar
          </Button>
        </div>
      </div>
    </div>
  )
}
