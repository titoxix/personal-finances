import Link from 'next/link'
import { cn } from '@/lib/utils'

const COLOR_VARIANTS = [
	{ bg: 'bg-emerald-500/15', text: 'text-emerald-400' },
	{ bg: 'bg-blue-500/15', text: 'text-blue-400' },
	{ bg: 'bg-purple-500/15', text: 'text-purple-400' },
	{ bg: 'bg-orange-500/15', text: 'text-orange-400' },
	{ bg: 'bg-rose-500/15', text: 'text-rose-400' },
	{ bg: 'bg-cyan-500/15', text: 'text-cyan-400' },
	{ bg: 'bg-yellow-500/15', text: 'text-yellow-400' },
	{ bg: 'bg-pink-500/15', text: 'text-pink-400' },
]

function fmtUsd(n: number): string {
	if (n >= 1000) return `$${(n / 1000).toFixed(1)}K`
	return `$${n.toFixed(0)}`
}

function fmtGs(n: number): string {
	if (n >= 1_000_000) return `₲${(n / 1_000_000).toFixed(1)}M`
	if (n >= 1_000) return `₲${(n / 1_000).toFixed(0)}K`
	return `₲${n.toFixed(0)}`
}

type Props = {
	categoryId: number
	label: string
	spent: number
	budgeted: number
	currency: 'usd' | 'gs'
	colorIndex: number
}

export function BudgetCard({
	categoryId,
	label,
	spent,
	budgeted,
	currency,
	colorIndex,
}: Props) {
	const fmt = currency === 'gs' ? fmtGs : fmtUsd
	const pct = budgeted > 0 ? (spent / budgeted) * 100 : 0
	const isOver = pct >= 100
	const isWarning = pct >= 75 && !isOver
	const colorIdx = colorIndex % COLOR_VARIANTS.length
	const colorBg = COLOR_VARIANTS[colorIdx]?.bg ?? 'bg-emerald-500/15'
	const colorText = COLOR_VARIANTS[colorIdx]?.text ?? 'text-emerald-400'
	const initial = label.charAt(0).toUpperCase()

	const barClass = isOver
		? 'bg-destructive'
		: isWarning
			? 'bg-yellow-400'
			: 'bg-primary'

	return (
		<Link
			href={`/transactions?categoryId=${categoryId}`}
			className="flex w-[148px] shrink-0 cursor-pointer touch-manipulation select-none flex-col gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm shadow-black/5 transition-all duration-150 ease-out active:scale-[0.96] active:border-border/80 active:bg-card/70 active:shadow-none lg:hover:-translate-y-0.5 lg:hover:border-border/80 lg:hover:shadow-md"
		>
			{/* Icon */}
			<div
				className={cn(
					'flex h-9 w-9 items-center justify-center rounded-xl text-sm font-bold',
					colorBg,
					colorText,
				)}
			>
				{initial}
			</div>

			{/* Label + amounts */}
			<div>
				<p className="text-sm font-semibold text-foreground">{label}</p>
				<p className="mt-0.5 font-mono text-xs">
					<span className="text-foreground/90">{fmt(spent)}</span>
					<span className="text-muted-foreground">/{fmt(budgeted)}</span>
				</p>
			</div>

			{/* Progress */}
			<div className="h-1 overflow-hidden rounded-full bg-muted">
				<div
					className={cn(
						'h-full rounded-full transition-all duration-500',
						barClass,
					)}
					style={{ width: `${Math.min(pct, 100)}%` }}
				/>
			</div>
		</Link>
	)
}
