import { notFound } from 'next/navigation'
import { BudgetForm } from '@/components/budgets/BudgetForm'
import {
	budgetService,
	categoryService,
	essentialityService,
} from '@/lib/container'
import type { UpdateBudgetPayload } from '../../actions'
import { deleteBudget, updateBudget as updateBudgetAction } from '../../actions'

export default async function EditBudgetPage({
	params,
	searchParams,
}: {
	params: Promise<{ id: string }>
	searchParams: Promise<{ month?: string }>
}) {
	const { id: idStr } = await params
	const { month: monthParam } = await searchParams
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

	const targetMonth =
		monthParam ??
		`${budget.month.getUTCFullYear()}-${String(budget.month.getUTCMonth() + 1).padStart(2, '0')}`

	async function handleUpdate(payload: UpdateBudgetPayload) {
		'use server'
		return updateBudgetAction(id, { ...payload, targetMonth })
	}

	async function handleDelete(reason?: string) {
		'use server'
		return deleteBudget(id, reason)
	}

	return (
		<BudgetForm
			mode="edit"
			categoryLabel={category?.label ?? `Categoría #${budget.categoryId}`}
			essentialityLevels={activeLevels}
			onSubmit={handleUpdate}
			onDelete={handleDelete}
			initialValues={{
				essentialityId: budget.essentialityId,
				currency,
				amount,
				isRecurring: budget.isRecurring,
				notes: budget.notes ?? '',
			}}
		/>
	)
}
