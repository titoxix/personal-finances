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
	findAll(): Promise<Budget[]>
	findById(id: number): Promise<Budget | null>
	findByMonth(month: Date): Promise<Budget[]>
	findByMonthAndCategory(month: Date, categoryId: number): Promise<Budget | null>
	findRecurring(upToMonth: Date): Promise<Budget[]>
	create(input: CreateBudgetInput): Promise<Budget>
	update(id: number, input: UpdateBudgetInput): Promise<Budget>
}
