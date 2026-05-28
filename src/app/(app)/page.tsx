import { BudgetSection } from '@/components/home/BudgetSection'
import { MonthlyOverviewCard } from '@/components/home/MonthlyOverviewCard'
import type { TransactionRow } from '@/components/home/TransactionSection'
import { TransactionSection } from '@/components/home/TransactionSection'
import {
	budgetService,
	categoryService,
	exchangeRateService,
	incomeService,
	recurringItemService,
	transactionService,
} from '@/lib/container'

export default async function HomePage() {
	const now = new Date()
	const currentMonth = new Date(Date.UTC(now.getFullYear(), now.getMonth(), 1))

	const [
		allTransactions,
		categories,
		budgets,
		latestRate,
		income,
		activeRecurring,
	] = await Promise.all([
		transactionService.findAll(),
		categoryService.findAll(),
		budgetService.findByMonth(currentMonth),
		exchangeRateService.findLatestBySource('itau'),
		incomeService.findByMonth(currentMonth),
		recurringItemService.findActive(),
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

	// Recurrentes pendientes: activos cuyo día de cobro aún no pasó este mes
	const todayDay = now.getUTCDate()
	const currentMonthNum = now.getUTCMonth() + 1 // 1-12
	const pendingRecurring = activeRecurring.filter((item) => {
		if (item.frequency === 'monthly') return (item.billingDay ?? 0) > todayDay
		// annual: solo si el mes de cobro es el mes actual y el día no pasó
		return (
			item.billingMonth === currentMonthNum && (item.billingDay ?? 0) > todayDay
		)
	})
	const pendingRecurringGs = pendingRecurring.reduce((sum, item) => {
		const amountGs =
			item.amountGs ?? (item.amountUsd ? item.amountUsd * refRate : 0)
		return sum + amountGs
	}, 0)

	const incomeGs = income
		? {
				grossGs: income.grossIncomeUsd * refRate,
				investmentGs: income.automaticInvestmentUsd * refRate,
				spentGs: totalSpentGs,
				pendingGs: pendingRecurringGs,
				freeGs: Math.max(capGs - totalSpentGs - pendingRecurringGs, 0),
			}
		: undefined
	const alertCount = budgetItems.filter(
		(b) => b.budgeted > 0 && b.spent / b.budgeted >= 0.75,
	).length

	// Últimas 5 transacciones (todos los tiempos)
	const recentTransactions: TransactionRow[] = [...allTransactions]
		.sort((a, b) => b.date.getTime() - a.date.getTime())
		.slice(0, 5)
		.map((tx) => ({
			id: tx.id,
			description: tx.description,
			date: tx.date,
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
			/>
			<BudgetSection items={budgetItems} alertCount={alertCount} />
			<TransactionSection transactions={recentTransactions} />
		</div>
	)
}
