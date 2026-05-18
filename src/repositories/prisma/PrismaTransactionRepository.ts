import type { PrismaClient } from '@/generated/prisma/client'
import type { Transaction } from '@/domain/entities/transaction'
import type { PaymentMethod } from '@/domain/entities/recurring-item'
import type {
	CreateTransactionInput,
	ITransactionRepository,
	UpdateTransactionInput,
} from '@/domain/repositories/ITransactionRepository'

type PrismaTransaction = {
	id: number
	date: Date
	description: string
	amountGs: { toNumber(): number } | null
	amountUsd: { toNumber(): number } | null
	exchangeRateValue: { toNumber(): number } | null
	exchangeRateId: number | null
	categoryId: number
	essentialityId: number
	paymentMethod: PaymentMethod
	weekOfMonth: number | null
	isInstallment: boolean
	installmentCurrent: number | null
	installmentTotal: number | null
	installmentPlanId: number | null
	isRecurring: boolean
	notes: string | null
	createdAt: Date
}

function toDomain(raw: PrismaTransaction): Transaction {
	return {
		id: raw.id,
		date: raw.date,
		description: raw.description,
		amountGs: raw.amountGs?.toNumber() ?? null,
		amountUsd: raw.amountUsd?.toNumber() ?? null,
		exchangeRateValue: raw.exchangeRateValue?.toNumber() ?? null,
		exchangeRateId: raw.exchangeRateId,
		categoryId: raw.categoryId,
		essentialityId: raw.essentialityId,
		paymentMethod: raw.paymentMethod,
		weekOfMonth: raw.weekOfMonth,
		isInstallment: raw.isInstallment,
		installmentCurrent: raw.installmentCurrent,
		installmentTotal: raw.installmentTotal,
		installmentPlanId: raw.installmentPlanId,
		isRecurring: raw.isRecurring,
		notes: raw.notes,
		createdAt: raw.createdAt,
	}
}

function monthRange(month: Date): { gte: Date; lt: Date } {
	const start = new Date(Date.UTC(month.getUTCFullYear(), month.getUTCMonth(), 1))
	const end = new Date(Date.UTC(month.getUTCFullYear(), month.getUTCMonth() + 1, 1))
	return { gte: start, lt: end }
}

export class PrismaTransactionRepository implements ITransactionRepository {
	constructor(private readonly prisma: PrismaClient) {}

	async findAll(): Promise<Transaction[]> {
		const rows = await this.prisma.transaction.findMany({
			orderBy: { date: 'desc' },
		})
		return rows.map(toDomain)
	}

	async findById(id: number): Promise<Transaction | null> {
		const row = await this.prisma.transaction.findUnique({ where: { id } })
		return row ? toDomain(row) : null
	}

	async findByMonth(month: Date): Promise<Transaction[]> {
		const rows = await this.prisma.transaction.findMany({
			where: { date: monthRange(month) },
			orderBy: { date: 'desc' },
		})
		return rows.map(toDomain)
	}

	async findByMonthAndCategory(month: Date, categoryId: number): Promise<Transaction[]> {
		const rows = await this.prisma.transaction.findMany({
			where: { date: monthRange(month), categoryId },
			orderBy: { date: 'desc' },
		})
		return rows.map(toDomain)
	}

	async create(input: CreateTransactionInput): Promise<Transaction> {
		const row = await this.prisma.transaction.create({ data: input })
		return toDomain(row)
	}

	async update(id: number, input: UpdateTransactionInput): Promise<Transaction> {
		const row = await this.prisma.transaction.update({ where: { id }, data: input })
		return toDomain(row)
	}

	async delete(id: number): Promise<void> {
		await this.prisma.transaction.delete({ where: { id } })
	}
}
