import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Budget } from '@/domain/entities/budget'
import type { Category } from '@/domain/entities/category'
import type { EssentialityLevel } from '@/domain/entities/essentiality-level'
import type { ExchangeRate } from '@/domain/entities/exchange-rate'
import type { Income } from '@/domain/entities/income'
import type { InstallmentPlan } from '@/domain/entities/installment-plan'
import type { MonthlySnapshot } from '@/domain/entities/monthly-snapshot'
import type { RecurringItem } from '@/domain/entities/recurring-item'
import type { Transaction } from '@/domain/entities/transaction'
import type { IBudgetRepository } from '@/domain/repositories/IBudgetRepository'
import type { ICategoryRepository } from '@/domain/repositories/ICategoryRepository'
import type { IEssentialityLevelRepository } from '@/domain/repositories/IEssentialityLevelRepository'
import type { IExchangeRateRepository } from '@/domain/repositories/IExchangeRateRepository'
import type { IIncomeRepository } from '@/domain/repositories/IIncomeRepository'
import type { IInstallmentPlanRepository } from '@/domain/repositories/IInstallmentPlanRepository'
import type { IMonthlySnapshotRepository } from '@/domain/repositories/IMonthlySnapshotRepository'
import type { IRecurringItemRepository } from '@/domain/repositories/IRecurringItemRepository'
import type { ITransactionRepository } from '@/domain/repositories/ITransactionRepository'
import {
	createSnapshotExportService,
	type SnapshotExportDeps,
} from './SnapshotExportService'

const makeMonthlySnapshotRepo = (): IMonthlySnapshotRepository => ({
	findAll: vi.fn(),
	findById: vi.fn(),
	findByMonth: vi.fn(),
	findLatest: vi.fn(),
	create: vi.fn(),
	update: vi.fn(),
})

const makeTransactionRepo = (): ITransactionRepository => ({
	findAll: vi.fn(),
	findById: vi.fn(),
	findByMonth: vi.fn(),
	findByMonthAndCategory: vi.fn(),
	create: vi.fn(),
	update: vi.fn(),
	delete: vi.fn(),
})

const makeBudgetRepo = (): IBudgetRepository => ({
	findAll: vi.fn(),
	findById: vi.fn(),
	findByMonth: vi.fn(),
	findByMonthAndCategory: vi.fn(),
	findRecurring: vi.fn(),
	create: vi.fn(),
	update: vi.fn(),
	softDelete: vi.fn(),
})

const makeIncomeRepo = (): IIncomeRepository => ({
	findAll: vi.fn(),
	findById: vi.fn(),
	findByMonth: vi.fn(),
	create: vi.fn(),
	update: vi.fn(),
})

const makeExchangeRateRepo = (): IExchangeRateRepository => ({
	findAll: vi.fn(),
	findById: vi.fn(),
	findBySource: vi.fn(),
	findLatestBySource: vi.fn(),
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
	create: vi.fn(),
	update: vi.fn(),
	deactivate: vi.fn(),
})

const makeCategoryRepo = (): ICategoryRepository => ({
	findAll: vi.fn(),
	findById: vi.fn(),
	findByCode: vi.fn(),
	create: vi.fn(),
	update: vi.fn(),
	deactivate: vi.fn(),
})

const makeEssentialityRepo = (): IEssentialityLevelRepository => ({
	findAll: vi.fn(),
	findById: vi.fn(),
	findByCode: vi.fn(),
	create: vi.fn(),
	update: vi.fn(),
	deactivate: vi.fn(),
})

function makeSnapshot(
	overrides: Partial<MonthlySnapshot> = {},
): MonthlySnapshot {
	return {
		id: 1,
		month: new Date('2026-06-01'),
		incomeUsd: 3000,
		exchangeRateValue: 7800,
		exchangeRateId: 1,
		balanceItauUsd: 5000,
		balanceItauGs: null,
		balanceUenoUsd: null,
		balanceUenoGs: null,
		balanceMangoGs: null,
		balanceGnbGs: null,
		gnbCardGs: null,
		itauCardGs: null,
		uenoCardGs: null,
		pendingInstallmentsGs: null,
		netWorthUsd: 5000,
		totalInvestedUsd: 1000,
		totalDebtUsd: 0,
		savingsRatePct: 10,
		notes: null,
		createdAt: new Date('2026-06-30'),
		investments: [],
		...overrides,
	}
}

