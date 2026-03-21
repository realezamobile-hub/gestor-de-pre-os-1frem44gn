import { useState, useEffect } from 'react'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Wand2, Loader2, Filter } from 'lucide-react'
import { MultiSelect } from '@/components/MultiSelect'
import { useProductStore } from '@/stores/useProductStore'

export function AutoListGeneratorCard({
  onGenerated,
}: {
  onGenerated: () => void
}) {
  const {
    categories,
    availableSuppliers,
    availableModels,
    fetchAvailableFilters,
    generateAutoList,
    isLoading,
  } = useProductStore()

  const [selectedSuppliers, setSelectedSuppliers] = useState<string[]>([])
  const [selectedModels, setSelectedModels] = useState<string[]>([])
  const [selectedGroups, setSelectedGroups] = useState<string[]>([])
  const [isGenerating, setIsGenerating] = useState(false)

  useEffect(() => {
    fetchAvailableFilters()
  }, [fetchAvailableFilters])

  const handleGenerate = async () => {
    setIsGenerating(true)
    const result = await generateAutoList({
      suppliers: selectedSuppliers,
      models: selectedModels,
      groups: selectedGroups,
    })
    setIsGenerating(false)
    if (result.success) {
      onGenerated()
    }
  }

  return (
    <Card className="border-purple-100 shadow-sm overflow-hidden">
      <div className="bg-purple-50/50">
        <CardHeader className="pb-3 border-b border-purple-100/50">
          <CardTitle className="text-sm flex items-center gap-2 text-purple-900">
            <Wand2 className="w-4 h-4 text-purple-600" />
            Geração Automática
          </CardTitle>
          <CardDescription className="text-xs">
            Filtre produtos, obtenha o menor preço automaticamente e ordene de A
            a Z.
          </CardDescription>
        </CardHeader>
      </div>
      <CardContent className="space-y-4 pt-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
            <Filter className="w-3 h-3 text-slate-400" />
            Fornecedores
          </label>
          <MultiSelect
            options={availableSuppliers}
            selected={selectedSuppliers}
            onChange={setSelectedSuppliers}
            placeholder="Todos os fornecedores..."
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
            <Filter className="w-3 h-3 text-slate-400" />
            Modelos
          </label>
          <MultiSelect
            options={availableModels}
            selected={selectedModels}
            onChange={setSelectedModels}
            placeholder="Todos os modelos..."
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
            <Filter className="w-3 h-3 text-slate-400" />
            Grupos
          </label>
          <MultiSelect
            options={categories}
            selected={selectedGroups}
            onChange={setSelectedGroups}
            placeholder="Todos os grupos..."
          />
        </div>
        <Button
          className="w-full bg-purple-600 hover:bg-purple-700 text-white shadow-sm mt-2"
          onClick={handleGenerate}
          disabled={isGenerating || isLoading}
        >
          {isGenerating ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Wand2 className="w-4 h-4 mr-2" />
          )}
          Gerar Lista Automática
        </Button>
      </CardContent>
    </Card>
  )
}
