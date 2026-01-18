import { DraftItem } from '@/types'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { DraftItemCard } from './DraftItemCard'

interface DraftListGroupedProps {
  items: DraftItem[]
  onRemove: (id: string) => Promise<void>
  onUpdate: (id: string, updates: Partial<DraftItem>) => Promise<void>
}

export function DraftListGrouped({
  items,
  onRemove,
  onUpdate,
}: DraftListGroupedProps) {
  // Group items by group_name
  const grouped = items.reduce(
    (acc, item) => {
      const groupName = item.group_name || item.product?.categoria || 'Outros'
      if (!acc[groupName]) acc[groupName] = []
      acc[groupName].push(item)
      return acc
    },
    {} as Record<string, DraftItem[]>,
  )

  const sortedGroups = Object.keys(grouped).sort()

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-8 text-center border-2 border-dashed rounded-lg bg-gray-50/50">
        <p>Sua lista está vazia.</p>
        <p className="text-sm mt-2">
          Adicione produtos através do catálogo para começar.
        </p>
      </div>
    )
  }

  return (
    <ScrollArea className="h-full pr-4">
      <Accordion
        type="multiple"
        defaultValue={sortedGroups}
        className="w-full space-y-4"
      >
        {sortedGroups.map((group) => (
          <AccordionItem
            key={group}
            value={group}
            className="border rounded-lg bg-slate-50/50 shadow-sm overflow-hidden px-0"
          >
            <AccordionTrigger className="px-4 py-3 hover:bg-slate-100/50 hover:no-underline sticky top-0 bg-white/80 backdrop-blur-sm z-10 border-b">
              <div className="flex items-center gap-3">
                <span className="font-semibold text-gray-900">{group}</span>
                <Badge variant="secondary" className="text-xs">
                  {grouped[group].length}
                </Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent className="p-3 pt-3 bg-white">
              <div className="flex flex-col gap-3">
                {grouped[group].map((item) => (
                  <DraftItemCard
                    key={item.id}
                    item={item}
                    onUpdate={onUpdate}
                    onRemove={onRemove}
                  />
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </ScrollArea>
  )
}
