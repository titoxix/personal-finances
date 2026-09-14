import type { Income } from '@/domain/entities/income'

// TODO(rename): automaticInvestmentUsd/automaticDest -> surplusAllocatedUsd/surplusDest,
// ver TODO en domain/entities/income.ts.
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
	findAll(userId: string): Promise<Income[]>
	findById(userId: string, id: number): Promise<Income | null>
	findByMonth(userId: string, month: Date): Promise<Income | null>
	findByDateRange(userId: string, start: Date, end: Date): Promise<Income[]>
	create(userId: string, input: CreateIncomeInput): Promise<Income>
	update(userId: string, id: number, input: UpdateIncomeInput): Promise<Income>
}
