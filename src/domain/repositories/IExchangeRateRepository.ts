import type { ExchangeRate, ExchangeRateSource } from '@/domain/entities/exchange-rate'

export type CreateExchangeRateInput = {
	source: ExchangeRateSource
	rateBuy?: number
	rateSell?: number
	rateMid?: number
	notes?: string
	recordedAt?: Date
}

export type UpdateExchangeRateInput = {
	rateBuy?: number | null
	rateSell?: number | null
	rateMid?: number | null
	notes?: string | null
	recordedAt?: Date
}

export interface IExchangeRateRepository {
	findAll(): Promise<ExchangeRate[]>
	findById(id: number): Promise<ExchangeRate | null>
	findBySource(source: ExchangeRateSource): Promise<ExchangeRate[]>
	findLatestBySource(source: ExchangeRateSource): Promise<ExchangeRate | null>
	create(input: CreateExchangeRateInput): Promise<ExchangeRate>
	update(id: number, input: UpdateExchangeRateInput): Promise<ExchangeRate>
	delete(id: number): Promise<void>
}
