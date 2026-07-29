import type { Income } from '@/domain/entities/income'
import type {
	CreateIncomeInput,
	IIncomeRepository,
	UpdateIncomeInput,
} from '@/domain/repositories/IIncomeRepository'
import type { PrismaClient } from '@/generated/prisma/client'

// TODO(rename): automaticInvestmentUsd/automaticDest -> surplusAllocatedUsd/surplusDest,
// ver TODO en domain/entities/income.ts.
type PrismaIncome = {
	id: number
	month: Date
	grossIncomeUsd: { toNumber(): number }
	budgetCapUsd: { toNumber(): number }
	automaticInvestmentUsd: { toNumber(): number }
	automaticDest: string
	exchangeRate: { toNumber(): number }
	notes: string | null
	createdAt: Date
}

function toDomain(raw: PrismaIncome): Income {
	return {
		id: raw.id,
		month: raw.month,
		grossIncomeUsd: raw.grossIncomeUsd.toNumber(),
		budgetCapUsd: raw.budgetCapUsd.toNumber(),
		automaticInvestmentUsd: raw.automaticInvestmentUsd.toNumber(),
		automaticDest: raw.automaticDest,
		exchangeRate: raw.exchangeRate.toNumber(),
		notes: raw.notes,
		createdAt: raw.createdAt,
	}
}

export function createPrismaIncomeRepository(
	prisma: PrismaClient,
): IIncomeRepository {
	return {
		findAll: async (userId) => {
			const rows = await prisma.income.findMany({
				where: { userId },
				orderBy: { month: 'desc' },
			})
			return rows.map(toDomain)
		},
		findById: async (userId, id) => {
			const row = await prisma.income.findUnique({ where: { id, userId } })
			return row ? toDomain(row) : null
		},
		findByMonth: async (userId, month: Date) => {
			const row = await prisma.income.findFirst({ where: { userId, month } })
			return row ? toDomain(row) : null
		},
		findByDateRange: async (userId, start: Date, end: Date) => {
			const rows = await prisma.income.findMany({
				where: { userId, month: { gte: start, lt: end } },
				orderBy: { month: 'desc' },
			})
			return rows.map(toDomain)
		},
		create: async (userId, input: CreateIncomeInput) => {
			const row = await prisma.income.create({ data: { ...input, userId } })
			return toDomain(row)
		},
		update: async (userId, id: number, input: UpdateIncomeInput) => {
			const row = await prisma.income.update({
				where: { id, userId },
				data: input,
			})
			return toDomain(row)
		},
	}
}
