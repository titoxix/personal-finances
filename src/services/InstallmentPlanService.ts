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
		findAll: (): Promise<InstallmentPlan[]> => repo.findAll(),

		findById: async (id: number): Promise<InstallmentPlan> => {
			const plan = await repo.findById(id)
			if (!plan) throw new Error('InstallmentPlan not found')
			return plan
		},

		findActive: (): Promise<InstallmentPlan[]> => repo.findActive(),

		create: async (
			input: CreateInstallmentPlanInput,
		): Promise<InstallmentPlan> => {
			if (input.installmentsTotal < 1)
				throw new Error('installmentsTotal must be at least 1')
			const endDate =
				input.endDate ?? calcEndDate(input.startDate, input.installmentsTotal)
			return repo.create({ ...input, endDate })
		},

		update: async (
			id: number,
			input: UpdateInstallmentPlanInput,
		): Promise<InstallmentPlan> => {
			const existing = await repo.findById(id)
			if (!existing) throw new Error('InstallmentPlan not found')
			return repo.update(id, input)
		},

		deactivate: async (id: number): Promise<InstallmentPlan> => {
			const existing = await repo.findById(id)
			if (!existing) throw new Error('InstallmentPlan not found')
			return repo.deactivate(id)
		},
	}
}
