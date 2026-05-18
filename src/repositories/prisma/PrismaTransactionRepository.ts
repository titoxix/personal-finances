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

export function createPrismaTransactionRepository(prisma: PrismaClient): ITransactionRepository {
	return {
		findAll: async () => {
			const rows = await prisma.transaction.findMany({ orderBy: { date: 'desc' } })
			return rows.map(toDomain)
		},
		findById: async (id) => {
			const row = await prisma.transaction.findUnique({ where: { id } })
			return row ? toDomain(row) : null
		},
		findByMonth: async (month: Date) => {
			const rows = await prisma.transaction.findMany({
				where: { date: monthRange(month) },
				orderBy: { date: 'desc' },
			})
			return rows.map(toDomain)
		},
		findByMonthAndCategory: async (month: Date, categoryId: number) => {
			const rows = await prisma.transaction.findMany({
				where: { date: monthRange(month), categoryId },
				orderBy: { date: 'desc' },
			})
			return rows.map(toDomain)
		},
		create: async (input: CreateTransactionInput) => {
			const row = await prisma.transaction.create({ data: input })
			return toDomain(row)
		},
		update: async (id: number, input: UpdateTransactionInput) => {
			const row = await prisma.transaction.update({ where: { id }, data: input })
			return toDomain(row)
		},
		delete: async (id: number) => {
			await prisma.transaction.delete({ where: { id } })
		},
	}
}
