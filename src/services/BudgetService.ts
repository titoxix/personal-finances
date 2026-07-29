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
		findAll: (userId: string): Promise<Budget[]> => repo.findAll(userId),

		findById: async (userId: string, id: number): Promise<Budget> => {
			const budget = await repo.findById(userId, id)
			if (!budget) throw new Error('Budget not found')
			return budget
		},

		findByMonth: async (userId: string, month: Date): Promise<Budget[]> => {
			const [specific, recurring] = await Promise.all([
				repo.findByMonth(userId, month),
				repo.findRecurring(userId, month),
			])
			const specificCategoryIds = new Set(specific.map((b) => b.categoryId))
			const inherited = recurring.filter(
				(b) => !specificCategoryIds.has(b.categoryId),
			)
			return [...specific, ...inherited]
		},

		findByMonthAndCategory: (
			userId: string,
			month: Date,
			categoryId: number,
		): Promise<Budget | null> =>
			repo.findByMonthAndCategory(userId, month, categoryId),

		create: async (
			userId: string,
			input: CreateBudgetInput,
		): Promise<Budget> => {
			if (input.budgetedUsd == null && input.budgetedGs == null)
				throw new Error('budget requires budgetedUsd or budgetedGs')
			const existing = await repo.findByMonthAndCategory(
				userId,
				input.month,
				input.categoryId,
			)
			if (existing)
				throw new Error('Budget already exists for this month and category')
			return repo.create(userId, input)
		},

		update: async (
			userId: string,
			id: number,
			input: UpdateBudgetInput,
		): Promise<Budget> => {
			const existing = await repo.findById(userId, id)
			if (!existing) throw new Error('Budget not found')
			return repo.update(userId, id, input)
		},

		adjustForMonth: async (
			userId: string,
			id: number,
			targetMonth: Date,
			input: UpdateBudgetInput,
		): Promise<Budget> => {
			const existing = await repo.findById(userId, id)
			if (!existing) throw new Error('Budget not found')

			if (sameMonth(existing.month, targetMonth)) {
				return repo.update(userId, id, input)
			}

			const duplicate = await repo.findByMonthAndCategory(
				userId,
				targetMonth,
				existing.categoryId,
			)
			if (duplicate)
				throw new Error('Budget already exists for this month and category')

			return repo.create(userId, {
				month: targetMonth,
				categoryId: existing.categoryId,
				essentialityId: input.essentialityId ?? existing.essentialityId,
				budgetedUsd: input.budgetedUsd ?? undefined,
				budgetedGs: input.budgetedGs ?? undefined,
				isRecurring: true,
				notes: input.notes ?? undefined,
			})
		},

		delete: async (
			userId: string,
			id: number,
			reason?: string,
		): Promise<Budget> => {
			const existing = await repo.findById(userId, id)
			if (!existing) throw new Error('Budget not found')
			return repo.softDelete(userId, id, reason)
		},
	}
}
