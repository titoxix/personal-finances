import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { TransactionListRow } from './TransactionList'

const AVATAR_COLORS = [
	'bg-emerald-500/20 text-emerald-400',
	'bg-blue-500/20 text-blue-400',
	'bg-violet-500/20 text-violet-400',
	'bg-orange-500/20 text-orange-400',
	'bg-pink-500/20 text-pink-400',
	'bg-yellow-500/20 text-yellow-400',
	'bg-cyan-500/20 text-cyan-400',
]

function formatAmount(tx: TransactionListRow): string {
	if (tx.amountUsd != null) {
		return `-$${tx.amountUsd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
	}
	return `-₲${(tx.amountGs ?? 0).toLocaleString('en-US')}`
}

type Props = { tx: TransactionListRow }

export function TransactionListItem({ tx }: Props) {
	const avatarColor = AVATAR_COLORS[tx.categoryId % AVATAR_COLORS.length] ?? AVATAR_COLORS[0]!
	const initial = tx.categoryLabel.charAt(0).toUpperCase()
	const amount = formatAmount(tx)

	const dateStr = tx.date.toLocaleDateString('es-PY', { month: 'short', day: 'numeric' })
	const timeStr = tx.date.toLocaleTimeString('es-PY', { hour: '2-digit', minute: '2-digit' })

	return (
		<Link
			href={`/transactions/${tx.id}/edit`}
			className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3.5 transition-colors hover:border-primary/30"
		>
			<div
				className={cn(
					'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold',
					avatarColor,
				)}
			>
				{initial}
			</div>
			<div className="min-w-0 flex-1">
				<p className="truncate text-sm font-semibold text-foreground">{tx.description}</p>
				<p className="text-xs text-muted-foreground">
					{tx.categoryLabel}
					<span className="hidden lg:inline"> · {dateStr}, {timeStr}</span>
				</p>
			</div>
			<div className="flex items-center gap-1.5">
				<span className="text-sm font-bold tabular-nums text-foreground">{amount}</span>
				<ChevronRight className="h-4 w-4 text-muted-foreground" />
			</div>
		</Link>
	)
}
