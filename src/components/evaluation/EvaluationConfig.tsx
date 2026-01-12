import { BasePriceList } from './BasePriceList'
import { DiscountList } from './DiscountList'

export function EvaluationConfig() {
  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Base Prices Section */}
      <BasePriceList />

      {/* Peripheral Discounts Section */}
      <DiscountList />
    </div>
  )
}
