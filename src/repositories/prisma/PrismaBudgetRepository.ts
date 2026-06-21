import type { Budget } from '@/domain/entities/budget'
import type {
	CreateBudgetInput,
	IBudgetRepository,
	UpdateBudgetInput,
} from '@/domain/repositories/IBudgetRepository'
import type { PrismaClient } from '@/generated/prisma/client'

type PrismaBudget = {
	id: number
	month: Date
	categoryId: number
	essentialityId: number
	budgetedUsd: { toNumber(): number } | null
	budgetedGs: { toNumber(): number } | null
	isRecurring: boolean
	notes: string | null
	deletedAt: Date | null
	deleteReason: string | null
	createdAt: Date
}

function toDomain(raw: PrismaBudget): Budget {
	return {
		id: raw.id,
		month: raw.month,
		categoryId: raw.categoryId,
		essentialityId: raw.essentialityId,
		budgetedUsd: raw.budgetedUsd?.toNumber() ?? null,
		budgetedGs: raw.budgetedGs?.toNumber() ?? null,
		isRecurring: raw.isRecurring,
		notes: raw.notes,
		deletedAt: raw.deletedAt,
		deleteReason: raw.deleteReason,
		createdAt: raw.createdAt,
	}
}

export function createPrismaBudgetRepository(
	prisma: PrismaClient,
): IBudgetRepository {
	return {
		findAll: async () => {
			const rows = await prisma.budget.findMany({ where: { deletedAt: null } })
			return rows.map(toDomain)
		},
		findById: async (id) => {
			const row = await prisma.budget.findFirst({
				where: { id, deletedAt: null },
			})
			return row ? toDomain(row) : null
		},
		findByMonth: async (month: Date) => {
			const rows = await prisma.budget.findMany({
				where: { month, deletedAt: null },
			})
			return rows.map(toDomain)
		},
		findByMonthAndCategory: async (month: Date, categoryId: number) => {
			const row = await prisma.budget.findFirst({
				where: { month, categoryId, deletedAt: null },
			})
			return row ? toDomain(row) : null
		},
		findByDateRange: async (start: Date, end: Date) => {
			const rows = await prisma.budget.findMany({
				where: { month: { gte: start, lt: end }, deletedAt: null },
				orderBy: { month: 'desc' },
			})
			return rows.map(toDomain)
		},
		findRecurring: async (upToMonth: Date) => {
			const rows = await prisma.budget.findMany({
				where: {
					isRecurring: true,
					month: { lte: upToMonth },
					deletedAt: null,
				},
				orderBy: { month: 'desc' },
			})
			const seen = new Set<number>()
			const latest: typeof rows = []
			for (const row of rows) {
				if (!seen.has(row.categoryId)) {
					seen.add(row.categoryId)
					latest.push(row)
				}
			}
			return latest.map(toDomain)
		},
		create: async (input: CreateBudgetInput) => {
			const row = await prisma.budget.create({ data: input })
			return toDomain(row)
		},
		update: async (id: number, input: UpdateBudgetInput) => {
			const row = await prisma.budget.update({ where: { id }, data: input })
			return toDomain(row)
		},
		softDelete: async (id: number, reason?: string) => {
			const row = await prisma.budget.update({
				where: { id },
				data: { deletedAt: new Date(), deleteReason: reason ?? null },
			})
			return toDomain(row)
		},
	}
}
