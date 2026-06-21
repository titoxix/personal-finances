import type { Income } from '@/domain/entities/income'

export type CreateIncomeInput = {
	month: Date
	grossIncomeUsd: number
	budgetCapUsd: number
	automaticInvestmentUsd: number
	automaticDest: string
	exchangeRate: number
	notes?: string
}

export type UpdateIncomeInput = {
	grossIncomeUsd?: number
	budgetCapUsd?: number
	automaticInvestmentUsd?: number
	automaticDest?: string
	exchangeRate?: number
	notes?: string
}

export interface IIncomeRepository {
	findAll(): Promise<Income[]>
	findById(id: number): Promise<Income | null>
	findByMonth(month: Date): Promise<Income | null>
	findByDateRange(start: Date, end: Date): Promise<Income[]>
	create(input: CreateIncomeInput): Promise<Income>
	update(id: number, input: UpdateIncomeInput): Promise<Income>
}