function makeTransaction(overrides: Partial<Transaction> = {}): Transaction {
	return {
		id: 1,
		date: new Date('2026-06-10'),
		description: 'Supermercado',
		amountGs: 150000,
		amountUsd: null,
		exchangeRateValue: null,
		exchangeRateId: null,
		categoryId: 1,
		essentialityId: 1,
		paymentMethod: 'itau_debito',
		weekOfMonth: 2,
		isInstallment: false,
		installmentCurrent: null,
		installmentTotal: null,
		installmentPlanId: null,
		isRecurring: false,
		recurringItemId: null,
		notes: null,
		createdAt: new Date('2026-06-10'),
		...overrides,
	}
}

function makeBudget(overrides: Partial<Budget> = {}): Budget {
	return {
		id: 1,
		month: new Date('2026-06-01'),
		categoryId: 1,
		essentialityId: 1,
		budgetedUsd: 200,
		budgetedGs: null,
		isRecurring: true,
		notes: null,
		deletedAt: null,
		deleteReason: null,
		createdAt: new Date('2026-06-01'),
		...overrides,
	}
}

function makeRecurringItem(
	overrides: Partial<RecurringItem> = {},
): RecurringItem {
	return {
		id: 1,
		description: 'Netflix',
		amountGs: null,
		amountUsd: 15,
		categoryId: 1,
		essentialityId: 1,
		paymentMethod: 'itau_visa',
		frequency: 'monthly',
		billingDay: 5,
		billingMonth: null,
		isVariable: false,
		active: true,
		notes: null,
		createdAt: new Date('2026-01-01'),
		...overrides,
	}
}

function makeInstallmentPlan(
	overrides: Partial<InstallmentPlan> = {},
): InstallmentPlan {
	return {
		id: 1,
		description: 'iPhone 16',
		totalAmountGs: null,
		totalAmountUsd: 1200,
		installmentsTotal: 12,
		installmentsPaid: 3,
		installmentAmountGs: 750000,
		startDate: new Date('2026-01-01'),
		endDate: new Date('2027-01-01'),
		paymentMethod: 'itau_visa',
		categoryId: 1,
		essentialityId: 1,
		active: true,
		notes: null,
		createdAt: new Date('2026-01-01'),
		...overrides,
	}
}

function makeIncome(overrides: Partial<Income> = {}): Income {
	return {
		id: 1,
		month: new Date('2026-06-01'),
		grossIncomeUsd: 3000,
		budgetCapUsd: 2500,
		automaticInvestmentUsd: 500,
		automaticDest: 'Broker XYZ',
		exchangeRate: 7800,
		notes: null,
		createdAt: new Date('2026-06-01'),
		...overrides,
	}
}

function makeExchangeRate(overrides: Partial<ExchangeRate> = {}): ExchangeRate {
	return {
		id: 1,
		recordedAt: new Date('2026-06-01'),
		source: 'itau',
		rateBuy: 7700,
		rateSell: 7900,
		rateMid: 7800,
		notes: null,
		createdAt: new Date('2026-06-01'),
		...overrides,
	}
}

function makeCategory(overrides: Partial<Category> = {}): Category {
	return {
		id: 1,
		code: 'food',
		label: 'Comida',
		description: null,
		active: true,
		createdAt: new Date('2026-01-01'),
		...overrides,
	}
}

function makeEssentialityLevel(
	overrides: Partial<EssentialityLevel> = {},
): EssentialityLevel {
	return {
		id: 1,
		code: 'essential',
		label: 'Esencial',
		description: null,
		sortOrder: 1,
		active: true,
		createdAt: new Date('2026-01-01'),
		...overrides,
	}
}

