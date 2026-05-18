import type { PrismaClient } from '@/generated/prisma/client'
import type { Budget } from '@/domain/entities/budget'
import type {
	CreateBudgetInput,
	IBudgetRepository,
	UpdateBudgetInput,
} from '@/domain/repositories/IBudgetRepository'

type PrismaBudget = {
	id: number
	month: Date
	categoryId: number
	essentialityId: number
	budgetedUsd: { toNumber(): number } | null
	budgetedGs: { toNumber(): number } | null
	notes: string | null
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
		notes: raw.notes,
		createdAt: raw.createdAt,
	}
}

export function createPrismaBudgetRepository(prisma: PrismaClient): IBudgetRepository {
	return {
		findAll: async () => {
			const rows = await prisma.budget.findMany()
			return rows.map(toDomain)
		},
		findById: async (id) => {
			const row = await prisma.budget.findUnique({ where: { id } })
			return row ? toDomain(row) : null
		},
		findByMonth: async (month: Date) => {
			const rows = await prisma.budget.findMany({ where: { month } })
			return rows.map(toDomain)
		},
		findByMonthAndCategory: async (month: Date, categoryId: number) => {
			const row = await prisma.budget.findUnique({
				where: { month_categoryId: { month, categoryId } },
			})
			return row ? toDomain(row) : null
		},
		create: async (input: CreateBudgetInput) => {
			const row = await prisma.budget.create({ data: input })
			return toDomain(row)
		},
		update: async (id: number, input: UpdateBudgetInput) => {
			const row = await prisma.budget.update({ where: { id }, data: input })
			return toDomain(row)
		},
	}
}
