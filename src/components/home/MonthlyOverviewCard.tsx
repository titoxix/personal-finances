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

function gs(amount: number) {
	return `₲ ${new Intl.NumberFormat('es-PY').format(Math.round(amount))}`
}

type Props = {
	month: Date
	totalSpentGs: number
	capGs: number
	spentPct: number
	incomeGs?: {
		grossGs: number
		investmentGs: number
		spentGs: number
		pendingGs: number
		freeGs: number
	}
}

export function MonthlyOverviewCard({
	month,
	totalSpentGs,
	capGs,
	spentPct,
	incomeGs,
}: Props) {
	const monthName = MONTHS[month.getUTCMonth()]
	const year = month.getUTCFullYear()

	const spentPct2 = capGs > 0 ? Math.min((totalSpentGs / capGs) * 100, 100) : 0
	const pendingPct =
		incomeGs && capGs > 0
			? Math.min((incomeGs.pendingGs / capGs) * 100, 100 - spentPct2)
			: 0

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
				{gs(totalSpentGs)} gastados de {gs(capGs)}
			</p>

			{/* Progress — dos segmentos: gastado + pendiente */}
			<div className="relative mt-4">
				<div className="h-1.5 overflow-hidden rounded-full bg-white/30">
					<div className="relative h-full w-full">
						{/* Gastado */}
						<div
							className="absolute left-0 top-0 h-full rounded-full bg-white transition-all duration-500"
							style={{ width: `${spentPct2}%` }}
						/>
						{/* Pendiente (recurrentes no cobrados) */}
						{pendingPct > 0 && (
							<div
								className="absolute top-0 h-full rounded-r-full bg-white/50 transition-all duration-500"
								style={{ left: `${spentPct2}%`, width: `${pendingPct}%` }}
							/>
						)}
					</div>
				</div>
				<div className="mt-1.5 flex items-center justify-center gap-3 text-[10px] text-[#003824]/60">
					<span className="font-mono">{spentPct}% gastado</span>
					{pendingPct > 0 && (
						<>
							<span>·</span>
							<span className="font-mono">
								{Math.round(pendingPct)}% comprometido
							</span>
						</>
					)}
				</div>
			</div>

			{/* Breakdown — Gastado | Pendiente | Libre */}
			{incomeGs && (
				<div className="relative mt-4 rounded-xl bg-white/10 px-3 py-2">
					<div className="flex items-center justify-between">
						<div className="text-center">
							<p className="text-[10px] font-semibold uppercase tracking-wider text-[#003824]/60">
								Gastado
							</p>
							<p className="font-mono text-sm font-bold text-[#003824]">
								{gs(incomeGs.spentGs)}
							</p>
						</div>
						<div className="h-6 w-px bg-white/20" />
						<div className="text-center">
							<p className="text-[10px] font-semibold uppercase tracking-wider text-[#003824]/60">
								Recurrentes
							</p>
							<p className="font-mono text-sm font-bold text-[#003824]">
								{gs(incomeGs.pendingGs)}
							</p>
						</div>
						<div className="h-6 w-px bg-white/20" />
						<div className="text-center">
							<p className="text-[10px] font-semibold uppercase tracking-wider text-[#003824]/60">
								Libre
							</p>
							<p className="font-mono text-sm font-bold text-[#003824]">
								{gs(incomeGs.freeGs)}
							</p>
						</div>
					</div>
					{incomeGs.pendingGs > 0 && (
						<p className="mt-2 text-center text-[10px] text-[#003824]/50">
							Libre estimado asumiendo recurrentes impagos
						</p>
					)}
				</div>
			)}
		</div>
	)
}
