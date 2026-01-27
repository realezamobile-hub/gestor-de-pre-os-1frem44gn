import { useState, useEffect } from 'react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Button } from '@/components/ui/button'
import { Smile } from 'lucide-react'
import { emojiCategories, Emoji, allEmojis } from '@/data/emojis'

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void
  trigger?: React.ReactNode
  side?: 'top' | 'right' | 'bottom' | 'left'
}

export function EmojiPicker({
  onEmojiSelect,
  trigger,
  side = 'bottom',
}: EmojiPickerProps) {
  const [open, setOpen] = useState(false)
  const [frequentEmojis, setFrequentEmojis] = useState<Emoji[]>([])

  useEffect(() => {
    // Load frequent emojis from local storage
    const stored = localStorage.getItem('frequent_emojis')
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as string[]
        // Map back to full emoji objects
        const found = parsed
          .map((e) => allEmojis.find((item) => item.emoji === e))
          .filter(Boolean) as Emoji[]
        setFrequentEmojis(found.slice(0, 10)) // Limit to top 10
      } catch (e) {
        console.error('Failed to parse frequent emojis', e)
      }
    }
  }, [open])

  const handleSelect = (emoji: Emoji) => {
    onEmojiSelect(emoji.emoji)
    setOpen(false)

    // Update frequent list
    const currentStored = localStorage.getItem('frequent_emojis')
    let newFrequent: string[] = currentStored ? JSON.parse(currentStored) : []

    // Remove if exists to push to top
    newFrequent = newFrequent.filter((e) => e !== emoji.emoji)
    // Add to front
    newFrequent.unshift(emoji.emoji)
    // Limit to 20 stored
    newFrequent = newFrequent.slice(0, 20)

    localStorage.setItem('frequent_emojis', JSON.stringify(newFrequent))
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {trigger || (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
          >
            <Smile className="w-5 h-5" />
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" side={side} align="start">
        <Command className="w-full h-[350px]">
          <CommandInput placeholder="Pesquisar emoji..." />
          <CommandList className="h-full max-h-[300px]">
            <CommandEmpty>Nenhum emoji encontrado.</CommandEmpty>

            {frequentEmojis.length > 0 && (
              <CommandGroup heading="Usados Frequentemente">
                <div className="flex flex-wrap gap-1 p-1">
                  {frequentEmojis.map((item) => (
                    <CommandItem
                      key={item.emoji}
                      value={item.name + ' ' + item.keywords.join(' ')}
                      onSelect={() => handleSelect(item)}
                      className="flex items-center justify-center w-8 h-8 p-0 cursor-pointer text-lg hover:bg-accent rounded-md aria-selected:bg-accent"
                    >
                      {item.emoji}
                    </CommandItem>
                  ))}
                </div>
              </CommandGroup>
            )}

            {emojiCategories.map((category) => (
              <CommandGroup key={category.id} heading={category.name}>
                <div className="flex flex-wrap gap-1 p-1">
                  {category.emojis.map((item) => (
                    <CommandItem
                      key={item.emoji}
                      value={item.name + ' ' + item.keywords.join(' ')}
                      onSelect={() => handleSelect(item)}
                      className="flex items-center justify-center w-8 h-8 p-0 cursor-pointer text-lg hover:bg-accent rounded-md aria-selected:bg-accent"
                    >
                      {item.emoji}
                    </CommandItem>
                  ))}
                </div>
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
