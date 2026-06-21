import type { MonthlySnapshot } from '@/domain/entities/monthly-snapshot'
import type { CreateSnapshotInvestmentInput } from '@/domain/entities/snapshot-investment'

export type CreateMonthlySnapshotInput = {
	month: Date
	incomeUsd?: number
	exchangeRateValue?: number
	exchangeRateId?: number
	balanceItauUsd?: number
	balanceItauGs?: number
	balanceUenoUsd?: number
	balanceUenoGs?: number
	balanceMangoGs?: number
	balanceGnbGs?: number
	gnbCardGs?: number
	itauCardGs?: number
	uenoCardGs?: number
	pendingInstallmentsGs?: number
	netWorthUsd?: number
	totalInvestedUsd?: number
	totalDebtUsd?: number
	savingsRatePct?: number
	notes?: string
	investments?: CreateSnapshotInvestmentInput[]
}

export type UpdateMonthlySnapshotInput = {
	incomeUsd?: number | null
	exchangeRateValue?: number | null
	exchangeRateId?: number | null
	balanceItauUsd?: number | null
	balanceItauGs?: number | null
	balanceUenoUsd?: number | null
	balanceUenoGs?: number | null
	balanceMangoGs?: number | null
	balanceGnbGs?: number | null
	gnbCardGs?: number | null
	itauCardGs?: number | null
	uenoCardGs?: number | null
	pendingInstallmentsGs?: number | null
	netWorthUsd?: number | null
	totalInvestedUsd?: number | null
	totalDebtUsd?: number | null
	savingsRatePct?: number | null
	notes?: string | null
	investments?: CreateSnapshotInvestmentInput[]
}

export interface IMonthlySnapshotRepository {
	findAll(): Promise<MonthlySnapshot[]>
	findById(id: number): Promise<MonthlySnapshot | null>
	findByMonth(month: Date): Promise<MonthlySnapshot | null>
	findLatest(): Promise<MonthlySnapshot | null>
	findByDateRange(start: Date, end: Date): Promise<MonthlySnapshot[]>
	create(input: CreateMonthlySnapshotInput): Promise<MonthlySnapshot>
	update(
		id: number,
		input: UpdateMonthlySnapshotInput,
	): Promise<MonthlySnapshot>
}
