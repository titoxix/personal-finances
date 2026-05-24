import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

const AVATAR_COLORS = [
	'bg-emerald-500/15 text-emerald-400',
	'bg-blue-500/15 text-blue-400',
	'bg-purple-500/15 text-purple-400',
	'bg-orange-500/15 text-orange-400',
	'bg-rose-500/15 text-rose-400',
]

type Props = {
	id: number
	description: string
	date: Date
	categoryLabel: string
	amountUsd: number | null
	amountGs: number | null
}

function formatAmount(amountUsd: number | null, amountGs: number | null): string {
	if (amountUsd != null) {
		return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amountUsd)
	}
	return new Intl.NumberFormat('es-PY', {
		style: 'currency',
		currency: 'PYG',
		maximumFractionDigits: 0,
	}).format(amountGs ?? 0)
}

export function TransactionItem({ id, description, date, categoryLabel, amountUsd, amountGs }: Props) {
	const avatarColor = AVATAR_COLORS[id % AVATAR_COLORS.length]!
	const initials = description.slice(0, 2).toUpperCase()
	const amount = formatAmount(amountUsd, amountGs)

	const dateStr = date.toLocaleDateString('es-PY', { month: 'short', day: 'numeric' })
	const timeStr = date.toLocaleTimeString('es-PY', { hour: '2-digit', minute: '2-digit' })

	return (
		<Link
			href={`/transactions/${id}/edit`}
			className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3.5 transition-colors hover:border-primary/30"
		>
			<div
				className={cn(
					'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xs font-bold',
					avatarColor,
				)}
			>
				{initials}
			</div>
			<div className="min-w-0 flex-1">
				<p className="truncate text-sm font-semibold text-foreground">{description}</p>
				<p className="truncate text-xs text-muted-foreground">{categoryLabel}</p>
				<p className="text-xs text-muted-foreground/70">{dateStr}, {timeStr}</p>
			</div>
			<div className="flex items-center gap-1.5">
				<span className="font-mono text-sm font-semibold text-foreground tabular-nums">{amount}</span>
				<ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
			</div>
		</Link>
	)
}
