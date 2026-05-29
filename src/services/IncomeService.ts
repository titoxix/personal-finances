import type { Income } from '@/domain/entities/income'
import type {
	CreateIncomeInput,
	IIncomeRepository,
	UpdateIncomeInput,
} from '@/domain/repositories/IIncomeRepository'

export function createIncomeService(repo: IIncomeRepository) {
	return {
		findAll: (): Promise<Income[]> => repo.findAll(),

		findById: async (id: number): Promise<Income> => {
			const income = await repo.findById(id)
			if (!income) throw new Error('Income not found')
			return income
		},

		findByMonth: (month: Date): Promise<Income | null> =>
			repo.findByMonth(month),

		create: async (input: CreateIncomeInput): Promise<Income> => {
			const existing = await repo.findByMonth(input.month)
			if (existing) throw new Error('Income already exists for this month')
			return repo.create(input)
		},

		update: async (id: number, input: UpdateIncomeInput): Promise<Income> => {
			const existing = await repo.findById(id)
			if (!existing) throw new Error('Income not found')
			return repo.update(id, input)
		},
	}
}
