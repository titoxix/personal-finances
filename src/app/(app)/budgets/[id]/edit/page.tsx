import { notFound } from 'next/navigation'
import { BudgetForm } from '@/components/budgets/BudgetForm'
import {
	budgetService,
	categoryService,
	essentialityService,
} from '@/lib/container'
import type { UpdateBudgetPayload } from '../../actions'
import { updateBudget } from '../../actions'

export default async function EditBudgetPage({
	params,
}: {
	params: Promise<{ id: string }>
}) {
	const { id: idStr } = await params
	const id = Number(idStr)
	if (Number.isNaN(id)) notFound()

	const [budget, categories, essentialityLevels] = await Promise.all([
		budgetService.findById(id).catch(() => null),
		categoryService.findAll(),
		essentialityService.findAll(),
	])

	if (!budget) notFound()

	const category = categories.find((c) => c.id === budget.categoryId)
	const activeLevels = essentialityLevels
		.filter((l) => l.active)
		.sort((a, b) => a.sortOrder - b.sortOrder)

	const currency: 'usd' | 'gs' = budget.budgetedUsd != null ? 'usd' : 'gs'
	const amount = budget.budgetedUsd ?? budget.budgetedGs ?? 0

	async function handleUpdate(payload: UpdateBudgetPayload) {
		'use server'
		return updateBudget(id, payload)
	}

	return (
		<BudgetForm
			mode="edit"
			categoryLabel={category?.label ?? `Categoría #${budget.categoryId}`}
			essentialityLevels={activeLevels}
			onSubmit={handleUpdate}
			initialValues={{
				essentialityId: budget.essentialityId,
				currency,
				amount,
				notes: budget.notes ?? '',
			}}
		/>
	)
}
