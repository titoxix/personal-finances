import { ChevronRight, Plus } from 'lucide-react'
import Link from 'next/link'
import { incomeService } from '@/lib/container'

const MONTHS_ES = [
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

function fmtMonth(date: Date): string {
	return `${MONTHS_ES[date.getUTCMonth()]} ${date.getUTCFullYear()}`
}

function fmtUsd(n: number): string {
	return new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: 'USD',
		maximumFractionDigits: 0,
	}).format(n)
}

export default async function IncomesPage() {
	const incomes = await incomeService.findAll()

	const sorted = [...incomes].sort(
		(a, b) => b.month.getTime() - a.month.getTime(),
	)

	return (
		<div>
			{/* ── Header ── */}
			<div className="mb-5 flex items-end justify-between">
				<div>
					<p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
						Finanzas
					</p>
					<h1 className="text-2xl font-bold text-foreground">Ingresos</h1>
				</div>
				<Link
					href="/incomes/new"
					className="flex shrink-0 items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90"
				>
					<Plus className="h-4 w-4" strokeWidth={2.5} />
					Nuevo
				</Link>
			</div>

			{/* ── Lista ── */}
			{sorted.length === 0 ? (
				<div className="flex flex-col items-center gap-3 py-16 text-center">
					<p className="text-base font-semibold text-foreground">
						Sin ingresos registrados
					</p>
					<p className="max-w-[240px] text-sm text-muted-foreground">
						Registrá tu primer ingreso mensual para empezar a planificar.
					</p>
					<Link
						href="/incomes/new"
						className="mt-2 rounded-full bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground"
					>
						Registrar ingreso
					</Link>
				</div>
			) : (
				<div className="space-y-2">
					{sorted.map((income) => {
						const spendable = Math.min(
							income.budgetCapUsd,
							income.grossIncomeUsd - income.automaticInvestmentUsd,
						)

						return (
							<Link
								key={income.id}
								href={`/incomes/${income.id}/edit`}
								className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3.5 transition-colors hover:bg-card/80"
							>
								{/* Mes badge */}
								<div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl bg-primary/10">
									<span className="text-[10px] font-bold uppercase text-primary">
										{MONTHS_ES[income.month.getUTCMonth()]?.slice(0, 3)}
									</span>
									<span className="text-sm font-bold text-primary">
										{income.month.getUTCFullYear()}
									</span>
								</div>

								{/* Contenido */}
								<div className="min-w-0 flex-1">
									<div className="flex items-center justify-between gap-2">
										<p className="text-sm font-semibold text-foreground">
											{fmtMonth(income.month)}
										</p>
										<span className="font-mono text-sm font-bold text-primary">
											{fmtUsd(income.grossIncomeUsd)}
										</span>
									</div>
									<div className="mt-1 flex items-center justify-between gap-2">
										<span className="text-xs text-muted-foreground">
											Cap:{' '}
											<span className="font-mono text-foreground">
												{fmtUsd(spendable)}
											</span>
										</span>
										<span className="text-xs text-muted-foreground">
											Exc:{' '}
											<span className="font-mono text-foreground">
												{fmtUsd(income.automaticInvestmentUsd)}
											</span>{' '}
											→ {income.automaticDest}
										</span>
									</div>
									<div className="mt-1.5 flex items-center gap-1.5">
										<span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
											₲ {income.exchangeRate.toLocaleString()}
										</span>
										{income.notes && (
											<span className="truncate text-[10px] text-muted-foreground">
												{income.notes}
											</span>
										)}
									</div>
								</div>

								<ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
							</Link>
						)
					})}
				</div>
			)}
		</div>
	)
}
