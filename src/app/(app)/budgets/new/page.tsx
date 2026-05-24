import { BudgetForm } from '@/components/budgets/BudgetForm'
import { categoryService, essentialityService } from '@/lib/container'
import { createBudget } from '../actions'

export default async function NewBudgetPage() {
	const [categories, essentialityLevels] = await Promise.all([
		categoryService.findAll(),
		essentialityService.findAll(),
	])

	const activeCategories = categories.filter((c) => c.active)
	const activeLevels = essentialityLevels
		.filter((l) => l.active)
		.sort((a, b) => a.sortOrder - b.sortOrder)

	return (
		<BudgetForm
			mode="create"
			categories={activeCategories}
			essentialityLevels={activeLevels}
			onSubmit={createBudget}
		/>
	)
}
