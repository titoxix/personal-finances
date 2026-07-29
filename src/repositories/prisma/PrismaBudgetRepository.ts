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
		findAll: async (userId) => {
			const rows = await prisma.budget.findMany({
				where: { userId, deletedAt: null },
			})
			return rows.map(toDomain)
		},
		findById: async (userId, id) => {
			const row = await prisma.budget.findFirst({
				where: { id, userId, deletedAt: null },
			})
			return row ? toDomain(row) : null
		},
		findByMonth: async (userId, month: Date) => {
			const rows = await prisma.budget.findMany({
				where: { userId, month, deletedAt: null },
			})
			return rows.map(toDomain)
		},
		findByMonthAndCategory: async (userId, month: Date, categoryId: number) => {
			const row = await prisma.budget.findFirst({
				where: { userId, month, categoryId, deletedAt: null },
			})
			return row ? toDomain(row) : null
		},
		findByDateRange: async (userId, start: Date, end: Date) => {
			const rows = await prisma.budget.findMany({
				where: { userId, month: { gte: start, lt: end }, deletedAt: null },
				orderBy: { month: 'desc' },
			})
			return rows.map(toDomain)
		},
		findRecurring: async (userId, upToMonth: Date) => {
			const rows = await prisma.budget.findMany({
				where: {
					userId,
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
		create: async (userId, input: CreateBudgetInput) => {
			const row = await prisma.budget.create({ data: { ...input, userId } })
			return toDomain(row)
		},
		update: async (userId, id: number, input: UpdateBudgetInput) => {
			const row = await prisma.budget.update({
				where: { id, userId },
				data: input,
			})
			return toDomain(row)
		},
		softDelete: async (userId, id: number, reason?: string) => {
			const row = await prisma.budget.update({
				where: { id, userId },
				data: { deletedAt: new Date(), deleteReason: reason ?? null },
			})
			return toDomain(row)
		},
	}
}
