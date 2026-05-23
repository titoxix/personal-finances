// biome-ignore-start lint/correctness/noUnusedImports: restored when mock is removed
// import { budgetService, categoryService, transactionService } from '@/lib/container'
// biome-ignore-end lint/correctness/noUnusedImports
import { BudgetSection } from '@/components/home/BudgetSection'
import { MonthlyOverviewCard } from '@/components/home/MonthlyOverviewCard'
import { TransactionSection } from '@/components/home/TransactionSection'
import type { TransactionRow } from '@/components/home/TransactionSection'

export default async function HomePage() {
	// ─── MOCK DATA ────────────────────────────────────────────────────────────
	// Delete this block and uncomment the REAL DATA block below when the DB
	// has real data. The component interfaces stay the same — swap and go.

	const currentMonth = new Date(Date.UTC(2024, 5, 1)) // June 2024
	const totalBudgeted = 2_500
	const totalSpent = 1_625
	const spentPct = 65
	const alertCount = 2

	const budgetItems = [
		{ id: 1, categoryLabel: 'Alquiler', spent: 800, budgetedUsd: 1_200 },
		{ id: 2, categoryLabel: 'Supermercado', spent: 380, budgetedUsd: 500 },
		{ id: 3, categoryLabel: 'Transporte', spent: 510, budgetedUsd: 500 }, // over budget
		{ id: 4, categoryLabel: 'Entretenimiento', spent: 0, budgetedUsd: 300 },
	]

	const recentTransactions: TransactionRow[] = [
		{ id: 1, description: 'Figma Pro', date: new Date('2024-06-27'), amountUsd: 250, amountGs: null },
		{ id: 2, description: 'Github', date: new Date('2024-05-15'), amountUsd: -75.23, amountGs: null },
		{ id: 3, description: 'Paypal', date: new Date('2024-05-12'), amountUsd: 1_200, amountGs: null },
		{ id: 4, description: 'Netflix', date: new Date('2024-05-10'), amountUsd: -15.99, amountGs: null },
		{ id: 5, description: 'Supermercado Vea', date: new Date('2024-05-08'), amountUsd: null, amountGs: 250_000 },
	]
	// ─────────────────────────────────────────────────────────────────────────

	/* ─── REAL DATA — uncomment this block and delete the MOCK DATA block above
	const now = new Date()
	const currentMonth = new Date(Date.UTC(now.getFullYear(), now.getMonth(), 1))

	const [budgets, transactions, categories] = await Promise.all([
		budgetService.findByMonth(currentMonth),
		transactionService.findByMonth(currentMonth),
		categoryService.findAll(),
	])

	const totalBudgeted = budgets.reduce((sum, b) => sum + (b.budgetedUsd ?? 0), 0)
	const totalSpent = transactions.reduce((sum, t) => sum + Math.abs(t.amountUsd ?? 0), 0)
	const spentPct = totalBudgeted > 0 ? Math.round((totalSpent / totalBudgeted) * 100) : 0

	const categoryMap = new Map(categories.map((c) => [c.id, c]))
	const spentByCategory = new Map<number, number>()
	for (const tx of transactions) {
		const prev = spentByCategory.get(tx.categoryId) ?? 0
		spentByCategory.set(tx.categoryId, prev + Math.abs(tx.amountUsd ?? 0))
	}

	const budgetItems = budgets.map((b) => ({
		id: b.id,
		categoryLabel: categoryMap.get(b.categoryId)?.label ?? 'Sin categoría',
		spent: spentByCategory.get(b.categoryId) ?? 0,
		budgetedUsd: b.budgetedUsd,
	}))

	const alertCount = budgetItems.filter(
		(b) => b.budgetedUsd != null && b.spent >= b.budgetedUsd * 0.75,
	).length

	const recentTransactions = [...transactions]
		.sort((a, b) => b.date.getTime() - a.date.getTime())
		.slice(0, 5)
	─────────────────────────────────────────────────────────────────────────── */

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
