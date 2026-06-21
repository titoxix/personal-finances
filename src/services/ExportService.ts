import type { IBudgetRepository } from '@/domain/repositories/IBudgetRepository'
import type { IExchangeRateRepository } from '@/domain/repositories/IExchangeRateRepository'
import type { IIncomeRepository } from '@/domain/repositories/IIncomeRepository'
import type { IInstallmentPlanRepository } from '@/domain/repositories/IInstallmentPlanRepository'
import type { IRecurringItemRepository } from '@/domain/repositories/IRecurringItemRepository'
import type { ISnapshotRepository } from '@/domain/repositories/ISnapshotRepository'
import type { ITransactionRepository } from '@/domain/repositories/ITransactionRepository'

export type ExportServiceDeps = {
	transactionRepo: ITransactionRepository
	incomeRepo: IIncomeRepository
	budgetRepo: IBudgetRepository
	exchangeRateRepo: IExchangeRateRepository
	recurringItemRepo: IRecurringItemRepository
	installmentPlanRepo: IInstallmentPlanRepository
	snapshotRepo: ISnapshotRepository
}

export type ExportEntityType =
	| 'transactions'
	| 'incomes'
	| 'budgets'
	| 'recurring-items'
	| 'installment-plans'
	| 'snapshots'
	| 'exchange-rates'
	| 'all'

export type DateRangeFilter = {
	start: Date
	end: Date
}

export type ExportCountResult = {
	entityType: ExportEntityType
	count: number
	breakdown?: Record<string, number>
}

export type ExportDataResult = {
	entityType: ExportEntityType
	dateRange: { start: string; end: string }
	generatedAt: string
	data: unknown
}

const SINGLE_ENTITY_TYPES = [
	'transactions',
	'incomes',
	'budgets',
	'exchange-rates',
	'snapshots',
	'recurring-items',
	'installment-plans',
] as const

type SingleEntityType = (typeof SINGLE_ENTITY_TYPES)[number]

export function createExportService(deps: ExportServiceDeps) {
	async function fetchEntity(
		entityType: SingleEntityType,
		range: DateRangeFilter,
	): Promise<unknown[]> {
		switch (entityType) {
			case 'transactions':
				return deps.transactionRepo.findByDateRange(range.start, range.end)
			case 'incomes':
				return deps.incomeRepo.findByDateRange(range.start, range.end)
			case 'budgets':
				return deps.budgetRepo.findByDateRange(range.start, range.end)
			case 'exchange-rates':
				return deps.exchangeRateRepo.findByDateRange(range.start, range.end)
			case 'snapshots':
				return deps.snapshotRepo.findByDateRange(range.start, range.end)
			case 'recurring-items':
				return deps.recurringItemRepo.findActive()
			case 'installment-plans':
				return deps.installmentPlanRepo.findActiveInDateRange(
					range.start,
					range.end,
				)
		}
	}

	async function fetchAll(
		range: DateRangeFilter,
	): Promise<Record<string, unknown[]>> {
		const results = await Promise.all(
			SINGLE_ENTITY_TYPES.map(async (type) => ({
				type,
				data: await fetchEntity(type, range),
			})),
		)
		return Object.fromEntries(results.map((r) => [r.type, r.data]))
	}

	return {
		count: async (
			entityType: ExportEntityType,
			range: DateRangeFilter,
		): Promise<ExportCountResult> => {
			if (entityType === 'all') {
				const allData = await fetchAll(range)
				const breakdown: Record<string, number> = {}
				let total = 0
				for (const [type, data] of Object.entries(allData)) {
					breakdown[type] = data.length
					total += data.length
				}
				return { entityType, count: total, breakdown }
			}

			const data = await fetchEntity(entityType, range)
			return { entityType, count: data.length }
		},

		exportData: async (
			entityType: ExportEntityType,
			range: DateRangeFilter,
		): Promise<ExportDataResult> => {
			const data =
				entityType === 'all'
					? await fetchAll(range)
					: await fetchEntity(entityType, range)

			return {
				entityType,
				dateRange: {
					start: range.start.toISOString(),
					end: range.end.toISOString(),
				},
				generatedAt: new Date().toISOString(),
				data,
			}
		},
	}
}
