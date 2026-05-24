import Link from 'next/link'
import { Plus } from 'lucide-react'
import { transactionService, categoryService } from '@/lib/container'
import { TransactionList, type TransactionListRow } from '@/components/transactions/TransactionList'
import { TransactionPageSidebar } from '@/components/transactions/TransactionPageSidebar'

export default async function TransactionsPage() {
	const [transactions, categories] = await Promise.all([
		transactionService.findAll(),
		categoryService.findAll(),
	])

	const categoryMap = new Map(categories.map((c) => [c.id, c.label]))

	const rows: TransactionListRow[] = transactions
		.sort((a, b) => b.date.getTime() - a.date.getTime())
		.map((tx) => ({
			id: tx.id,
			description: tx.description,
			date: tx.date,
			categoryId: tx.categoryId,
			categoryLabel: categoryMap.get(tx.categoryId) ?? 'Sin categoría',
			amountGs: tx.amountGs,
			amountUsd: tx.amountUsd,
		}))

	return (
		<div>
			<div className="mb-5 flex items-end justify-between">
				<div>
					<p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
						Dashboard
					</p>
					<h1 className="text-2xl font-bold text-foreground">Transacciones</h1>
				</div>
				<Link
					href="/transactions/new"
					className="flex shrink-0 items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90"
				>
					<Plus className="h-4 w-4" strokeWidth={2.5} />
					Nueva
				</Link>
			</div>

			<div className="lg:grid lg:grid-cols-[1fr_272px] lg:gap-6">
				<TransactionList rows={rows} />
				<TransactionPageSidebar />
			</div>
		</div>
	)
}
