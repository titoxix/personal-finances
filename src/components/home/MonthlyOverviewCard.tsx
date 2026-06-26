import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { InfoPopover } from './InfoPopover'

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

function freeColor(amount: number, cap: number): string {
	if (amount < 0) return 'text-red-400'
	if (cap > 0 && amount / cap < 0.15) return 'text-orange-300'
	return 'text-[#003824]'
}

type Props = {
	month: Date
	totalSpentGs: number
	capGs: number
	spentPct: number
	prevHref: string
	nextHref?: string
	incomeGs?: {
		recurringOnlyGs: number
		installmentsOnlyGs: number
		budgetedGs: number
		projectedGs: number
		libreProyectadoGs: number
	}
}

export function MonthlyOverviewCard({
	month,
	totalSpentGs,
	capGs,
	spentPct,
	prevHref,
	nextHref,
	incomeGs,
}: Props) {
	const monthName = MONTHS[month.getUTCMonth()]
	const year = month.getUTCFullYear()

	const spentPct2 = capGs > 0 ? Math.min((totalSpentGs / capGs) * 100, 100) : 0
	const pendingPct =
		incomeGs && capGs > 0
			? Math.min((incomeGs.projectedGs / capGs) * 100, 100 - spentPct2)
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

			{/* Month with navigation */}
			<div className="relative mt-1 flex items-center gap-1">
				<Link
					href={prevHref}
					className="rounded-full p-0.5 text-[#003824]/60 transition-colors hover:bg-white/20 hover:text-[#003824]"
				>
					<ChevronLeft className="h-5 w-5" />
				</Link>
				<h2 className="flex-1 text-center text-2xl font-bold tracking-tight text-[#003824] lg:text-3xl">
					{monthName} {year}
				</h2>
				{nextHref ? (
					<Link
						href={nextHref}
						className="rounded-full p-0.5 text-[#003824]/60 transition-colors hover:bg-white/20 hover:text-[#003824]"
					>
						<ChevronRight className="h-5 w-5" />
					</Link>
				) : (
					<div className="h-6 w-6" />
				)}
			</div>

			{/* Amounts */}
			<div className="relative mt-1 inline-flex items-center gap-1 font-mono text-sm text-[#003824]/80">
				<span>
					{gs(totalSpentGs)} gastados de {gs(capGs)}
				</span>
				<InfoPopover content="Límite de gasto del mes. Se define al cargar el ingreso mensual como 'Cap de presupuesto' y se convierte a Gs usando la tasa del momento." />
			</div>

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

			{/* Proyectado del mes */}
			{incomeGs && incomeGs.projectedGs > 0 && (
				<div className="relative mt-3 rounded-xl bg-white/10 px-3 py-2">
					<div className="flex items-center justify-between">
						<span className="inline-flex items-center gap-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#003824]/60">
							Proyectado del mes
							<InfoPopover content="Recurrentes + cuotas + suma de presupuestos del mes." />
						</span>
						<span className="font-mono text-sm font-bold text-[#003824]">
							{gs(incomeGs.projectedGs)}
						</span>
					</div>
					<div className="mt-1 flex items-center justify-between">
						<span className="text-[10px] text-[#003824]/50">Recurrentes</span>
						<span className="font-mono text-[10px] text-[#003824]/70">
							{gs(incomeGs.recurringOnlyGs)}
						</span>
					</div>
					<div className="mt-1 flex items-center justify-between">
						<span className="text-[10px] text-[#003824]/50">Cuotas</span>
						<span className="font-mono text-[10px] text-[#003824]/70">
							{gs(incomeGs.installmentsOnlyGs)}
						</span>
					</div>
					<div className="mt-1 flex items-center justify-between">
						<span className="text-[10px] text-[#003824]/50">Presupuestado</span>
						<span className="font-mono text-[10px] text-[#003824]/70">
							{gs(incomeGs.budgetedGs)}
						</span>
					</div>
					<div className="mt-1 flex items-center justify-between">
						<span className="text-[10px] text-[#003824]/50">
							Libre proyectado
						</span>
						<span
							className={`font-mono text-[10px] font-semibold ${freeColor(incomeGs.libreProyectadoGs, capGs)}`}
						>
							{gs(incomeGs.libreProyectadoGs)}
						</span>
					</div>
				</div>
			)}
		</div>
	)
}
