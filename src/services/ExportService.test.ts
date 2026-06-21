import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { IBudgetRepository } from '@/domain/repositories/IBudgetRepository'
import type { IExchangeRateRepository } from '@/domain/repositories/IExchangeRateRepository'
import type { IIncomeRepository } from '@/domain/repositories/IIncomeRepository'
import type { IInstallmentPlanRepository } from '@/domain/repositories/IInstallmentPlanRepository'
import type { IMonthlySnapshotRepository } from '@/domain/repositories/IMonthlySnapshotRepository'
import type { IRecurringItemRepository } from '@/domain/repositories/IRecurringItemRepository'
import type { ITransactionRepository } from '@/domain/repositories/ITransactionRepository'
import { createExportService, type ExportServiceDeps } from './ExportService'

const makeTransactionRepo = (): ITransactionRepository => ({
	findAll: vi.fn(),
	findById: vi.fn(),
	findByMonth: vi.fn(),
	findByMonthAndCategory: vi.fn(),
	findByDateRange: vi.fn(),
	create: vi.fn(),
	update: vi.fn(),
	delete: vi.fn(),
})

const makeIncomeRepo = (): IIncomeRepository => ({
	findAll: vi.fn(),
	findById: vi.fn(),
	findByMonth: vi.fn(),
	findByDateRange: vi.fn(),
	create: vi.fn(),
	update: vi.fn(),
})

const makeBudgetRepo = (): IBudgetRepository => ({
	findAll: vi.fn(),
	findById: vi.fn(),
	findByMonth: vi.fn(),
	findByMonthAndCategory: vi.fn(),
	findByDateRange: vi.fn(),
	findRecurring: vi.fn(),
	create: vi.fn(),
	update: vi.fn(),
	softDelete: vi.fn(),
})

const makeExchangeRateRepo = (): IExchangeRateRepository => ({
	findAll: vi.fn(),
	findById: vi.fn(),
	findBySource: vi.fn(),
	findLatestBySource: vi.fn(),
	findByDateRange: vi.fn(),
	create: vi.fn(),
	update: vi.fn(),
	delete: vi.fn(),
})

const makeRecurringItemRepo = (): IRecurringItemRepository => ({
	findAll: vi.fn(),
	findById: vi.fn(),
	findActive: vi.fn(),
	create: vi.fn(),
	update: vi.fn(),
	deactivate: vi.fn(),
})

const makeInstallmentPlanRepo = (): IInstallmentPlanRepository => ({
	findAll: vi.fn(),
	findById: vi.fn(),
	findActive: vi.fn(),
	findActiveInDateRange: vi.fn(),
	create: vi.fn(),
	update: vi.fn(),
	deactivate: vi.fn(),
})

const makeMonthlySnapshotRepo = (): IMonthlySnapshotRepository => ({
	findAll: vi.fn(),
	findById: vi.fn(),
	findByMonth: vi.fn(),
	findLatest: vi.fn(),
	findByDateRange: vi.fn(),
	create: vi.fn(),
	update: vi.fn(),
})

function makeDeps() {
	const transactionRepo = makeTransactionRepo()
	const incomeRepo = makeIncomeRepo()
	const budgetRepo = makeBudgetRepo()
	const exchangeRateRepo = makeExchangeRateRepo()
	const recurringItemRepo = makeRecurringItemRepo()
	const installmentPlanRepo = makeInstallmentPlanRepo()
	const monthlySnapshotRepo = makeMonthlySnapshotRepo()

	const deps: ExportServiceDeps = {
		transactionRepo,
		incomeRepo,
		budgetRepo,
		exchangeRateRepo,
		recurringItemRepo,
		installmentPlanRepo,
		monthlySnapshotRepo,
	}

	return {
		deps,
		transactionRepo,
		incomeRepo,
		budgetRepo,
		exchangeRateRepo,
		recurringItemRepo,
		installmentPlanRepo,
		monthlySnapshotRepo,
	}
}

const JUN_START = new Date('2026-06-01')
const JUL_START = new Date('2026-07-01')
const YEAR_START = new Date('2026-01-01')
const NEXT_YEAR_START = new Date('2027-01-01')

