import { Calendar } from 'lucide-react'

const MONTHS = [
	'Enero',
	'Febrero',
	'Marzo',
	'Abril',
	'Mayo',
	'Junio',
	'Julio',
	'Agosto',
	'Septiembre',
	'Octubre',
	'Noviembre',
	'Diciembre',
]

function usd(amount: number) {
	return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
}

type Props = {
	month: Date
	totalSpent: number
	totalBudgeted: number
	spentPct: number
}

export function MonthlyOverviewCard({ month, totalSpent, totalBudgeted, spentPct }: Props) {
	const monthName = MONTHS[month.getUTCMonth()]
	const year = month.getUTCFullYear()
	const clampedPct = Math.min(spentPct, 100)

	return (
		<div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0fba7c] to-[#065f46] p-5">
			{/* Decorative circles */}
			<div className="pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full bg-white/15" />
			<div className="pointer-events-none absolute -bottom-8 right-14 h-28 w-28 rounded-full bg-white/10" />

			{/* Header */}
			<div className="relative flex items-start justify-between">
				<p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#003824]/75">
					Resumen Mensual
				</p>
				<Calendar className="h-4 w-4 text-[#003824]/70" />
			</div>

			{/* Month */}
			<h2 className="relative mt-1 text-2xl font-bold tracking-tight text-[#003824] lg:text-3xl">
				{monthName} {year}
			</h2>

			{/* Amounts */}
			<p className="relative mt-1 font-mono text-sm text-[#003824]/80">
				{usd(totalSpent)} gastados de {usd(totalBudgeted)}
			</p>

			{/* Progress */}
			<div className="relative mt-4">
				<div className="h-1.5 overflow-hidden rounded-full bg-white/30">
					<div
						className="h-full rounded-full bg-white transition-all duration-500"
						style={{ width: `${clampedPct}%` }}
					/>
				</div>
				<p className="mt-1.5 text-center font-mono text-xs text-[#003824]/70">{spentPct}%</p>
			</div>
		</div>
	)
}
