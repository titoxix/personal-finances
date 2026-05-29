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
		findAll: (): Promise<ExchangeRate[]> => repo.findAll(),

		findById: async (id: number): Promise<ExchangeRate> => {
			const rate = await repo.findById(id)
			if (!rate) throw new Error('ExchangeRate not found')
			return rate
		},

		findBySource: (source: ExchangeRateSource): Promise<ExchangeRate[]> =>
			repo.findBySource(source),

		findLatestBySource: (
			source: ExchangeRateSource,
		): Promise<ExchangeRate | null> => repo.findLatestBySource(source),

		create: async (input: CreateExchangeRateInput): Promise<ExchangeRate> => {
			validateCreate(input)
			return repo.create(input)
		},

		update: async (
			id: number,
			input: UpdateExchangeRateInput,
		): Promise<ExchangeRate> => {
			const existing = await repo.findById(id)
			if (!existing) throw new Error('ExchangeRate not found')
			return repo.update(id, input)
		},

		delete: async (id: number): Promise<void> => {
			const existing = await repo.findById(id)
			if (!existing) throw new Error('ExchangeRate not found')
			return repo.delete(id)
		},
	}
}