function makeDeps(): {
	deps: SnapshotExportDeps
	monthlySnapshotRepo: IMonthlySnapshotRepository
	transactionRepo: ITransactionRepository
	budgetRepo: IBudgetRepository
	incomeRepo: IIncomeRepository
	exchangeRateRepo: IExchangeRateRepository
	recurringItemRepo: IRecurringItemRepository
	installmentPlanRepo: IInstallmentPlanRepository
	categoryRepo: ICategoryRepository
	essentialityRepo: IEssentialityLevelRepository
} {
	const monthlySnapshotRepo = makeMonthlySnapshotRepo()
	const transactionRepo = makeTransactionRepo()
	const budgetRepo = makeBudgetRepo()
	const incomeRepo = makeIncomeRepo()
	const exchangeRateRepo = makeExchangeRateRepo()
	const recurringItemRepo = makeRecurringItemRepo()
	const installmentPlanRepo = makeInstallmentPlanRepo()
	const categoryRepo = makeCategoryRepo()
	const essentialityRepo = makeEssentialityRepo()

	return {
		deps: {
			monthlySnapshotRepo,
			transactionRepo,
			budgetRepo,
			incomeRepo,
			exchangeRateRepo,
			recurringItemRepo,
			installmentPlanRepo,
			categoryRepo,
			essentialityRepo,
		},
		monthlySnapshotRepo,
		transactionRepo,
		budgetRepo,
		incomeRepo,
		exchangeRateRepo,
		recurringItemRepo,
		installmentPlanRepo,
		categoryRepo,
		essentialityRepo,
	}
}

/** Configures the default "happy path" return values for all sub-repos. */
function stubDefaults(d: ReturnType<typeof makeDeps>) {
	vi.mocked(d.incomeRepo.findByMonth).mockResolvedValue(makeIncome())
	vi.mocked(d.transactionRepo.findByMonth).mockResolvedValue([
		makeTransaction(),
	])
	vi.mocked(d.budgetRepo.findByMonth).mockResolvedValue([makeBudget()])
	vi.mocked(d.recurringItemRepo.findActive).mockResolvedValue([
		makeRecurringItem(),
	])
	vi.mocked(d.installmentPlanRepo.findAll).mockResolvedValue([
		makeInstallmentPlan(),
	])
	vi.mocked(d.categoryRepo.findAll).mockResolvedValue([makeCategory()])
	vi.mocked(d.essentialityRepo.findAll).mockResolvedValue([
		makeEssentialityLevel(),
	])
	vi.mocked(d.exchangeRateRepo.findById).mockResolvedValue(makeExchangeRate())
}

