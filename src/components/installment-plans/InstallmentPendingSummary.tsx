function fmtGs(amount: number): string {
	return `₲ ${new Intl.NumberFormat('es-PY').format(Math.round(amount))}`
}

type Props = {
	totalGs: number
	activeCount: number
}

export function InstallmentPendingSummary({ totalGs, activeCount }: Props) {
	return (
		<div className="mb-5 rounded-2xl border border-primary/20 bg-primary/5 p-4">
			<p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-primary">
				Pendiente de cuotas
			</p>
			<p className="font-mono text-lg font-bold text-foreground">
				{fmtGs(totalGs)}
			</p>
			<p className="mt-0.5 text-[11px] text-muted-foreground">
				Cuotas restantes entre {activeCount} plan
				{activeCount !== 1 ? 'es' : ''} activo{activeCount !== 1 ? 's' : ''}
			</p>
		</div>
	)
}
