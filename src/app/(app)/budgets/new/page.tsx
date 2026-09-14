import { BudgetForm } from '@/components/budgets/BudgetForm'
import { requireUser } from '@/lib/auth-helpers'
import { categoryService, essentialityService } from '@/lib/container'
import { createBudget } from '../actions'

export default async function NewBudgetPage() {
	const user = await requireUser()
	const [categories, essentialityLevels] = await Promise.all([
		categoryService.findAll(user.id),
		essentialityService.findAll(user.id),
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
