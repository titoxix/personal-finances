import type { Budget } from '@/domain/entities/budget'
import type {
	CreateBudgetInput,
	IBudgetRepository,
	UpdateBudgetInput,
} from '@/domain/repositories/IBudgetRepository'

function sameMonth(a: Date, b: Date): boolean {
	return (
		a.getUTCFullYear() === b.getUTCFullYear() &&
		a.getUTCMonth() === b.getUTCMonth()
	)
}

export function createBudgetService(repo: IBudgetRepository) {
	return {
		findAll: (): Promise<Budget[]> => repo.findAll(),

		findById: async (id: number): Promise<Budget> => {
			const budget = await repo.findById(id)
			if (!budget) throw new Error('Budget not found')
			return budget
		},

		findByMonth: async (month: Date): Promise<Budget[]> => {
			const [specific, recurring] = await Promise.all([
				repo.findByMonth(month),
				repo.findRecurring(month),
			])
			const specificCategoryIds = new Set(specific.map((b) => b.categoryId))
			const inherited = recurring.filter(
				(b) => !specificCategoryIds.has(b.categoryId),
			)
			return [...specific, ...inherited]
		},

		findByMonthAndCategory: (
			month: Date,
			categoryId: number,
		): Promise<Budget | null> => repo.findByMonthAndCategory(month, categoryId),

		create: async (input: CreateBudgetInput): Promise<Budget> => {
			if (input.budgetedUsd == null && input.budgetedGs == null)
				throw new Error('budget requires budgetedUsd or budgetedGs')
			const existing = await repo.findByMonthAndCategory(
				input.month,
				input.categoryId,
			)
			if (existing)
				throw new Error('Budget already exists for this month and category')
			return repo.create(input)
		},

		update: async (id: number, input: UpdateBudgetInput): Promise<Budget> => {
			const existing = await repo.findById(id)
			if (!existing) throw new Error('Budget not found')
			return repo.update(id, input)
		},

		adjustForMonth: async (
			id: number,
			targetMonth: Date,
			input: UpdateBudgetInput,
		): Promise<Budget> => {
			const existing = await repo.findById(id)
			if (!existing) throw new Error('Budget not found')

			if (sameMonth(existing.month, targetMonth)) {
				return repo.update(id, input)
			}

			const duplicate = await repo.findByMonthAndCategory(
				targetMonth,
				existing.categoryId,
			)
			if (duplicate)
				throw new Error('Budget already exists for this month and category')

			return repo.create({
				month: targetMonth,
				categoryId: existing.categoryId,
				essentialityId: input.essentialityId ?? existing.essentialityId,
				budgetedUsd: input.budgetedUsd ?? undefined,
				budgetedGs: input.budgetedGs ?? undefined,
				isRecurring: true,
				notes: input.notes ?? undefined,
			})
		},

		delete: async (id: number, reason?: string): Promise<Budget> => {
			const existing = await repo.findById(id)
			if (!existing) throw new Error('Budget not found')
			return repo.softDelete(id, reason)
		},
	}
}