describe('createExportService', () => {
	let d: ReturnType<typeof makeDeps>
	let service: ReturnType<typeof createExportService>

	beforeEach(() => {
		d = makeDeps()
		service = createExportService(d.deps)
	})

	describe('count', () => {
		it('counts transactions by date range', async () => {
			vi.mocked(d.transactionRepo.findByDateRange).mockResolvedValue([
				{ id: 1 } as never,
				{ id: 2 } as never,
			])

			const result = await service.count('transactions', {
				start: JUN_START,
				end: JUL_START,
			})

			expect(result.entityType).toBe('transactions')
			expect(result.count).toBe(2)
			expect(d.transactionRepo.findByDateRange).toHaveBeenCalledWith(
				JUN_START,
				JUL_START,
			)
		})

		it('counts incomes by date range', async () => {
			vi.mocked(d.incomeRepo.findByDateRange).mockResolvedValue([
				{ id: 1 } as never,
			])

			const result = await service.count('incomes', {
				start: JUN_START,
				end: JUL_START,
			})

			expect(result.entityType).toBe('incomes')
			expect(result.count).toBe(1)
		})

		it('counts budgets by date range', async () => {
			vi.mocked(d.budgetRepo.findByDateRange).mockResolvedValue([
				{ id: 1 } as never,
				{ id: 2 } as never,
				{ id: 3 } as never,
			])

			const result = await service.count('budgets', {
				start: YEAR_START,
				end: NEXT_YEAR_START,
			})

			expect(result.count).toBe(3)
		})

		it('counts exchange rates by date range', async () => {
			vi.mocked(d.exchangeRateRepo.findByDateRange).mockResolvedValue([
				{ id: 1 } as never,
			])

			const result = await service.count('exchange-rates', {
				start: JUN_START,
				end: JUL_START,
			})

			expect(result.count).toBe(1)
		})

		it('counts snapshots by date range', async () => {
			vi.mocked(d.monthlySnapshotRepo.findByDateRange).mockResolvedValue([
				{ id: 1 } as never,
			])

			const result = await service.count('snapshots', {
				start: JUN_START,
				end: JUL_START,
			})

			expect(result.count).toBe(1)
		})

		it('counts active recurring items ignoring range', async () => {
			vi.mocked(d.recurringItemRepo.findActive).mockResolvedValue([
				{ id: 1 } as never,
				{ id: 2 } as never,
			])

			const result = await service.count('recurring-items', {
				start: JUN_START,
				end: JUL_START,
			})

			expect(result.count).toBe(2)
			expect(d.recurringItemRepo.findActive).toHaveBeenCalledOnce()
		})

		it('counts installment plans active in date range', async () => {
			vi.mocked(d.installmentPlanRepo.findActiveInDateRange).mockResolvedValue([
				{ id: 1 } as never,
			])

			const result = await service.count('installment-plans', {
				start: JUN_START,
				end: JUL_START,
			})

			expect(result.count).toBe(1)
			expect(d.installmentPlanRepo.findActiveInDateRange).toHaveBeenCalledWith(
				JUN_START,
				JUL_START,
			)
		})

		it('returns zero count for empty results', async () => {
			vi.mocked(d.transactionRepo.findByDateRange).mockResolvedValue([])

			const result = await service.count('transactions', {
				start: JUN_START,
				end: JUL_START,
			})

			expect(result.count).toBe(0)
		})

		it('counts all entity types with breakdown', async () => {
			vi.mocked(d.transactionRepo.findByDateRange).mockResolvedValue([
				{ id: 1 } as never,
				{ id: 2 } as never,
			])
			vi.mocked(d.incomeRepo.findByDateRange).mockResolvedValue([
				{ id: 1 } as never,
			])
			vi.mocked(d.budgetRepo.findByDateRange).mockResolvedValue([
				{ id: 1 } as never,
				{ id: 2 } as never,
				{ id: 3 } as never,
			])
			vi.mocked(d.exchangeRateRepo.findByDateRange).mockResolvedValue([
				{ id: 1 } as never,
			])
			vi.mocked(d.monthlySnapshotRepo.findByDateRange).mockResolvedValue([
				{ id: 1 } as never,
			])
			vi.mocked(d.recurringItemRepo.findActive).mockResolvedValue([
				{ id: 1 } as never,
			])
			vi.mocked(d.installmentPlanRepo.findActiveInDateRange).mockResolvedValue([
				{ id: 1 } as never,
			])

			const result = await service.count('all', {
				start: JUN_START,
				end: JUL_START,
			})

			expect(result.entityType).toBe('all')
			expect(result.count).toBe(10)
			expect(result.breakdown).toEqual({
				transactions: 2,
				incomes: 1,
				budgets: 3,
				'exchange-rates': 1,
				snapshots: 1,
				'recurring-items': 1,
				'installment-plans': 1,
			})
		})
	})

	describe('exportData', () => {
		it('exports transactions with metadata', async () => {
			const txs = [{ id: 1, description: 'Test' }]
			vi.mocked(d.transactionRepo.findByDateRange).mockResolvedValue(
				txs as never,
			)

			const result = await service.exportData('transactions', {
				start: JUN_START,
				end: JUL_START,
			})

			expect(result.entityType).toBe('transactions')
			expect(result.dateRange.start).toBe(JUN_START.toISOString())
			expect(result.dateRange.end).toBe(JUL_START.toISOString())
			expect(result.generatedAt).toBeDefined()
			expect(result.data).toEqual(txs)
		})

		it('exports recurring items using findActive', async () => {
			const items = [{ id: 1, description: 'Netflix' }]
			vi.mocked(d.recurringItemRepo.findActive).mockResolvedValue(
				items as never,
			)

			const result = await service.exportData('recurring-items', {
				start: JUN_START,
				end: JUL_START,
			})

			expect(result.data).toEqual(items)
		})

		it('exports installment plans using findActiveInDateRange', async () => {
			const plans = [{ id: 1, description: 'iPhone' }]
			vi.mocked(d.installmentPlanRepo.findActiveInDateRange).mockResolvedValue(
				plans as never,
			)

			const result = await service.exportData('installment-plans', {
				start: JUN_START,
				end: JUL_START,
			})

			expect(result.data).toEqual(plans)
		})

		it('exports all entity types combined', async () => {
			vi.mocked(d.transactionRepo.findByDateRange).mockResolvedValue([
				{ id: 1 } as never,
			])
			vi.mocked(d.incomeRepo.findByDateRange).mockResolvedValue([
				{ id: 2 } as never,
			])
			vi.mocked(d.budgetRepo.findByDateRange).mockResolvedValue([
				{ id: 3 } as never,
			])
			vi.mocked(d.exchangeRateRepo.findByDateRange).mockResolvedValue([
				{ id: 4 } as never,
			])
			vi.mocked(d.monthlySnapshotRepo.findByDateRange).mockResolvedValue([
				{ id: 5 } as never,
			])
			vi.mocked(d.recurringItemRepo.findActive).mockResolvedValue([
				{ id: 6 } as never,
			])
			vi.mocked(d.installmentPlanRepo.findActiveInDateRange).mockResolvedValue([
				{ id: 7 } as never,
			])

			const result = await service.exportData('all', {
				start: JUN_START,
				end: JUL_START,
			})

			expect(result.entityType).toBe('all')
			const data = result.data as Record<string, unknown[]>
			expect(data.transactions).toHaveLength(1)
			expect(data.incomes).toHaveLength(1)
			expect(data.budgets).toHaveLength(1)
			expect(data['exchange-rates']).toHaveLength(1)
			expect(data.snapshots).toHaveLength(1)
			expect(data['recurring-items']).toHaveLength(1)
			expect(data['installment-plans']).toHaveLength(1)
		})

		it('returns empty arrays for entity types with no data', async () => {
			vi.mocked(d.transactionRepo.findByDateRange).mockResolvedValue([])

			const result = await service.exportData('transactions', {
				start: JUN_START,
				end: JUL_START,
			})

			expect(result.data).toEqual([])
		})

		it('includes valid generatedAt ISO string', async () => {
			vi.mocked(d.transactionRepo.findByDateRange).mockResolvedValue([])

			const result = await service.exportData('transactions', {
				start: JUN_START,
				end: JUL_START,
			})

			expect(() => new Date(result.generatedAt).toISOString()).not.toThrow()
		})
	})
})
