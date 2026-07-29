import type { Transaction } from '@/domain/entities/transaction'
import type { IInstallmentPlanRepository } from '@/domain/repositories/IInstallmentPlanRepository'
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

export function createTransactionService(
	repo: ITransactionRepository,
	installmentPlanRepo: IInstallmentPlanRepository,
) {
	return {
		findAll: (userId: string): Promise<Transaction[]> => repo.findAll(userId),

		findById: async (userId: string, id: number): Promise<Transaction> => {
			const tx = await repo.findById(userId, id)
			if (!tx) throw new Error('Transaction not found')
			return tx
		},

		findByMonth: (userId: string, month: Date): Promise<Transaction[]> =>
			repo.findByMonth(userId, month),

		findByMonthAndCategory: (
			userId: string,
			month: Date,
			categoryId: number,
		): Promise<Transaction[]> =>
			repo.findByMonthAndCategory(userId, month, categoryId),

		create: async (
			userId: string,
			input: CreateTransactionInput,
		): Promise<Transaction> => {
			if (input.amountGs == null && input.amountUsd == null)
				throw new Error('transaction requires amountGs or amountUsd')
			const weekOfMonth = input.weekOfMonth ?? calcWeekOfMonth(input.date)
			const isRecurring =
				input.recurringItemId != null ? true : (input.isRecurring ?? false)

			let installmentFields: Partial<CreateTransactionInput> = {}
			let plan: Awaited<ReturnType<IInstallmentPlanRepository['findById']>> =
				null
			if (input.installmentPlanId != null) {
				plan = await installmentPlanRepo.findById(
					userId,
					input.installmentPlanId,
				)
				if (!plan) throw new Error('InstallmentPlan not found')
				installmentFields = {
					isInstallment: true,
					installmentCurrent: plan.installmentsPaid + 1,
					installmentTotal: plan.installmentsTotal,
				}
			}

			const created = await repo.create(userId, {
				...input,
				...installmentFields,
				weekOfMonth,
				isRecurring,
			})

			if (plan) {
				await installmentPlanRepo.update(userId, plan.id, {
					installmentsPaid: plan.installmentsPaid + 1,
				})
			}

			return created
		},

		update: async (
			userId: string,
			id: number,
			input: UpdateTransactionInput,
		): Promise<Transaction> => {
			const existing = await repo.findById(userId, id)
			if (!existing) throw new Error('Transaction not found')
			return repo.update(userId, id, input)
		},

		delete: async (userId: string, id: number): Promise<void> => {
			const existing = await repo.findById(userId, id)
			if (!existing) throw new Error('Transaction not found')
			return repo.delete(userId, id)
		},
	}
}
