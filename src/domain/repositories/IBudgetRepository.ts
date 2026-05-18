import type { Budget } from '@/domain/entities/budget'

export type CreateBudgetInput = {
	month: Date
	categoryId: number
	essentialityId: number
	budgetedUsd?: number
	budgetedGs?: number
	notes?: string
}

export type UpdateBudgetInput = {
	budgetedUsd?: number | null
	budgetedGs?: number | null
	essentialityId?: number
	notes?: string | null
}

export interface IBudgetRepository {
	findAll(): Promise<Budget[]>
	findById(id: number): Promise<Budget | null>
	findByMonth(month: Date): Promise<Budget[]>
	findByMonthAndCategory(month: Date, categoryId: number): Promise<Budget | null>
	create(input: CreateBudgetInput): Promise<Budget>
	update(id: number, input: UpdateBudgetInput): Promise<Budget>
}
