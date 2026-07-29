import type { Income } from '@/domain/entities/income'
import type {
	CreateIncomeInput,
	IIncomeRepository,
	UpdateIncomeInput,
} from '@/domain/repositories/IIncomeRepository'

export function createIncomeService(repo: IIncomeRepository) {
	return {
		findAll: (userId: string): Promise<Income[]> => repo.findAll(userId),

		findById: async (userId: string, id: number): Promise<Income> => {
			const income = await repo.findById(userId, id)
			if (!income) throw new Error('Income not found')
			return income
		},

		findByMonth: (userId: string, month: Date): Promise<Income | null> =>
			repo.findByMonth(userId, month),

		create: async (
			userId: string,
			input: CreateIncomeInput,
		): Promise<Income> => {
			const existing = await repo.findByMonth(userId, input.month)
			if (existing) throw new Error('Income already exists for this month')
			return repo.create(userId, input)
		},

		update: async (
			userId: string,
			id: number,
			input: UpdateIncomeInput,
		): Promise<Income> => {
			const existing = await repo.findById(userId, id)
			if (!existing) throw new Error('Income not found')
			return repo.update(userId, id, input)
		},
	}
}
