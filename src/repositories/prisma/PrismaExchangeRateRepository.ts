import type { PrismaClient } from '@/generated/prisma/client'
import type { ExchangeRate, ExchangeRateSource } from '@/domain/entities/exchange-rate'
import type {
	CreateExchangeRateInput,
	IExchangeRateRepository,
} from '@/domain/repositories/IExchangeRateRepository'

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

export class PrismaExchangeRateRepository implements IExchangeRateRepository {
	constructor(private readonly prisma: PrismaClient) {}

	async findAll(): Promise<ExchangeRate[]> {
		const rows = await this.prisma.exchangeRate.findMany({
			orderBy: { recordedAt: 'desc' },
		})
		return rows.map(toDomain)
	}

	async findById(id: number): Promise<ExchangeRate | null> {
		const row = await this.prisma.exchangeRate.findUnique({ where: { id } })
		return row ? toDomain(row) : null
	}

	async findBySource(source: ExchangeRateSource): Promise<ExchangeRate[]> {
		const rows = await this.prisma.exchangeRate.findMany({
			where: { source },
			orderBy: { recordedAt: 'desc' },
		})
		return rows.map(toDomain)
	}

	async findLatestBySource(source: ExchangeRateSource): Promise<ExchangeRate | null> {
		const row = await this.prisma.exchangeRate.findFirst({
			where: { source },
			orderBy: { recordedAt: 'desc' },
		})
		return row ? toDomain(row) : null
	}

	async create(input: CreateExchangeRateInput): Promise<ExchangeRate> {
		const row = await this.prisma.exchangeRate.create({ data: input })
		return toDomain(row)
	}
}
