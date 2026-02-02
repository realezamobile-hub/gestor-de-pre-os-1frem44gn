import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AvatarSelectionProps {
  selectedAvatar?: string | null
  onSelect: (url: string) => void
}

const PRESET_AVATARS = [
  'https://img.usecurling.com/ppl/medium?gender=male&seed=1',
  'https://img.usecurling.com/ppl/medium?gender=female&seed=2',
  'https://img.usecurling.com/ppl/medium?gender=male&seed=3',
  'https://img.usecurling.com/ppl/medium?gender=female&seed=4',
  'https://img.usecurling.com/ppl/medium?gender=male&seed=5',
  'https://img.usecurling.com/ppl/medium?gender=female&seed=6',
]

export function AvatarSelection({
  selectedAvatar,
  onSelect,
}: AvatarSelectionProps) {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
      {PRESET_AVATARS.map((url, index) => {
        const isSelected = selectedAvatar === url
        return (
          <div
            key={index}
            className="relative group cursor-pointer"
            onClick={() => onSelect(url)}
          >
            <Avatar
              className={cn(
                'h-14 w-14 border-2 transition-all duration-200',
                isSelected
                  ? 'border-primary ring-2 ring-primary/30'
                  : 'border-transparent hover:border-gray-300',
              )}
            >
              <AvatarImage src={url} alt={`Avatar ${index + 1}`} />
              <AvatarFallback>A{index + 1}</AvatarFallback>
            </Avatar>
            {isSelected && (
              <div className="absolute -top-1 -right-1 bg-primary text-primary-foreground rounded-full p-0.5 shadow-sm">
                <Check className="w-3 h-3" />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
