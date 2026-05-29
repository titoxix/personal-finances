import type { MonthlySnapshot } from '@/domain/entities/monthly-snapshot'
import type {
	CreateMonthlySnapshotInput,
	IMonthlySnapshotRepository,
	UpdateMonthlySnapshotInput,
} from '@/domain/repositories/IMonthlySnapshotRepository'
import type { PrismaClient } from '@/generated/prisma/client'

type Dec = { toNumber(): number } | null

type PrismaMonthlySnapshot = {
	id: number
	month: Date
	incomeUsd: Dec
	exchangeRateValue: Dec
	exchangeRateId: number | null
	balanceItauUsd: Dec
	balanceItauGs: Dec
	balanceUenoUsd: Dec
	balanceUenoGs: Dec
	balanceMangoGs: Dec
	balanceGnbGs: Dec
	gnbCardGs: Dec
	investorFundUsd: Dec
	investorFundGs: Dec
	investorReturnPct: Dec
	etfPortfolioUsd: Dec
	etfReturnPct: Dec
	itauCardGs: Dec
	uenoCardGs: Dec
	pendingInstallmentsGs: Dec
	netWorthUsd: Dec
	totalInvestedUsd: Dec
	totalDebtUsd: Dec
	savingsRatePct: Dec
	notes: string | null
	createdAt: Date
}

function toDomain(raw: PrismaMonthlySnapshot): MonthlySnapshot {
	return {
		id: raw.id,
		month: raw.month,
		incomeUsd: raw.incomeUsd?.toNumber() ?? null,
		exchangeRateValue: raw.exchangeRateValue?.toNumber() ?? null,
		exchangeRateId: raw.exchangeRateId,
		balanceItauUsd: raw.balanceItauUsd?.toNumber() ?? null,
		balanceItauGs: raw.balanceItauGs?.toNumber() ?? null,
		balanceUenoUsd: raw.balanceUenoUsd?.toNumber() ?? null,
		balanceUenoGs: raw.balanceUenoGs?.toNumber() ?? null,
		balanceMangoGs: raw.balanceMangoGs?.toNumber() ?? null,
		balanceGnbGs: raw.balanceGnbGs?.toNumber() ?? null,
		gnbCardGs: raw.gnbCardGs?.toNumber() ?? null,
		investorFundUsd: raw.investorFundUsd?.toNumber() ?? null,
		investorFundGs: raw.investorFundGs?.toNumber() ?? null,
		investorReturnPct: raw.investorReturnPct?.toNumber() ?? null,
		etfPortfolioUsd: raw.etfPortfolioUsd?.toNumber() ?? null,
		etfReturnPct: raw.etfReturnPct?.toNumber() ?? null,
		itauCardGs: raw.itauCardGs?.toNumber() ?? null,
		uenoCardGs: raw.uenoCardGs?.toNumber() ?? null,
		pendingInstallmentsGs: raw.pendingInstallmentsGs?.toNumber() ?? null,
		netWorthUsd: raw.netWorthUsd?.toNumber() ?? null,
		totalInvestedUsd: raw.totalInvestedUsd?.toNumber() ?? null,
		totalDebtUsd: raw.totalDebtUsd?.toNumber() ?? null,
		savingsRatePct: raw.savingsRatePct?.toNumber() ?? null,
		notes: raw.notes,
		createdAt: raw.createdAt,
	}
}

export function createPrismaMonthlySnapshotRepository(
	prisma: PrismaClient,
): IMonthlySnapshotRepository {
	return {
		findAll: async () => {
			const rows = await prisma.monthlySnapshot.findMany({
				orderBy: { month: 'desc' },
			})
			return rows.map(toDomain)
		},
		findById: async (id) => {
			const row = await prisma.monthlySnapshot.findUnique({ where: { id } })
			return row ? toDomain(row) : null
		},
		findByMonth: async (month: Date) => {
			const row = await prisma.monthlySnapshot.findUnique({ where: { month } })
			return row ? toDomain(row) : null
		},
		findLatest: async () => {
			const row = await prisma.monthlySnapshot.findFirst({
				orderBy: { month: 'desc' },
			})
			return row ? toDomain(row) : null
		},
		create: async (input: CreateMonthlySnapshotInput) => {
			const row = await prisma.monthlySnapshot.create({ data: input })
			return toDomain(row)
		},
		update: async (id: number, input: UpdateMonthlySnapshotInput) => {
			const row = await prisma.monthlySnapshot.update({
				where: { id },
				data: input,
			})
			return toDomain(row)
		},
	}
}
