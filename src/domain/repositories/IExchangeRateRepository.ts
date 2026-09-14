import type {
	ExchangeRate,
	ExchangeRateSource,
} from '@/domain/entities/exchange-rate'

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
	findAll(userId: string): Promise<ExchangeRate[]>
	findById(userId: string, id: number): Promise<ExchangeRate | null>
	findBySource(
		userId: string,
		source: ExchangeRateSource,
	): Promise<ExchangeRate[]>
	findLatestBySource(
		userId: string,
		source: ExchangeRateSource,
	): Promise<ExchangeRate | null>
	findByDateRange(
		userId: string,
		start: Date,
		end: Date,
	): Promise<ExchangeRate[]>
	create(userId: string, input: CreateExchangeRateInput): Promise<ExchangeRate>
	update(
		userId: string,
		id: number,
		input: UpdateExchangeRateInput,
	): Promise<ExchangeRate>
	delete(userId: string, id: number): Promise<void>
}
