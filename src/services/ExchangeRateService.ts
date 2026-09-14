import type {
	ExchangeRate,
	ExchangeRateSource,
} from '@/domain/entities/exchange-rate'
import type {
	CreateExchangeRateInput,
	IExchangeRateRepository,
	UpdateExchangeRateInput,
} from '@/domain/repositories/IExchangeRateRepository'

function validateCreate(input: CreateExchangeRateInput): void {
	if (input.source === 'bcp') {
		if (input.rateMid == null) throw new Error('bcp rate requires rateMid')
		if (input.rateBuy != null || input.rateSell != null)
			throw new Error('bcp rate must not include rateBuy or rateSell')
	} else {
		if (input.rateMid != null)
			throw new Error(`${input.source} rate must not include rateMid`)
		if (input.rateBuy == null && input.rateSell == null)
			throw new Error(`${input.source} rate requires rateBuy or rateSell`)
	}
}

export function createExchangeRateService(repo: IExchangeRateRepository) {
	return {
		findAll: (userId: string): Promise<ExchangeRate[]> => repo.findAll(userId),

		findById: async (userId: string, id: number): Promise<ExchangeRate> => {
			const rate = await repo.findById(userId, id)
			if (!rate) throw new Error('ExchangeRate not found')
			return rate
		},

		findBySource: (
			userId: string,
			source: ExchangeRateSource,
		): Promise<ExchangeRate[]> => repo.findBySource(userId, source),

		findLatestBySource: (
			userId: string,
			source: ExchangeRateSource,
		): Promise<ExchangeRate | null> => repo.findLatestBySource(userId, source),

		create: async (
			userId: string,
			input: CreateExchangeRateInput,
		): Promise<ExchangeRate> => {
			validateCreate(input)
			return repo.create(userId, input)
		},

		update: async (
			userId: string,
			id: number,
			input: UpdateExchangeRateInput,
		): Promise<ExchangeRate> => {
			const existing = await repo.findById(userId, id)
			if (!existing) throw new Error('ExchangeRate not found')
			return repo.update(userId, id, input)
		},

		delete: async (userId: string, id: number): Promise<void> => {
			const existing = await repo.findById(userId, id)
			if (!existing) throw new Error('ExchangeRate not found')
			return repo.delete(userId, id)
		},
	}
}
