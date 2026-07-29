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
	findAll(userId: string): Promise<InstallmentPlan[]>
	findById(userId: string, id: number): Promise<InstallmentPlan | null>
	findActive(userId: string): Promise<InstallmentPlan[]>
	findActiveInDateRange(
		userId: string,
		start: Date,
		end: Date,
	): Promise<InstallmentPlan[]>
	create(
		userId: string,
		input: CreateInstallmentPlanInput,
	): Promise<InstallmentPlan>
	update(
		userId: string,
		id: number,
		input: UpdateInstallmentPlanInput,
	): Promise<InstallmentPlan>
	deactivate(userId: string, id: number): Promise<InstallmentPlan>
}
