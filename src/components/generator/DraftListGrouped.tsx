import { DraftItem } from '@/types'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Pencil, Trash2, GripVertical } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

interface DraftListGroupedProps {
  items: DraftItem[]
  onEdit: (item: DraftItem) => void
  onRemove: (id: string) => void
}

export function DraftListGrouped({
  items,
  onEdit,
  onRemove,
}: DraftListGroupedProps) {
  // Group items
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
          Adicione produtos usando os filtros acima ou buscando na aba de
          produtos.
        </p>
      </div>
    )
  }

  return (
    <ScrollArea className="h-[calc(100vh-24rem)] pr-4">
      <Accordion
        type="multiple"
        defaultValue={sortedGroups}
        className="w-full space-y-4"
      >
        {sortedGroups.map((group) => (
          <AccordionItem
            key={group}
            value={group}
            className="border rounded-lg bg-white shadow-sm overflow-hidden px-0"
          >
            <AccordionTrigger className="px-4 py-3 hover:bg-gray-50 hover:no-underline">
              <div className="flex items-center gap-3">
                <span className="font-semibold text-gray-900">{group}</span>
                <Badge variant="secondary" className="text-xs">
                  {grouped[group].length}
                </Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-0 pb-0 border-t">
              <div className="divide-y">
                {grouped[group].map((item) => {
                  const product = item.product
                  if (!product) return null
                  const price = item.custom_price ?? product.valor
                  const hasOverrides =
                    item.custom_model ||
                    item.custom_details ||
                    item.custom_price ||
                    item.group_name

                  return (
                    <div
                      key={item.id}
                      className="p-3 pl-4 flex items-center gap-3 hover:bg-gray-50 transition-colors group relative"
                    >
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex justify-between items-start gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <p className="font-medium text-sm truncate">
                              {item.custom_model || product.modelo}
                            </p>
                            {hasOverrides && (
                              <span className="shrink-0 text-[10px] text-blue-600 bg-blue-50 px-1 rounded">
                                Editado
                              </span>
                            )}
                          </div>

                          <span className="text-emerald-600 font-bold text-sm whitespace-nowrap shrink-0">
                            {price
                              ? `R$ ${price.toLocaleString('pt-BR')}`
                              : '-'}
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                          <span className="truncate">
                            {item.custom_details ||
                              `${product.memoria} ${product.cor}`}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-primary"
                          onClick={() => onEdit(item)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-muted-foreground hover:text-destructive h-8 w-8"
                          onClick={() => onRemove(item.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </ScrollArea>
  )
}
