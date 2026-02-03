import { BasePriceList } from './BasePriceList'
import { ChecklistConfig } from './ChecklistConfig'
import { ModelDiscountConfig } from './ModelDiscountConfig'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export function EvaluationConfig() {
  return (
    <div className="h-full">
      <Tabs defaultValue="models" className="h-full flex flex-col space-y-4">
        <TabsList>
          <TabsTrigger value="models">1. Modelos Base</TabsTrigger>
          <TabsTrigger value="checklist">2. Itens de Checklist</TabsTrigger>
          <TabsTrigger value="discounts">3. Preços de Defeitos</TabsTrigger>
        </TabsList>

        <TabsContent value="models" className="flex-1 mt-0">
          <div className="max-w-4xl">
            <BasePriceList />
          </div>
        </TabsContent>

        <TabsContent value="checklist" className="flex-1 mt-0">
          <div className="max-w-4xl">
            <ChecklistConfig />
          </div>
        </TabsContent>

        <TabsContent value="discounts" className="flex-1 mt-0">
          <div className="max-w-4xl">
            <ModelDiscountConfig />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
