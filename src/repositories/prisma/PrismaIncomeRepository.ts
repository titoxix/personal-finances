import type { PrismaClient } from '@/generated/prisma/client'
import type { Income } from '@/domain/entities/income'
import type {
	CreateIncomeInput,
	IIncomeRepository,
	UpdateIncomeInput,
} from '@/domain/repositories/IIncomeRepository'

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

export class PrismaIncomeRepository implements IIncomeRepository {
	constructor(private readonly prisma: PrismaClient) {}

	async findAll(): Promise<Income[]> {
		const rows = await this.prisma.income.findMany({
			orderBy: { month: 'desc' },
		})
		return rows.map(toDomain)
	}

	async findById(id: number): Promise<Income | null> {
		const row = await this.prisma.income.findUnique({ where: { id } })
		return row ? toDomain(row) : null
	}

	async findByMonth(month: Date): Promise<Income | null> {
		const row = await this.prisma.income.findFirst({ where: { month } })
		return row ? toDomain(row) : null
	}

	async create(input: CreateIncomeInput): Promise<Income> {
		const row = await this.prisma.income.create({ data: input })
		return toDomain(row)
	}

	async update(id: number, input: UpdateIncomeInput): Promise<Income> {
		const row = await this.prisma.income.update({ where: { id }, data: input })
		return toDomain(row)
	}
}
