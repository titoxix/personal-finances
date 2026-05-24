import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Budget } from '@/domain/entities/budget'
import type { IBudgetRepository } from '@/domain/repositories/IBudgetRepository'
import { createBudgetService } from './BudgetService'

const makeRepo = (): IBudgetRepository => ({
	findAll: vi.fn(),
	findById: vi.fn(),
	findByMonth: vi.fn(),
	findByMonthAndCategory: vi.fn(),
	findRecurring: vi.fn(),
	create: vi.fn(),
	update: vi.fn(),
})

const MAY_2026 = new Date('2026-05-01')
const APR_2026 = new Date('2026-04-01')

const makeBudget = (overrides: Partial<Budget> = {}): Budget => ({
	id: 1,
	month: MAY_2026,
	categoryId: 1,
	essentialityId: 1,
	budgetedUsd: 500,
	budgetedGs: null,
	isRecurring: false,
	notes: null,
	createdAt: new Date(),
	...overrides,
})

describe('createBudgetService', () => {
	let repo: IBudgetRepository
	let service: ReturnType<typeof createBudgetService>

	beforeEach(() => {
		repo = makeRepo()
		service = createBudgetService(repo)
	})

	describe('findAll', () => {
		it('returns all budgets from repository', async () => {
			const budgets = [makeBudget()]
			vi.mocked(repo.findAll).mockResolvedValue(budgets)

			const result = await service.findAll()

			expect(result).toBe(budgets)
			expect(repo.findAll).toHaveBeenCalledOnce()
		})
	})

	describe('findById', () => {
		it('returns the budget when it exists', async () => {
			const budget = makeBudget()
			vi.mocked(repo.findById).mockResolvedValue(budget)

			const result = await service.findById(1)

			expect(result).toBe(budget)
		})

		it('throws when budget does not exist', async () => {
			vi.mocked(repo.findById).mockResolvedValue(null)

			await expect(service.findById(999)).rejects.toThrow('Budget not found')
		})
	})

	describe('findByMonth', () => {
		it('returns specific budgets for the given month', async () => {
			const specific = [makeBudget()]
			vi.mocked(repo.findByMonth).mockResolvedValue(specific)
			vi.mocked(repo.findRecurring).mockResolvedValue([])

			const result = await service.findByMonth(MAY_2026)

			expect(result).toEqual(specific)
		})

		it('fills missing categories with recurring budgets from previous months', async () => {
			const specificCategory2 = makeBudget({ id: 2, categoryId: 2 })
			const recurringCategory1 = makeBudget({ id: 10, month: APR_2026, categoryId: 1, isRecurring: true })
			vi.mocked(repo.findByMonth).mockResolvedValue([specificCategory2])
			vi.mocked(repo.findRecurring).mockResolvedValue([recurringCategory1])

			const result = await service.findByMonth(MAY_2026)

			expect(result).toHaveLength(2)
			expect(result).toContain(specificCategory2)
			expect(result).toContain(recurringCategory1)
		})

		it('does not add recurring budget when specific already exists for that category', async () => {
			const specific = makeBudget({ categoryId: 1 })
			const recurring = makeBudget({ id: 10, month: APR_2026, categoryId: 1, isRecurring: true })
			vi.mocked(repo.findByMonth).mockResolvedValue([specific])
			vi.mocked(repo.findRecurring).mockResolvedValue([recurring])

			const result = await service.findByMonth(MAY_2026)

			expect(result).toHaveLength(1)
			expect(result[0]).toBe(specific)
		})
	})

	describe('findByMonthAndCategory', () => {
		it('returns the budget for the given month and category', async () => {
			const budget = makeBudget()
			vi.mocked(repo.findByMonthAndCategory).mockResolvedValue(budget)

			const result = await service.findByMonthAndCategory(MAY_2026, 1)

			expect(result).toBe(budget)
		})

		it('returns null when no budget exists for that combination', async () => {
			vi.mocked(repo.findByMonthAndCategory).mockResolvedValue(null)

			const result = await service.findByMonthAndCategory(MAY_2026, 99)

			expect(result).toBeNull()
		})
	})

	describe('create', () => {
		it('creates and returns the new budget', async () => {
			const budget = makeBudget()
			vi.mocked(repo.findByMonthAndCategory).mockResolvedValue(null)
			vi.mocked(repo.create).mockResolvedValue(budget)

			const result = await service.create({
				month: MAY_2026,
				categoryId: 1,
				essentialityId: 1,
				budgetedUsd: 500,
			})

			expect(result).toBe(budget)
		})

		it('throws when a budget already exists for that month and category', async () => {
			vi.mocked(repo.findByMonthAndCategory).mockResolvedValue(makeBudget())

			await expect(
				service.create({ month: MAY_2026, categoryId: 1, essentialityId: 1, budgetedUsd: 500 }),
			).rejects.toThrow('Budget already exists for this month and category')
		})

		it('throws when neither budgetedUsd nor budgetedGs is provided', async () => {
			vi.mocked(repo.findByMonthAndCategory).mockResolvedValue(null)

			await expect(
				service.create({ month: MAY_2026, categoryId: 1, essentialityId: 1 }),
			).rejects.toThrow('budget requires budgetedUsd or budgetedGs')
		})
	})

	describe('update', () => {
		it('updates and returns the budget', async () => {
			const existing = makeBudget()
			const updated = makeBudget({ budgetedUsd: 600 })
			vi.mocked(repo.findById).mockResolvedValue(existing)
			vi.mocked(repo.update).mockResolvedValue(updated)

			const result = await service.update(1, { budgetedUsd: 600 })

			expect(result).toBe(updated)
			expect(repo.update).toHaveBeenCalledWith(1, { budgetedUsd: 600 })
		})

		it('throws when budget does not exist', async () => {
			vi.mocked(repo.findById).mockResolvedValue(null)

			await expect(service.update(999, { budgetedUsd: 600 })).rejects.toThrow('Budget not found')
		})
	})
})
