import type { Category } from '@/domain/entities/category'
import type { EssentialityLevel } from '@/domain/entities/essentiality-level'
import type { InstallmentPlan } from '@/domain/entities/installment-plan'
import type { MonthlySnapshot } from '@/domain/entities/monthly-snapshot'
import type {
	SnapshotExport,
	SnapshotExportGlossary,
} from '@/domain/entities/snapshot-export'
import type { IBudgetRepository } from '@/domain/repositories/IBudgetRepository'
import type { ICategoryRepository } from '@/domain/repositories/ICategoryRepository'
import type { IEssentialityLevelRepository } from '@/domain/repositories/IEssentialityLevelRepository'
import type { IExchangeRateRepository } from '@/domain/repositories/IExchangeRateRepository'
import type { IIncomeRepository } from '@/domain/repositories/IIncomeRepository'
import type { IInstallmentPlanRepository } from '@/domain/repositories/IInstallmentPlanRepository'
import type { IMonthlySnapshotRepository } from '@/domain/repositories/IMonthlySnapshotRepository'
import type { IRecurringItemRepository } from '@/domain/repositories/IRecurringItemRepository'
import type { ITransactionRepository } from '@/domain/repositories/ITransactionRepository'

export type SnapshotExportDeps = {
	monthlySnapshotRepo: IMonthlySnapshotRepository
	transactionRepo: ITransactionRepository
	budgetRepo: IBudgetRepository
	incomeRepo: IIncomeRepository
	exchangeRateRepo: IExchangeRateRepository
	recurringItemRepo: IRecurringItemRepository
	installmentPlanRepo: IInstallmentPlanRepository
	categoryRepo: ICategoryRepository
	essentialityRepo: IEssentialityLevelRepository
}

const MONTHS_ES = [
	'Enero',
	'Febrero',
	'Marzo',
	'Abril',
	'Mayo',
	'Junio',
	'Julio',
	'Agosto',
	'Septiembre',
	'Octubre',
	'Noviembre',
	'Diciembre',
]

function formatMonthLabel(date: Date): string {
	return `${MONTHS_ES[date.getUTCMonth()]} ${date.getUTCFullYear()}`
}

function monthBounds(month: Date): { monthStart: Date; monthEnd: Date } {
	return {
		monthStart: new Date(
			Date.UTC(month.getUTCFullYear(), month.getUTCMonth(), 1),
		),
		monthEnd: new Date(
			Date.UTC(month.getUTCFullYear(), month.getUTCMonth() + 1, 1),
		),
	}
}

function buildGlossary(): SnapshotExportGlossary {
	return {
		currency:
			"Los campos con sufijo 'Gs' están en guaraníes paraguayos (PYG, sin decimales). Los campos con sufijo 'Usd' están en dólares estadounidenses (USD). Los valores de tasa de cambio (exchangeRateValue, rate*) indican cuántos guaraníes equivalen a 1 dólar.",
		paymentMethods: {
			itau_visa: 'Tarjeta de crédito Visa del banco Itaú',
			ueno_mastercard: 'Tarjeta de crédito Mastercard del banco Ueno',
			itau_debito: 'Tarjeta de débito del banco Itaú',
			ueno_debito: 'Tarjeta de débito del banco Ueno',
			transferencia: 'Transferencia bancaria directa',
			mango: 'Billetera digital Mango',
			gnb_mastercard: 'Tarjeta de crédito Mastercard del banco GNB',
		},
		essentiality:
			'essentialityLevels indica qué tan esencial es un gasto, ordenado por sortOrder (menor = más esencial). Cada transacción, presupuesto, ítem recurrente y plan de cuotas resuelve su essentialityId en essentialityCode/essentialityLabel.',
		snapshotFields:
			"'snapshot' es el cierre financiero del mes: saldos de cuentas (balance*), saldos de tarjetas de crédito (*CardGs), cuotas pendientes (pendingInstallmentsGs) e indicadores derivados (netWorthUsd, totalInvestedUsd, totalDebtUsd, savingsRatePct). 'investments' lista las inversiones activas al cierre del mes, cada una con su moneda (USD o GS) y retorno porcentual (returnPct).",
		transactions:
			"Movimientos del mes. 'weekOfMonth' (1-4) indica la semana del mes. Los campos 'installment*' indican si la transacción pertenece a un plan de cuotas (ver installmentPlanId), y 'recurringItemId' la vincula a un gasto recurrente si aplica.",
		budgets:
			"Presupuestos asignados por categoría y essentiality para el mes. 'isRecurring' indica si se repite automáticamente cada mes.",
		recurringItems:
			"Gastos/ingresos recurrentes ACTIVOS actualmente (no necesariamente todos ocurrieron este mes — depende de frequency/billingDay/billingMonth). 'frequency' es 'monthly' o 'annual'.",
		installmentPlans:
			"Planes de cuotas activos durante este mes (startDate <= fin de mes y (endDate es null o endDate >= inicio de mes)). 'installmentsPaid'/'installmentsTotal' indican el progreso total del plan, no las cuotas de este mes específico.",
		exchangeRate:
			"Si el snapshot tiene exchangeRateId, 'exchangeRate' contiene el registro vinculado (fuente, fecha, tasas de compra/venta/promedio); puede ser null.",
	}
}

