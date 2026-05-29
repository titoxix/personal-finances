import type { InstallmentPlan } from '@/domain/entities/installment-plan'
import type { PaymentMethod } from '@/domain/entities/recurring-item'

export type CreateInstallmentPlanInput = {
	description: string
	installmentsTotal: number
	startDate: Date
	paymentMethod: PaymentMethod
	categoryId: number
	essentialityId: number
	totalAmountGs?: number
	totalAmountUsd?: number
	installmentAmountGs?: number
	endDate?: Date
	notes?: string
}

export type UpdateInstallmentPlanInput = {
	description?: string
	installmentsPaid?: number
	totalAmountGs?: number | null
	totalAmountUsd?: number | null
	installmentAmountGs?: number | null
	endDate?: Date | null
	paymentMethod?: PaymentMethod
	categoryId?: number
	essentialityId?: number
	notes?: string | null
}

export interface IInstallmentPlanRepository {
	findAll(): Promise<InstallmentPlan[]>
	findById(id: number): Promise<InstallmentPlan | null>
	findActive(): Promise<InstallmentPlan[]>
	create(input: CreateInstallmentPlanInput): Promise<InstallmentPlan>
	update(
		id: number,
		input: UpdateInstallmentPlanInput,
	): Promise<InstallmentPlan>
	deactivate(id: number): Promise<InstallmentPlan>
}
