import type { Budget } from '@/domain/entities/budget'
import type {
	CreateBudgetInput,
	IBudgetRepository,
	UpdateBudgetInput,
} from '@/domain/repositories/IBudgetRepository'

export function createBudgetService(repo: IBudgetRepository) {
	return {
		findAll: (): Promise<Budget[]> => repo.findAll(),

		findById: async (id: number): Promise<Budget> => {
			const budget = await repo.findById(id)
			if (!budget) throw new Error('Budget not found')
			return budget
		},

		findByMonth: (month: Date): Promise<Budget[]> => repo.findByMonth(month),

		findByMonthAndCategory: (month: Date, categoryId: number): Promise<Budget | null> =>
			repo.findByMonthAndCategory(month, categoryId),

		create: async (input: CreateBudgetInput): Promise<Budget> => {
			if (input.budgetedUsd == null && input.budgetedGs == null)
				throw new Error('budget requires budgetedUsd or budgetedGs')
			const existing = await repo.findByMonthAndCategory(input.month, input.categoryId)
			if (existing) throw new Error('Budget already exists for this month and category')
			return repo.create(input)
		},

		update: async (id: number, input: UpdateBudgetInput): Promise<Budget> => {
			const existing = await repo.findById(id)
			if (!existing) throw new Error('Budget not found')
			return repo.update(id, input)
		},
	}
}
