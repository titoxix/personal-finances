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

export class PrismaBudgetRepository implements IBudgetRepository {
	constructor(private readonly prisma: PrismaClient) {}

	async findAll(): Promise<Budget[]> {
		const rows = await this.prisma.budget.findMany()
		return rows.map(toDomain)
	}

	async findById(id: number): Promise<Budget | null> {
		const row = await this.prisma.budget.findUnique({ where: { id } })
		return row ? toDomain(row) : null
	}

	async findByMonth(month: Date): Promise<Budget[]> {
		const rows = await this.prisma.budget.findMany({ where: { month } })
		return rows.map(toDomain)
	}

	async findByMonthAndCategory(month: Date, categoryId: number): Promise<Budget | null> {
		const row = await this.prisma.budget.findUnique({
			where: { month_categoryId: { month, categoryId } },
		})
		return row ? toDomain(row) : null
	}

	async create(input: CreateBudgetInput): Promise<Budget> {
		const row = await this.prisma.budget.create({ data: input })
		return toDomain(row)
	}

	async update(id: number, input: UpdateBudgetInput): Promise<Budget> {
		const row = await this.prisma.budget.update({ where: { id }, data: input })
		return toDomain(row)
	}
}
