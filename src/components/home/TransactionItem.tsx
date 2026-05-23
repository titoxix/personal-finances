import { cn } from '@/lib/utils'

const AVATAR_COLORS = [
	'bg-emerald-500/15 text-emerald-400',
	'bg-blue-500/15 text-blue-400',
	'bg-purple-500/15 text-purple-400',
	'bg-orange-500/15 text-orange-400',
	'bg-rose-500/15 text-rose-400',
]

type Props = {
	description: string
	date: Date
	amountUsd: number | null
	amountGs: number | null
	index: number
}

function formatDate(date: Date): string {
	return new Intl.DateTimeFormat('es-PY', {
		hour: '2-digit',
		minute: '2-digit',
		hour12: true,
		month: 'short',
		day: 'numeric',
		year: 'numeric',
	}).format(date)
}

function formatAmount(
	amountUsd: number | null,
	amountGs: number | null,
): { text: string; negative: boolean } {
	const amount = amountUsd ?? amountGs ?? 0
	const negative = amount < 0
	if (amountUsd != null) {
		return {
			text: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amountUsd),
			negative,
		}
	}
	return {
		text: new Intl.NumberFormat('es-PY', {
			style: 'currency',
			currency: 'PYG',
			maximumFractionDigits: 0,
		}).format(amountGs ?? 0),
		negative,
	}
}

export function TransactionItem({ description, date, amountUsd, amountGs, index }: Props) {
	const { text, negative } = formatAmount(amountUsd, amountGs)
	const avatarColor = AVATAR_COLORS[index % AVATAR_COLORS.length]
	const initials = description.slice(0, 2).toUpperCase()

	return (
		<div className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3.5">
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
				<p className="text-xs text-muted-foreground">{formatDate(date)}</p>
			</div>
			<p
				className={cn(
					'shrink-0 font-mono text-sm font-semibold',
					negative ? 'text-destructive' : 'text-foreground',
				)}
			>
				{text}
			</p>
		</div>
	)
}
