import type { Snapshot } from '@/domain/entities/snapshot'
import type {
	CreateSnapshotInput,
	ISnapshotRepository,
	UpdateSnapshotInput,
} from '@/domain/repositories/ISnapshotRepository'
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

type PrismaSnapshot = {
	id: number
	date: Date
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

function toDomain(raw: PrismaSnapshot): Snapshot {
	return {
		id: raw.id,
		date: raw.date,
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

export function createPrismaSnapshotRepository(
	prisma: PrismaClient,
): ISnapshotRepository {
	return {
		findAll: async () => {
			const rows = await prisma.snapshot.findMany({
				orderBy: { date: 'desc' },
				include: { investments: true },
			})
			return rows.map(toDomain)
		},
		findById: async (id) => {
			const row = await prisma.snapshot.findUnique({
				where: { id },
				include: { investments: true },
			})
			return row ? toDomain(row) : null
		},
		findByDateRange: async (start: Date, end: Date) => {
			const rows = await prisma.snapshot.findMany({
				where: { date: { gte: start, lt: end } },
				orderBy: { date: 'desc' },
				include: { investments: true },
			})
			return rows.map(toDomain)
		},
		findLatest: async () => {
			const row = await prisma.snapshot.findFirst({
				orderBy: { date: 'desc' },
				include: { investments: true },
			})
			return row ? toDomain(row) : null
		},
		create: async (input: CreateSnapshotInput) => {
			const { investments, ...snapshotData } = input
			const row = await prisma.snapshot.create({
				data: {
					...snapshotData,
					...(investments?.length && { investments: { create: investments } }),
				},
				include: { investments: true },
			})
			return toDomain(row)
		},
		update: async (id: number, input: UpdateSnapshotInput) => {
			const { investments, ...snapshotData } = input
			const row = await prisma.snapshot.update({
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