function buildLabelMaps(
	categories: Category[],
	essentialities: EssentialityLevel[],
) {
	return {
		categoryMap: new Map(categories.map((c) => [c.id, c])),
		essentialityMap: new Map(essentialities.map((e) => [e.id, e])),
	}
}

function enrichWithLabels<
	T extends { categoryId: number; essentialityId: number },
>(
	item: T,
	categoryMap: Map<number, Category>,
	essentialityMap: Map<number, EssentialityLevel>,
) {
	const category = categoryMap.get(item.categoryId)
	const essentiality = essentialityMap.get(item.essentialityId)
	return {
		...item,
		categoryCode: category?.code ?? null,
		categoryLabel: category?.label ?? null,
		essentialityCode: essentiality?.code ?? null,
		essentialityLabel: essentiality?.label ?? null,
	}
}

function filterInstallmentPlansForMonth(
	plans: InstallmentPlan[],
	monthStart: Date,
	monthEnd: Date,
): InstallmentPlan[] {
	return plans.filter(
		(p) =>
			p.startDate < monthEnd && (p.endDate === null || p.endDate >= monthStart),
	)
}

export function createSnapshotExportService(deps: SnapshotExportDeps) {
	async function buildExportForSnapshot(
		snapshot: MonthlySnapshot,
	): Promise<SnapshotExport> {
		const { monthStart, monthEnd } = monthBounds(snapshot.month)

		const [
			income,
			transactions,
			budgets,
			recurringItems,
			allInstallmentPlans,
			categories,
			essentialities,
		] = await Promise.all([
			deps.incomeRepo.findByMonth(snapshot.month),
			deps.transactionRepo.findByMonth(snapshot.month),
			deps.budgetRepo.findByMonth(snapshot.month),
			deps.recurringItemRepo.findActive(),
			deps.installmentPlanRepo.findAll(),
			deps.categoryRepo.findAll(),
			deps.essentialityRepo.findAll(),
		])

		const exchangeRate =
			snapshot.exchangeRateId != null
				? await deps.exchangeRateRepo.findById(snapshot.exchangeRateId)
				: null

		const { categoryMap, essentialityMap } = buildLabelMaps(
			categories,
			essentialities,
		)
		const installmentPlans = filterInstallmentPlansForMonth(
			allInstallmentPlans,
			monthStart,
			monthEnd,
		)

		return {
			meta: {
				generatedAt: new Date().toISOString(),
				month: snapshot.month.toISOString(),
				monthLabel: formatMonthLabel(snapshot.month),
				glossary: buildGlossary(),
			},
			snapshot,
			income,
			exchangeRate,
			transactions: transactions.map((t) =>
				enrichWithLabels(t, categoryMap, essentialityMap),
			),
			budgets: budgets.map((b) =>
				enrichWithLabels(b, categoryMap, essentialityMap),
			),
			recurringItems: recurringItems.map((r) =>
				enrichWithLabels(r, categoryMap, essentialityMap),
			),
			installmentPlans: installmentPlans.map((p) =>
				enrichWithLabels(p, categoryMap, essentialityMap),
			),
			categories: categories.filter((c) => c.active),
			essentialityLevels: essentialities.filter((e) => e.active),
		}
	}

	return {
		buildExport: async (month: Date): Promise<SnapshotExport> => {
			const snapshot = await deps.monthlySnapshotRepo.findByMonth(month)
			if (!snapshot) throw new Error('MonthlySnapshot not found')
			return buildExportForSnapshot(snapshot)
		},

		buildAllExports: async (): Promise<SnapshotExport[]> => {
			const snapshots = await deps.monthlySnapshotRepo.findAll()
			const sorted = [...snapshots].sort(
				(a, b) => a.month.getTime() - b.month.getTime(),
			)
			return Promise.all(sorted.map((s) => buildExportForSnapshot(s)))
		},
	}
}
