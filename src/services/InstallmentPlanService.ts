import type { InstallmentPlan } from '@/domain/entities/installment-plan'
import type {
	CreateInstallmentPlanInput,
	IInstallmentPlanRepository,
	UpdateInstallmentPlanInput,
} from '@/domain/repositories/IInstallmentPlanRepository'

function calcEndDate(startDate: Date, installmentsTotal: number): Date {
	return new Date(
		Date.UTC(
			startDate.getUTCFullYear(),
			startDate.getUTCMonth() + installmentsTotal,
			startDate.getUTCDate(),
		),
	)
}

export function createInstallmentPlanService(repo: IInstallmentPlanRepository) {
	return {
		findAll: (userId: string): Promise<InstallmentPlan[]> =>
			repo.findAll(userId),

		findById: async (userId: string, id: number): Promise<InstallmentPlan> => {
			const plan = await repo.findById(userId, id)
			if (!plan) throw new Error('InstallmentPlan not found')
			return plan
		},

		findActive: (userId: string): Promise<InstallmentPlan[]> =>
			repo.findActive(userId),

		create: async (
			userId: string,
			input: CreateInstallmentPlanInput,
		): Promise<InstallmentPlan> => {
			if (input.installmentsTotal < 1)
				throw new Error('installmentsTotal must be at least 1')
			const endDate =
				input.endDate ?? calcEndDate(input.startDate, input.installmentsTotal)
			return repo.create(userId, { ...input, endDate })
		},

		update: async (
			userId: string,
			id: number,
			input: UpdateInstallmentPlanInput,
		): Promise<InstallmentPlan> => {
			const existing = await repo.findById(userId, id)
			if (!existing) throw new Error('InstallmentPlan not found')
			return repo.update(userId, id, input)
		},

		deactivate: async (
			userId: string,
			id: number,
		): Promise<InstallmentPlan> => {
			const existing = await repo.findById(userId, id)
			if (!existing) throw new Error('InstallmentPlan not found')
			return repo.deactivate(userId, id)
		},
	}
}
