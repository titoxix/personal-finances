import Link from 'next/link'
import { TransactionItem } from './TransactionItem'

export type TransactionRow = {
	id: number
	description: string
	date: Date
	createdAt: Date
	categoryLabel: string
	amountUsd: number | null
	amountGs: number | null
}

type Props = {
	transactions: TransactionRow[]
}

export function TransactionSection({ transactions }: Props) {
	return (
		<section>
			<div className="mb-1 flex items-center justify-between">
				<h2 className="text-base font-semibold text-foreground">
					Transacciones
				</h2>
				<Link
					href="/transactions"
					className="text-xs font-semibold text-primary hover:underline"
				>
					Ver todas
				</Link>
			</div>

			{transactions.length === 0 ? (
				<p className="pt-3 text-sm text-muted-foreground">
					Sin transacciones este mes.
				</p>
			) : (
				<div className="flex flex-col gap-3 pt-2">
					{transactions.map((tx) => (
						<TransactionItem
							key={tx.id}
							id={tx.id}
							description={tx.description}
							date={tx.date}
							createdAt={tx.createdAt}
							categoryLabel={tx.categoryLabel}
							amountUsd={tx.amountUsd}
							amountGs={tx.amountGs}
						/>
					))}
				</div>
			)}
		</section>
	)
}
