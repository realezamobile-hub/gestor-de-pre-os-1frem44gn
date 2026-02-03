import { BasePriceList } from './BasePriceList'
import { ChecklistConfig } from './ChecklistConfig'
import { ModelDiscountConfig } from './ModelDiscountConfig'
import { CategoryConfig } from './CategoryConfig'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export function EvaluationConfig() {
  return (
    <div className="h-full">
      <Tabs defaultValue="models" className="h-full flex flex-col space-y-4">
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="models">1. Modelos Base</TabsTrigger>
          <TabsTrigger value="categories">2. Categorias</TabsTrigger>
          <TabsTrigger value="checklist">3. Itens de Checklist</TabsTrigger>
          <TabsTrigger value="discounts">4. Preços de Defeitos</TabsTrigger>
        </TabsList>

        <TabsContent value="models" className="flex-1 mt-0">
          <div className="max-w-4xl">
            <BasePriceList />
          </div>
        </TabsContent>

        <TabsContent value="categories" className="flex-1 mt-0">
          <div className="max-w-4xl">
            <CategoryConfig />
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
