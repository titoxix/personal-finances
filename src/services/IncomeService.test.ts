import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Income } from '@/domain/entities/income'
import type { IIncomeRepository } from '@/domain/repositories/IIncomeRepository'
import { createIncomeService } from './IncomeService'

const makeRepo = (): IIncomeRepository => ({
	findAll: vi.fn(),
	findById: vi.fn(),
	findByMonth: vi.fn(),
	create: vi.fn(),
	update: vi.fn(),
})

const MAY_2026 = new Date('2026-05-01')

const makeIncome = (overrides: Partial<Income> = {}): Income => ({
	id: 1,
	month: MAY_2026,
	grossIncomeUsd: 3000,
	budgetCapUsd: 2000,
	automaticInvestmentUsd: 500,
	automaticDest: 'Fondo inversor',
	exchangeRate: 7800,
	notes: null,
	createdAt: new Date(),
	...overrides,
})

describe('createIncomeService', () => {
	let repo: IIncomeRepository
	let service: ReturnType<typeof createIncomeService>

	beforeEach(() => {
		repo = makeRepo()
		service = createIncomeService(repo)
	})

	describe('findAll', () => {
		it('returns all incomes from repository', async () => {
			const incomes = [makeIncome()]
			vi.mocked(repo.findAll).mockResolvedValue(incomes)

			const result = await service.findAll()

			expect(result).toBe(incomes)
			expect(repo.findAll).toHaveBeenCalledOnce()
		})
	})

	describe('findById', () => {
		it('returns the income when it exists', async () => {
			const income = makeIncome()
			vi.mocked(repo.findById).mockResolvedValue(income)

			const result = await service.findById(1)

			expect(result).toBe(income)
		})

		it('throws when income does not exist', async () => {
			vi.mocked(repo.findById).mockResolvedValue(null)

			await expect(service.findById(999)).rejects.toThrow('Income not found')
		})
	})

	describe('findByMonth', () => {
		it('returns the income for the given month', async () => {
			const income = makeIncome()
			vi.mocked(repo.findByMonth).mockResolvedValue(income)

			const result = await service.findByMonth(MAY_2026)

			expect(result).toBe(income)
			expect(repo.findByMonth).toHaveBeenCalledWith(MAY_2026)
		})

		it('returns null when no income exists for the month', async () => {
			vi.mocked(repo.findByMonth).mockResolvedValue(null)

			const result = await service.findByMonth(MAY_2026)

			expect(result).toBeNull()
		})
	})

	describe('create', () => {
		it('creates and returns the new income', async () => {
			const income = makeIncome()
			vi.mocked(repo.findByMonth).mockResolvedValue(null)
			vi.mocked(repo.create).mockResolvedValue(income)

			const result = await service.create({
				month: MAY_2026,
				grossIncomeUsd: 3000,
				budgetCapUsd: 2000,
				automaticInvestmentUsd: 500,
				automaticDest: 'Fondo inversor',
				exchangeRate: 7800,
			})

			expect(result).toBe(income)
		})

		it('throws when an income already exists for the month', async () => {
			vi.mocked(repo.findByMonth).mockResolvedValue(makeIncome())

			await expect(
				service.create({
					month: MAY_2026,
					grossIncomeUsd: 3000,
					budgetCapUsd: 2000,
					automaticInvestmentUsd: 500,
					automaticDest: 'Fondo inversor',
					exchangeRate: 7800,
				}),
			).rejects.toThrow('Income already exists for this month')
		})
	})

	describe('update', () => {
		it('updates and returns the income', async () => {
			const existing = makeIncome()
			const updated = makeIncome({ grossIncomeUsd: 3500 })
			vi.mocked(repo.findById).mockResolvedValue(existing)
			vi.mocked(repo.update).mockResolvedValue(updated)

			const result = await service.update(1, { grossIncomeUsd: 3500 })

			expect(result).toBe(updated)
			expect(repo.update).toHaveBeenCalledWith(1, { grossIncomeUsd: 3500 })
		})

		it('throws when income does not exist', async () => {
			vi.mocked(repo.findById).mockResolvedValue(null)

			await expect(
				service.update(999, { grossIncomeUsd: 3500 }),
			).rejects.toThrow('Income not found')
		})
	})
})
