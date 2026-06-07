import type { Transaction } from '@/domain/entities/transaction'
import type {
	CreateTransactionInput,
	ITransactionRepository,
	UpdateTransactionInput,
} from '@/domain/repositories/ITransactionRepository'

function calcWeekOfMonth(date: Date): number {
	const day = date.getUTCDate()
	if (day <= 7) return 1
	if (day <= 14) return 2
	if (day <= 21) return 3
	return 4
}

export function createTransactionService(repo: ITransactionRepository) {
	return {
		findAll: (): Promise<Transaction[]> => repo.findAll(),

		findById: async (id: number): Promise<Transaction> => {
			const tx = await repo.findById(id)
			if (!tx) throw new Error('Transaction not found')
			return tx
		},

		findByMonth: (month: Date): Promise<Transaction[]> =>
			repo.findByMonth(month),

		findByMonthAndCategory: (
			month: Date,
			categoryId: number,
		): Promise<Transaction[]> => repo.findByMonthAndCategory(month, categoryId),

		create: async (input: CreateTransactionInput): Promise<Transaction> => {
			if (input.amountGs == null && input.amountUsd == null)
				throw new Error('transaction requires amountGs or amountUsd')
			const weekOfMonth = input.weekOfMonth ?? calcWeekOfMonth(input.date)
			const isRecurring =
				input.recurringItemId != null ? true : (input.isRecurring ?? false)
			return repo.create({ ...input, weekOfMonth, isRecurring })
		},

		update: async (
			id: number,
			input: UpdateTransactionInput,
		): Promise<Transaction> => {
			const existing = await repo.findById(id)
			if (!existing) throw new Error('Transaction not found')
			return repo.update(id, input)
		},

		delete: async (id: number): Promise<void> => {
			const existing = await repo.findById(id)
			if (!existing) throw new Error('Transaction not found')
			return repo.delete(id)
		},
	}
}