describe('createSnapshotExportService', () => {
	let d: ReturnType<typeof makeDeps>
	let service: ReturnType<typeof createSnapshotExportService>

	beforeEach(() => {
		d = makeDeps()
		service = createSnapshotExportService(d.deps)
	})

	describe('buildExport', () => {
		it('throws when no snapshot exists for the month', async () => {
			vi.mocked(d.monthlySnapshotRepo.findByMonth).mockResolvedValue(null)

			await expect(service.buildExport(new Date('2026-06-01'))).rejects.toThrow(
				'MonthlySnapshot not found',
			)
		})

		it('returns a fully-populated export object', async () => {
			vi.mocked(d.monthlySnapshotRepo.findByMonth).mockResolvedValue(
				makeSnapshot(),
			)
			stubDefaults(d)

			const result = await service.buildExport(new Date('2026-06-01'))

			expect(result.snapshot.id).toBe(1)
			expect(result.income?.id).toBe(1)
			expect(result.exchangeRate?.id).toBe(1)
			expect(result.transactions).toHaveLength(1)
			expect(result.budgets).toHaveLength(1)
			expect(result.recurringItems).toHaveLength(1)
			expect(result.installmentPlans).toHaveLength(1)
			expect(result.categories).toHaveLength(1)
			expect(result.essentialityLevels).toHaveLength(1)
		})

		it('resolves category and essentiality labels on enriched records', async () => {
			vi.mocked(d.monthlySnapshotRepo.findByMonth).mockResolvedValue(
				makeSnapshot(),
			)
			stubDefaults(d)
			vi.mocked(d.categoryRepo.findAll).mockResolvedValue([
				makeCategory({ id: 1, code: 'food', label: 'Comida' }),
			])
			vi.mocked(d.essentialityRepo.findAll).mockResolvedValue([
				makeEssentialityLevel({ id: 1, code: 'essential', label: 'Esencial' }),
			])

			const result = await service.buildExport(new Date('2026-06-01'))

			expect(result.transactions[0]).toMatchObject({
				categoryCode: 'food',
				categoryLabel: 'Comida',
				essentialityCode: 'essential',
				essentialityLabel: 'Esencial',
			})
			expect(result.budgets[0]).toMatchObject({
				categoryCode: 'food',
				categoryLabel: 'Comida',
			})
			expect(result.recurringItems[0]).toMatchObject({
				categoryCode: 'food',
				categoryLabel: 'Comida',
			})
			expect(result.installmentPlans[0]).toMatchObject({
				categoryCode: 'food',
				categoryLabel: 'Comida',
			})
		})

		it('falls back to null labels when category/essentiality ids are not found', async () => {
			vi.mocked(d.monthlySnapshotRepo.findByMonth).mockResolvedValue(
				makeSnapshot(),
			)
			stubDefaults(d)
			vi.mocked(d.transactionRepo.findByMonth).mockResolvedValue([
				makeTransaction({ categoryId: 999, essentialityId: 999 }),
			])

			const result = await service.buildExport(new Date('2026-06-01'))

			expect(result.transactions[0]).toMatchObject({
				categoryCode: null,
				categoryLabel: null,
				essentialityCode: null,
				essentialityLabel: null,
			})
		})

		it('resolves labels for inactive categories/essentiality levels but excludes them from reference lists', async () => {
			vi.mocked(d.monthlySnapshotRepo.findByMonth).mockResolvedValue(
				makeSnapshot(),
			)
			stubDefaults(d)
			vi.mocked(d.categoryRepo.findAll).mockResolvedValue([
				makeCategory({ id: 1, code: 'food', label: 'Comida', active: true }),
				makeCategory({ id: 2, code: 'old', label: 'Antiguo', active: false }),
			])
			vi.mocked(d.essentialityRepo.findAll).mockResolvedValue([
				makeEssentialityLevel({
					id: 1,
					code: 'essential',
					label: 'Esencial',
					active: true,
				}),
				makeEssentialityLevel({
					id: 2,
					code: 'old_ess',
					label: 'Vieja',
					sortOrder: 2,
					active: false,
				}),
			])
			vi.mocked(d.transactionRepo.findByMonth).mockResolvedValue([
				makeTransaction({ categoryId: 2, essentialityId: 2 }),
			])

			const result = await service.buildExport(new Date('2026-06-01'))

			expect(result.transactions[0]).toMatchObject({
				categoryCode: 'old',
				categoryLabel: 'Antiguo',
				essentialityCode: 'old_ess',
				essentialityLabel: 'Vieja',
			})
			expect(result.categories.map((c) => c.id)).toEqual([1])
			expect(result.essentialityLevels.map((e) => e.id)).toEqual([1])
		})

		it('returns exchangeRate: null and skips the lookup when exchangeRateId is null', async () => {
			vi.mocked(d.monthlySnapshotRepo.findByMonth).mockResolvedValue(
				makeSnapshot({ exchangeRateId: null }),
			)
			stubDefaults(d)

			const result = await service.buildExport(new Date('2026-06-01'))

			expect(result.exchangeRate).toBeNull()
			expect(d.exchangeRateRepo.findById).not.toHaveBeenCalled()
		})

		it('looks up the linked exchange rate when exchangeRateId is set', async () => {
			vi.mocked(d.monthlySnapshotRepo.findByMonth).mockResolvedValue(
				makeSnapshot({ exchangeRateId: 42 }),
			)
			stubDefaults(d)
			vi.mocked(d.exchangeRateRepo.findById).mockResolvedValue(
				makeExchangeRate({ id: 42 }),
			)

			const result = await service.buildExport(new Date('2026-06-01'))

			expect(d.exchangeRateRepo.findById).toHaveBeenCalledWith(42)
			expect(result.exchangeRate?.id).toBe(42)
		})

		it('returns income: null when no income record exists for the month', async () => {
			vi.mocked(d.monthlySnapshotRepo.findByMonth).mockResolvedValue(
				makeSnapshot(),
			)
			stubDefaults(d)
			vi.mocked(d.incomeRepo.findByMonth).mockResolvedValue(null)

			const result = await service.buildExport(new Date('2026-06-01'))

			expect(result.income).toBeNull()
		})

		describe('installment plan month-overlap filtering (June 2026)', () => {
			const cases: Array<{
				name: string
				plan: Partial<InstallmentPlan>
				included: boolean
			}> = [
				{
					name: 'plan spans the whole month',
					plan: {
						startDate: new Date('2026-05-01'),
						endDate: new Date('2026-08-01'),
					},
					included: true,
				},
				{
					name: 'plan with no end date (ongoing)',
					plan: { startDate: new Date('2026-01-01'), endDate: null },
					included: true,
				},
				{
					name: 'plan ends exactly at month start (boundary, included)',
					plan: {
						startDate: new Date('2026-01-01'),
						endDate: new Date('2026-06-01'),
					},
					included: true,
				},
				{
					name: 'plan starts exactly at month end (boundary, excluded)',
					plan: { startDate: new Date('2026-07-01'), endDate: null },
					included: false,
				},
				{
					name: 'plan ended before the month started',
					plan: {
						startDate: new Date('2026-01-01'),
						endDate: new Date('2026-05-31'),
					},
					included: false,
				},
				{
					name: 'plan starts after the month ended',
					plan: { startDate: new Date('2026-07-02'), endDate: null },
					included: false,
				},
			]

			for (const { name, plan, included } of cases) {
				it(`${included ? 'includes' : 'excludes'} ${name}`, async () => {
					vi.mocked(d.monthlySnapshotRepo.findByMonth).mockResolvedValue(
						makeSnapshot({ month: new Date('2026-06-01') }),
					)
					stubDefaults(d)
					vi.mocked(d.installmentPlanRepo.findAll).mockResolvedValue([
						makeInstallmentPlan(plan),
					])

					const result = await service.buildExport(new Date('2026-06-01'))

					expect(result.installmentPlans).toHaveLength(included ? 1 : 0)
				})
			}
		})

		describe('meta', () => {
			it('includes generatedAt/month as ISO strings, a Spanish monthLabel, and a glossary', async () => {
				vi.mocked(d.monthlySnapshotRepo.findByMonth).mockResolvedValue(
					makeSnapshot({ month: new Date('2026-06-01') }),
				)
				stubDefaults(d)

				const result = await service.buildExport(new Date('2026-06-01'))

				expect(result.meta.month).toBe(new Date('2026-06-01').toISOString())
				expect(() =>
					new Date(result.meta.generatedAt).toISOString(),
				).not.toThrow()
				expect(result.meta.monthLabel).toBe('Junio 2026')
				expect(Object.keys(result.meta.glossary.paymentMethods)).toHaveLength(7)
				expect(result.meta.glossary).toMatchObject({
					currency: expect.any(String),
					essentiality: expect.any(String),
					snapshotFields: expect.any(String),
					transactions: expect.any(String),
					budgets: expect.any(String),
					recurringItems: expect.any(String),
					installmentPlans: expect.any(String),
					exchangeRate: expect.any(String),
				})
			})
		})
	})

	describe('buildAllExports', () => {
		it('returns an empty array when there are no snapshots', async () => {
			vi.mocked(d.monthlySnapshotRepo.findAll).mockResolvedValue([])

			const result = await service.buildAllExports()

			expect(result).toEqual([])
			expect(d.transactionRepo.findByMonth).not.toHaveBeenCalled()
		})

		it('returns one export per snapshot, sorted by month ascending', async () => {
			vi.mocked(d.monthlySnapshotRepo.findAll).mockResolvedValue([
				makeSnapshot({ id: 2, month: new Date('2026-06-01') }),
				makeSnapshot({ id: 1, month: new Date('2026-05-01') }),
			])
			stubDefaults(d)

			const result = await service.buildAllExports()

			expect(result).toHaveLength(2)
			expect(result[0]?.snapshot.id).toBe(1)
			expect(result[0]?.meta.monthLabel).toBe('Mayo 2026')
			expect(result[1]?.snapshot.id).toBe(2)
			expect(result[1]?.meta.monthLabel).toBe('Junio 2026')
		})
	})
})
