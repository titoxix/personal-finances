import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { ExchangeRate } from '@/domain/entities/exchange-rate'
import type { IExchangeRateRepository } from '@/domain/repositories/IExchangeRateRepository'
import { createExchangeRateService } from './ExchangeRateService'

const makeRepo = (): IExchangeRateRepository => ({
	findAll: vi.fn(),
	findById: vi.fn(),
	findBySource: vi.fn(),
	findLatestBySource: vi.fn(),
	create: vi.fn(),
	update: vi.fn(),
	delete: vi.fn(),
})

const makeRate = (overrides: Partial<ExchangeRate> = {}): ExchangeRate => ({
	id: 1,
	recordedAt: new Date('2026-05-01'),
	source: 'itau',
	rateBuy: 7800,
	rateSell: 7900,
	rateMid: null,
	notes: null,
	createdAt: new Date(),
	...overrides,
})

describe('createExchangeRateService', () => {
	let repo: IExchangeRateRepository
	let service: ReturnType<typeof createExchangeRateService>

	beforeEach(() => {
		repo = makeRepo()
		service = createExchangeRateService(repo)
	})

	describe('findAll', () => {
		it('returns all rates from repository', async () => {
			const rates = [
				makeRate(),
				makeRate({
					id: 2,
					source: 'bcp',
					rateBuy: null,
					rateSell: null,
					rateMid: 7850,
				}),
			]
			vi.mocked(repo.findAll).mockResolvedValue(rates)

			const result = await service.findAll()

			expect(result).toBe(rates)
			expect(repo.findAll).toHaveBeenCalledOnce()
		})
	})

	describe('findById', () => {
		it('returns the rate when it exists', async () => {
			const rate = makeRate()
			vi.mocked(repo.findById).mockResolvedValue(rate)

			const result = await service.findById(1)

			expect(result).toBe(rate)
		})

		it('throws when rate does not exist', async () => {
			vi.mocked(repo.findById).mockResolvedValue(null)

			await expect(service.findById(999)).rejects.toThrow(
				'ExchangeRate not found',
			)
		})
	})

	describe('findBySource', () => {
		it('returns rates for the given source', async () => {
			const rates = [makeRate()]
			vi.mocked(repo.findBySource).mockResolvedValue(rates)

			const result = await service.findBySource('itau')

			expect(result).toBe(rates)
			expect(repo.findBySource).toHaveBeenCalledWith('itau')
		})
	})

	describe('findLatestBySource', () => {
		it('returns the latest rate for the given source', async () => {
			const rate = makeRate()
			vi.mocked(repo.findLatestBySource).mockResolvedValue(rate)

			const result = await service.findLatestBySource('itau')

			expect(result).toBe(rate)
		})

		it('returns null when no rate exists for the source', async () => {
			vi.mocked(repo.findLatestBySource).mockResolvedValue(null)

			const result = await service.findLatestBySource('ueno')

			expect(result).toBeNull()
		})
	})

	describe('create', () => {
		it('creates a bank rate with rateBuy and rateSell', async () => {
			const rate = makeRate()
			vi.mocked(repo.create).mockResolvedValue(rate)

			const result = await service.create({
				source: 'itau',
				rateBuy: 7800,
				rateSell: 7900,
			})

			expect(result).toBe(rate)
			expect(repo.create).toHaveBeenCalledWith({
				source: 'itau',
				rateBuy: 7800,
				rateSell: 7900,
			})
		})

		it('creates a BCP rate with rateMid', async () => {
			const rate = makeRate({
				source: 'bcp',
				rateBuy: null,
				rateSell: null,
				rateMid: 7850,
			})
			vi.mocked(repo.create).mockResolvedValue(rate)

			const result = await service.create({ source: 'bcp', rateMid: 7850 })

			expect(result).toBe(rate)
		})

		it('throws when a bank rate has no rateBuy or rateSell', async () => {
			await expect(service.create({ source: 'itau' })).rejects.toThrow(
				'itau rate requires rateBuy or rateSell',
			)
		})

		it('throws when a bank rate includes rateMid', async () => {
			await expect(
				service.create({ source: 'ueno', rateBuy: 7800, rateMid: 7850 }),
			).rejects.toThrow('ueno rate must not include rateMid')
		})

		it('throws when BCP rate has no rateMid', async () => {
			await expect(
				service.create({ source: 'bcp', rateBuy: 7800 }),
			).rejects.toThrow('bcp rate requires rateMid')
		})

		it('throws when BCP rate includes rateBuy or rateSell', async () => {
			await expect(
				service.create({ source: 'bcp', rateMid: 7850, rateBuy: 7800 }),
			).rejects.toThrow('bcp rate must not include rateBuy or rateSell')
		})
	})
})
