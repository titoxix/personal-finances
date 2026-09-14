import type {
	ExchangeRate,
	ExchangeRateSource,
} from '@/domain/entities/exchange-rate'
import type {
	CreateExchangeRateInput,
	IExchangeRateRepository,
	UpdateExchangeRateInput,
} from '@/domain/repositories/IExchangeRateRepository'
import type { PrismaClient } from '@/generated/prisma/client'

type PrismaExchangeRate = {
	id: number
	recordedAt: Date
	source: ExchangeRateSource
	rateBuy: { toNumber(): number } | null
	rateSell: { toNumber(): number } | null
	rateMid: { toNumber(): number } | null
	notes: string | null
	createdAt: Date
}

function toDomain(raw: PrismaExchangeRate): ExchangeRate {
	return {
		id: raw.id,
		recordedAt: raw.recordedAt,
		source: raw.source,
		rateBuy: raw.rateBuy?.toNumber() ?? null,
		rateSell: raw.rateSell?.toNumber() ?? null,
		rateMid: raw.rateMid?.toNumber() ?? null,
		notes: raw.notes,
		createdAt: raw.createdAt,
	}
}

export function createPrismaExchangeRateRepository(
	prisma: PrismaClient,
): IExchangeRateRepository {
	return {
		findAll: async (userId) => {
			const rows = await prisma.exchangeRate.findMany({
				where: { userId },
				orderBy: { recordedAt: 'desc' },
			})
			return rows.map(toDomain)
		},
		findById: async (userId, id) => {
			const row = await prisma.exchangeRate.findUnique({
				where: { id, userId },
			})
			return row ? toDomain(row) : null
		},
		findBySource: async (userId, source: ExchangeRateSource) => {
			const rows = await prisma.exchangeRate.findMany({
				where: { userId, source },
				orderBy: { recordedAt: 'desc' },
			})
			return rows.map(toDomain)
		},
		findLatestBySource: async (userId, source: ExchangeRateSource) => {
			const row = await prisma.exchangeRate.findFirst({
				where: { userId, source },
				orderBy: { recordedAt: 'desc' },
			})
			return row ? toDomain(row) : null
		},
		findByDateRange: async (userId, start: Date, end: Date) => {
			const rows = await prisma.exchangeRate.findMany({
				where: { userId, recordedAt: { gte: start, lt: end } },
				orderBy: { recordedAt: 'desc' },
			})
			return rows.map(toDomain)
		},
		create: async (userId, input: CreateExchangeRateInput) => {
			const row = await prisma.exchangeRate.create({
				data: { ...input, userId },
			})
			return toDomain(row)
		},
		update: async (userId, id: number, input: UpdateExchangeRateInput) => {
			const row = await prisma.exchangeRate.update({
				where: { id, userId },
				data: input,
			})
			return toDomain(row)
		},
		delete: async (userId, id: number) => {
			await prisma.exchangeRate.delete({ where: { id, userId } })
		},
	}
}
