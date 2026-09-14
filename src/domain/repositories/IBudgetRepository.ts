import type { Budget, BudgetCurrency } from '@/domain/entities/budget'

export type CreateBudgetInput = {
	month: Date
	categoryId: number
	essentialityId: number | null
	budgetedUsd?: number
	budgetedGs?: number
	currency?: BudgetCurrency
	margin?: number
	isRecurring?: boolean
	notes?: string
}

export type UpdateBudgetInput = {
	budgetedUsd?: number | null
	budgetedGs?: number | null
	essentialityId?: number | null
	currency?: BudgetCurrency
	margin?: number
	isRecurring?: boolean
	notes?: string | null
}

export interface IBudgetRepository {
	findAll(): Promise<Budget[]>
	findById(id: number): Promise<Budget | null>
	findByMonth(month: Date): Promise<Budget[]>
	findByMonthAndCategory(
		month: Date,
		categoryId: number,
	): Promise<Budget | null>
	existsForMonthAndCategory(month: Date, categoryId: number): Promise<boolean>
	findByDateRange(start: Date, end: Date): Promise<Budget[]>
	findRecurring(upToMonth: Date): Promise<Budget[]>
	create(input: CreateBudgetInput): Promise<Budget>
	update(id: number, input: UpdateBudgetInput): Promise<Budget>
	softDelete(id: number, reason?: string): Promise<Budget>
}
