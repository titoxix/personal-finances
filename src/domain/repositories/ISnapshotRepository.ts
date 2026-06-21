import type { Snapshot } from '@/domain/entities/snapshot'
import type { CreateSnapshotInvestmentInput } from '@/domain/entities/snapshot-investment'

export type CreateSnapshotInput = {
	date: Date
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

export type UpdateSnapshotInput = {
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

export interface ISnapshotRepository {
	findAll(): Promise<Snapshot[]>
	findById(id: number): Promise<Snapshot | null>
	findLatest(): Promise<Snapshot | null>
	findByDateRange(start: Date, end: Date): Promise<Snapshot[]>
	create(input: CreateSnapshotInput): Promise<Snapshot>
	update(id: number, input: UpdateSnapshotInput): Promise<Snapshot>
}
