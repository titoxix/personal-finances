import { transactionService, categoryService } from '@/lib/container'
import { BudgetSection } from '@/components/home/BudgetSection'
import { MonthlyOverviewCard } from '@/components/home/MonthlyOverviewCard'
import { TransactionSection } from '@/components/home/TransactionSection'
import type { TransactionRow } from '@/components/home/TransactionSection'

export default async function HomePage() {
	// ─── REAL DATA ────────────────────────────────────────────────────────────
	const now = new Date()
	const currentMonth = new Date(Date.UTC(now.getFullYear(), now.getMonth(), 1))

	const [allTransactions, categories] = await Promise.all([
		transactionService.findAll(),
		categoryService.findAll(),
	])

	const categoryMap = new Map(categories.map((c) => [c.id, c.label]))

	const recentTransactions: TransactionRow[] = [...allTransactions]
		.sort((a, b) => b.date.getTime() - a.date.getTime())
		.slice(0, 5)
		.map((tx) => ({
			id: tx.id,
			description: tx.description,
			date: tx.date,
			categoryLabel: categoryMap.get(tx.categoryId) ?? 'Sin categoría',
			amountUsd: tx.amountUsd,
			amountGs: tx.amountGs,
		}))
	// ─────────────────────────────────────────────────────────────────────────

	// ─── MOCK DATA (presupuesto) — reemplazar cuando haya datos reales de budgets ───
	const totalBudgeted = 2_500
	const totalSpent = 1_625
	const spentPct = 65
	const alertCount = 2
	const budgetItems = [
		{ id: 1, categoryLabel: 'Alquiler', spent: 800, budgetedUsd: 1_200 },
		{ id: 2, categoryLabel: 'Supermercado', spent: 380, budgetedUsd: 500 },
		{ id: 3, categoryLabel: 'Transporte', spent: 510, budgetedUsd: 500 },
		{ id: 4, categoryLabel: 'Entretenimiento', spent: 0, budgetedUsd: 300 },
	]
	// ─────────────────────────────────────────────────────────────────────────

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
