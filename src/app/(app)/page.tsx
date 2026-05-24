import {
	transactionService,
	categoryService,
	budgetService,
	exchangeRateService,
} from '@/lib/container'
import { BudgetSection } from '@/components/home/BudgetSection'
import { MonthlyOverviewCard } from '@/components/home/MonthlyOverviewCard'
import { TransactionSection } from '@/components/home/TransactionSection'
import type { TransactionRow } from '@/components/home/TransactionSection'

export default async function HomePage() {
	const now = new Date()
	const currentMonth = new Date(Date.UTC(now.getFullYear(), now.getMonth(), 1))

	const [allTransactions, categories, budgets, latestRate] = await Promise.all([
		transactionService.findAll(),
		categoryService.findAll(),
		budgetService.findByMonth(currentMonth),
		exchangeRateService.findLatestBySource('itau'),
	])

	const categoryMap = new Map(categories.map((c) => [c.id, c]))
	const gsToUsd = latestRate?.rateSell ?? latestRate?.rateMid ?? 6000

	// Transacciones del mes actual
	const monthTransactions = allTransactions.filter((tx) => {
		const txMonth = new Date(Date.UTC(tx.date.getUTCFullYear(), tx.date.getUTCMonth(), 1))
		return txMonth.getTime() === currentMonth.getTime()
	})

	// Gasto por categoría en USD
	const spentByCategory = new Map<number, number>()
	for (const tx of monthTransactions) {
		const usd = tx.amountUsd ?? (tx.amountGs ? tx.amountGs / gsToUsd : 0)
		spentByCategory.set(tx.categoryId, (spentByCategory.get(tx.categoryId) ?? 0) + usd)
	}

	// Items para BudgetSection
	const budgetItems = budgets.map((b) => {
		const cat = categoryMap.get(b.categoryId)
		const budgetedUsd = b.budgetedUsd ?? (b.budgetedGs ? b.budgetedGs / gsToUsd : 0)
		const spent = spentByCategory.get(b.categoryId) ?? 0
		return {
			id: b.id,
			categoryLabel: cat?.label ?? `#${b.categoryId}`,
			spent: Math.round(spent * 100) / 100,
			budgetedUsd: Math.round(budgetedUsd * 100) / 100,
		}
	})

	const totalBudgeted = budgetItems.reduce((sum, b) => sum + (b.budgetedUsd ?? 0), 0)
	const totalSpent = budgetItems.reduce((sum, b) => sum + b.spent, 0)
	const spentPct = totalBudgeted > 0 ? Math.round((totalSpent / totalBudgeted) * 100) : 0
	const alertCount = budgetItems.filter(
		(b) => b.budgetedUsd && b.budgetedUsd > 0 && b.spent / b.budgetedUsd >= 0.75,
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
				totalSpent={totalSpent}
				totalBudgeted={totalBudgeted}
				spentPct={spentPct}
			/>
			<BudgetSection items={budgetItems} alertCount={alertCount} />
			<TransactionSection transactions={recentTransactions} />
		</div>
	)
}
