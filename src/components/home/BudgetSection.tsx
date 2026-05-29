import Link from 'next/link'
import { BudgetCard } from './BudgetCard'

type BudgetItem = {
	id: number
	categoryLabel: string
	spent: number
	budgeted: number
	currency: 'usd' | 'gs'
}

type Props = {
	items: BudgetItem[]
	alertCount: number
}

export function BudgetSection({ items, alertCount }: Props) {
	return (
		<section>
			<div className="mb-3 flex items-end justify-between">
				<div>
					<h2 className="text-base font-semibold text-foreground">
						Presupuestos
					</h2>
					{alertCount > 0 && (
						<p className="text-xs text-muted-foreground">
							{alertCount}{' '}
							{alertCount === 1
								? 'categoría en alerta'
								: 'categorías en alerta'}
						</p>
					)}
				</div>
				<Link
					href="/budgets"
					className="text-xs font-semibold text-primary hover:underline"
				>
					Ver todo
				</Link>
			</div>

			{items.length === 0 ? (
				<p className="text-sm text-muted-foreground">
					Sin presupuestos este mes.
				</p>
			) : (
				<div className="-mx-5 flex gap-3 overflow-x-auto px-5 pb-1 scrollbar-none lg:mx-0 lg:flex-wrap lg:px-0">
					{items.map((item, idx) => (
						<BudgetCard
							key={item.id}
							label={item.categoryLabel}
							spent={item.spent}
							budgeted={item.budgeted}
							currency={item.currency}
							colorIndex={idx}
						/>
					))}
				</div>
			)}
		</section>
	)
}
