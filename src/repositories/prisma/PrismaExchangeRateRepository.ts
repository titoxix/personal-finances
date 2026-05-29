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
		findAll: async () => {
			const rows = await prisma.exchangeRate.findMany({
				orderBy: { recordedAt: 'desc' },
			})
			return rows.map(toDomain)
		},
		findById: async (id) => {
			const row = await prisma.exchangeRate.findUnique({ where: { id } })
			return row ? toDomain(row) : null
		},
		findBySource: async (source: ExchangeRateSource) => {
			const rows = await prisma.exchangeRate.findMany({
				where: { source },
				orderBy: { recordedAt: 'desc' },
			})
			return rows.map(toDomain)
		},
		findLatestBySource: async (source: ExchangeRateSource) => {
			const row = await prisma.exchangeRate.findFirst({
				where: { source },
				orderBy: { recordedAt: 'desc' },
			})
			return row ? toDomain(row) : null
		},
		create: async (input: CreateExchangeRateInput) => {
			const row = await prisma.exchangeRate.create({ data: input })
			return toDomain(row)
		},
		update: async (id: number, input: UpdateExchangeRateInput) => {
			const row = await prisma.exchangeRate.update({
				where: { id },
				data: input,
			})
			return toDomain(row)
		},
		delete: async (id: number) => {
			await prisma.exchangeRate.delete({ where: { id } })
		},
	}
}
