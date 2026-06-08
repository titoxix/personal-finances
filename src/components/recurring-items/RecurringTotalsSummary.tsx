function fmtGs(amount: number): string {
	return `₲ ${new Intl.NumberFormat('es-PY').format(Math.round(amount))}`
}

type Props = {
	monthlyTotalGs: number
	combinedTotalGs: number
}

export function RecurringTotalsSummary({
	monthlyTotalGs,
	combinedTotalGs,
}: Props) {
	return (
		<div className="mb-5 grid grid-cols-2 gap-3">
			<div className="rounded-2xl border border-border bg-card p-4">
				<p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
					Total mensual
				</p>
				<p className="mt-1 font-mono text-lg font-bold text-foreground">
					{fmtGs(monthlyTotalGs)}
				</p>
				<p className="mt-0.5 text-[11px] text-muted-foreground">
					Sin recurrentes anuales
				</p>
			</div>
			<div className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
				<p className="text-[10px] font-semibold uppercase tracking-widest text-primary">
					Total recurrente
				</p>
				<p className="mt-1 font-mono text-lg font-bold text-foreground">
					{fmtGs(combinedTotalGs)}
				</p>
				<p className="mt-0.5 text-[11px] text-muted-foreground">
					Mensuales + anuales
				</p>
			</div>
		</div>
	)
}
