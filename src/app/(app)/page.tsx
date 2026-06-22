import { BudgetSection } from '@/components/home/BudgetSection'
import { MonthlyOverviewCard } from '@/components/home/MonthlyOverviewCard'
import { RecurringSection } from '@/components/home/RecurringSection'
import type { TransactionRow } from '@/components/home/TransactionSection'
import { TransactionSection } from '@/components/home/TransactionSection'
import {
	budgetService,
	categoryService,
	exchangeRateService,
	incomeService,
	installmentPlanService,
	recurringItemService,
	transactionService,
} from '@/lib/container'

function monthHref(d: Date) {
	return `/?month=${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`
}

export default async function HomePage({
	searchParams,
}: {
	searchParams: Promise<{ month?: string }>
}) {
	const { month: monthParam } = await searchParams
	const now = new Date()
	const realCurrentMonth = new Date(
		Date.UTC(now.getFullYear(), now.getMonth(), 1),
	)
	const maxMonth = new Date(
		Date.UTC(
			realCurrentMonth.getUTCFullYear(),
			realCurrentMonth.getUTCMonth() + 1,
			1,
		),
	)

	let currentMonth: Date
	if (monthParam && /^\d{4}-\d{2}$/.test(monthParam)) {
		const parts = monthParam.split('-').map(Number)
		const y = parts[0] ?? realCurrentMonth.getUTCFullYear()
		const m = parts[1] ?? realCurrentMonth.getUTCMonth() + 1
		const parsed = new Date(Date.UTC(y, m - 1, 1))
		currentMonth = parsed > maxMonth ? maxMonth : parsed
	} else {
		currentMonth = realCurrentMonth
	}

	const prevMonthDate = new Date(
		Date.UTC(currentMonth.getUTCFullYear(), currentMonth.getUTCMonth() - 1, 1),
	)
	const nextMonthDate = new Date(
		Date.UTC(currentMonth.getUTCFullYear(), currentMonth.getUTCMonth() + 1, 1),
	)
	const prevHref = monthHref(prevMonthDate)
	const nextHref =
		nextMonthDate <= maxMonth ? monthHref(nextMonthDate) : undefined

	const [
		allTransactions,
		categories,
		budgets,
		latestRate,
		income,
		activeRecurring,
		activePlans,
	] = await Promise.all([
		transactionService.findAll(),
		categoryService.findAll(),
		budgetService.findByMonth(currentMonth),
		exchangeRateService.findLatestBySource('itau'),
		incomeService.findByMonth(currentMonth),
		recurringItemService.findActive(),
		installmentPlanService.findActive(),
	])

	const categoryMap = new Map(categories.map((c) => [c.id, c]))
	// Tasa de referencia: primero el income del mes, luego la última tasa de Itaú
	const refRate =
		income?.exchangeRate ?? latestRate?.rateSell ?? latestRate?.rateMid ?? 6000
	const gsToUsd = refRate

	// Transacciones del mes actual
	const monthTransactions = allTransactions.filter((tx) => {
		const txMonth = new Date(
			Date.UTC(tx.date.getUTCFullYear(), tx.date.getUTCMonth(), 1),
		)
		return txMonth.getTime() === currentMonth.getTime()
	})

	// Gasto por categoría en USD
	const spentByCategory = new Map<number, number>()
	for (const tx of monthTransactions) {
		const usd = tx.amountUsd ?? (tx.amountGs ? tx.amountGs / gsToUsd : 0)
		spentByCategory.set(
			tx.categoryId,
			(spentByCategory.get(tx.categoryId) ?? 0) + usd,
		)
	}

	// Gasto por categoría también en Gs (para presupuestos en Gs)
	const spentGsByCategory = new Map<number, number>()
	for (const tx of monthTransactions) {
		const gs = tx.amountGs ?? (tx.amountUsd ? tx.amountUsd * gsToUsd : 0)
		spentGsByCategory.set(
			tx.categoryId,
			(spentGsByCategory.get(tx.categoryId) ?? 0) + gs,
		)
	}

	// Items para BudgetSection — montos en la moneda nativa del presupuesto
	const budgetItems = budgets.map((b) => {
		const cat = categoryMap.get(b.categoryId)
		const isGs = b.budgetedGs != null
		const budgeted = isGs ? (b.budgetedGs ?? 0) : (b.budgetedUsd ?? 0)
		const spent = isGs
			? Math.round(spentGsByCategory.get(b.categoryId) ?? 0)
			: Math.round((spentByCategory.get(b.categoryId) ?? 0) * 100) / 100
		return {
			id: b.id,
			categoryLabel: cat?.label ?? `#${b.categoryId}`,
			spent,
			budgeted,
			currency: (isGs ? 'gs' : 'usd') as 'usd' | 'gs',
		}
	})

	// Totales en Gs para el overview card
	const totalSpentGs = [...spentGsByCategory.values()].reduce(
		(sum, v) => sum + v,
		0,
	)
	// Cap en Gs: si hay income usar budgetCapUsd * tasa, si no sumar presupuestos en Gs
	const totalBudgetedFromBudgetsGs = budgets.reduce((sum, b) => {
		return sum + (b.budgetedGs ?? (b.budgetedUsd ? b.budgetedUsd * refRate : 0))
	}, 0)
	const capGs = income
		? income.budgetCapUsd * refRate
		: totalBudgetedFromBudgetsGs
	const spentPct = capGs > 0 ? Math.round((totalSpentGs / capGs) * 100) : 0

	// Compromisos recurrentes del mes: todos los activos mensuales +
	// los anuales cuyo mes de cobro es el mes actual.
	const currentMonthNum = currentMonth.getUTCMonth() + 1 // 1-12
	const monthlyRecurring = activeRecurring.filter((item) => {
		if (item.frequency === 'monthly') return true
		return item.billingMonth === currentMonthNum
	})

	// Determinar cuáles recurrentes ya fueron pagados este mes (tienen transacción vinculada)
	const paidRecurringIds = new Set(
		monthTransactions
			.map((tx) => tx.recurringItemId)
			.filter((id): id is number => id != null),
	)
	const pendingRecurringItems = monthlyRecurring
		.filter((item) => !paidRecurringIds.has(item.id))
		.sort((a, b) => (a.billingDay ?? 99) - (b.billingDay ?? 99))
	const recurringIdToTxInfo = new Map(
		monthTransactions
			.filter((tx) => tx.recurringItemId != null)
			.map((tx) => [
				tx.recurringItemId as number,
				{ txId: tx.id, paidAt: tx.createdAt, paymentMethod: tx.paymentMethod },
			]),
	)
	const paidRecurringItems = monthlyRecurring
		.filter((item) => paidRecurringIds.has(item.id))
		.sort((a, b) => {
			const aTime = recurringIdToTxInfo.get(a.id)?.paidAt.getTime() ?? 0
			const bTime = recurringIdToTxInfo.get(b.id)?.paidAt.getTime() ?? 0
			return bTime - aTime
		})

	// Solo descontar los pendientes del "libre" — los pagados ya están en totalSpentGs
	const pendingRecurringGs = pendingRecurringItems.reduce((sum, item) => {
		const amountGs =
			item.amountGs ?? (item.amountUsd ? item.amountUsd * refRate : 0)
		return sum + amountGs
	}, 0)

	// Cuotas activas con saldo pendiente: se suma el monto por cuota (Gs) al pendiente mensual.
	// Mismo criterio conservador que los recurrentes: si ya registraste el pago como
	// transacción, el libre queda ligeramente subestimado, pero nunca te dice que tenés más.
	const pendingInstallmentsGs = activePlans
		.filter((p) => {
			if (p.installmentsPaid >= p.installmentsTotal) return false
			const planStartMonth = new Date(
				Date.UTC(p.startDate.getUTCFullYear(), p.startDate.getUTCMonth(), 1),
			)
			return planStartMonth <= currentMonth
		})
		.reduce((sum, p) => {
			const amountGs =
				p.installmentAmountGs ??
				(p.totalAmountGs
					? p.totalAmountGs / p.installmentsTotal
					: p.totalAmountUsd
						? (p.totalAmountUsd * refRate) / p.installmentsTotal
						: 0)
			return sum + amountGs
		}, 0)

	const incomeGs = income
		? {
				grossGs: income.grossIncomeUsd * refRate,
				investmentGs: income.automaticInvestmentUsd * refRate,
				spentGs: totalSpentGs,
				pendingGs: pendingRecurringGs + pendingInstallmentsGs,
				freeGs:
					capGs - totalSpentGs - pendingRecurringGs - pendingInstallmentsGs,
				projectedGs:
					pendingRecurringGs +
					pendingInstallmentsGs +
					totalBudgetedFromBudgetsGs,
				libreProyectadoGs:
					capGs -
					(pendingRecurringGs +
						pendingInstallmentsGs +
						totalBudgetedFromBudgetsGs),
			}
		: undefined
	const alertCount = budgetItems.filter(
		(b) => b.budgeted > 0 && b.spent / b.budgeted >= 0.75,
	).length

	// Últimas 5 transacciones del mes seleccionado
	const recentTransactions: TransactionRow[] = [...monthTransactions]
		.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
		.slice(0, 10)
		.map((tx) => ({
			id: tx.id,
			description: tx.description,
			date: tx.date,
			createdAt: tx.createdAt,
			categoryLabel: categoryMap.get(tx.categoryId)?.label ?? 'Sin categoría',
			amountUsd: tx.amountUsd,
			amountGs: tx.amountGs,
		}))

	return (
		<div className="space-y-6">
			<MonthlyOverviewCard
				month={currentMonth}
				totalSpentGs={totalSpentGs}
				capGs={capGs}
				spentPct={spentPct}
				incomeGs={incomeGs}
				prevHref={prevHref}
				nextHref={nextHref}
			/>
			<BudgetSection items={budgetItems} alertCount={alertCount} />
			<RecurringSection
				pending={pendingRecurringItems}
				paid={paidRecurringItems}
				recurringIdToTxInfo={recurringIdToTxInfo}
				currentMonth={currentMonth}
			/>
			<TransactionSection transactions={recentTransactions} />
		</div>
	)
}
