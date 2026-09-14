import type { Budget } from '@/domain/entities/budget'

export type CreateBudgetInput = {
	month: Date
	categoryId: number
	essentialityId: number
	budgetedUsd?: number
	budgetedGs?: number
	isRecurring?: boolean
	notes?: string
}

export type UpdateBudgetInput = {
	budgetedUsd?: number | null
	budgetedGs?: number | null
	essentialityId?: number
	isRecurring?: boolean
	notes?: string | null
}

export interface IBudgetRepository {
	findAll(userId: string): Promise<Budget[]>
	findById(userId: string, id: number): Promise<Budget | null>
	findByMonth(userId: string, month: Date): Promise<Budget[]>
	findByMonthAndCategory(
		userId: string,
		month: Date,
		categoryId: number,
	): Promise<Budget | null>
	findByDateRange(userId: string, start: Date, end: Date): Promise<Budget[]>
	findRecurring(userId: string, upToMonth: Date): Promise<Budget[]>
	create(userId: string, input: CreateBudgetInput): Promise<Budget>
	update(userId: string, id: number, input: UpdateBudgetInput): Promise<Budget>
	softDelete(userId: string, id: number, reason?: string): Promise<Budget>
}
