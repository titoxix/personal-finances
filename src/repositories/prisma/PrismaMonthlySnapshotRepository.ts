import type { MonthlySnapshot } from '@/domain/entities/monthly-snapshot'
import type {
	CreateMonthlySnapshotInput,
	IMonthlySnapshotRepository,
	UpdateMonthlySnapshotInput,
} from '@/domain/repositories/IMonthlySnapshotRepository'
import type { PrismaClient } from '@/generated/prisma/client'

type Dec = { toNumber(): number } | null

type PrismaSnapshotInvestment = {
	id: number
	snapshotId: number
	name: string
	currency: 'USD' | 'GS'
	value: { toNumber(): number }
	returnPct: { toNumber(): number } | null
	createdAt: Date
}

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
	itauCardGs: Dec
	uenoCardGs: Dec
	pendingInstallmentsGs: Dec
	netWorthUsd: Dec
	totalInvestedUsd: Dec
	totalDebtUsd: Dec
	savingsRatePct: Dec
	notes: string | null
	createdAt: Date
	investments: PrismaSnapshotInvestment[]
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
		itauCardGs: raw.itauCardGs?.toNumber() ?? null,
		uenoCardGs: raw.uenoCardGs?.toNumber() ?? null,
		pendingInstallmentsGs: raw.pendingInstallmentsGs?.toNumber() ?? null,
		netWorthUsd: raw.netWorthUsd?.toNumber() ?? null,
		totalInvestedUsd: raw.totalInvestedUsd?.toNumber() ?? null,
		totalDebtUsd: raw.totalDebtUsd?.toNumber() ?? null,
		savingsRatePct: raw.savingsRatePct?.toNumber() ?? null,
		notes: raw.notes,
		createdAt: raw.createdAt,
		investments: raw.investments.map((inv) => ({
			id: inv.id,
			snapshotId: inv.snapshotId,
			name: inv.name,
			currency: inv.currency,
			value: inv.value.toNumber(),
			returnPct: inv.returnPct?.toNumber() ?? null,
			createdAt: inv.createdAt,
		})),
	}
}

export function createPrismaMonthlySnapshotRepository(
	prisma: PrismaClient,
): IMonthlySnapshotRepository {
	return {
		findAll: async () => {
			const rows = await prisma.monthlySnapshot.findMany({
				orderBy: { month: 'desc' },
				include: { investments: true },
			})
			return rows.map(toDomain)
		},
		findById: async (id) => {
			const row = await prisma.monthlySnapshot.findUnique({
				where: { id },
				include: { investments: true },
			})
			return row ? toDomain(row) : null
		},
		findByMonth: async (month: Date) => {
			const row = await prisma.monthlySnapshot.findUnique({
				where: { month },
				include: { investments: true },
			})
			return row ? toDomain(row) : null
		},
		findLatest: async () => {
			const row = await prisma.monthlySnapshot.findFirst({
				orderBy: { month: 'desc' },
				include: { investments: true },
			})
			return row ? toDomain(row) : null
		},
		create: async (input: CreateMonthlySnapshotInput) => {
			const { investments, ...snapshotData } = input
			const row = await prisma.monthlySnapshot.create({
				data: {
					...snapshotData,
					...(investments?.length && { investments: { create: investments } }),
				},
				include: { investments: true },
			})
			return toDomain(row)
		},
		update: async (id: number, input: UpdateMonthlySnapshotInput) => {
			const { investments, ...snapshotData } = input
			const row = await prisma.monthlySnapshot.update({
				where: { id },
				data: {
					...snapshotData,
					...(investments !== undefined && {
						investments: { deleteMany: {}, create: investments },
					}),
				},
				include: { investments: true },
			})
			return toDomain(row)
		},
	}
}
