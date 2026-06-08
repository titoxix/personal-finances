function fmtGs(amount: number): string {
	return `₲ ${new Intl.NumberFormat('es-PY').format(Math.round(amount))}`
}

const FREQUENCY_LABELS: Record<'monthly' | 'annual', string> = {
	monthly: 'Mensual',
	annual: 'Anual',
}

export type TopRecurringItemRow = {
	id: number
	description: string
	amountGs: number
	frequency: 'monthly' | 'annual'
	isVariable: boolean
}

type Props = {
	items: TopRecurringItemRow[]
}

export function TopRecurringItems({ items }: Props) {
	if (items.length === 0) return null

	return (
		<div className="mb-5 rounded-2xl border border-border bg-card p-4">
			<p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
				Recurrentes más caros
			</p>
			<ul className="space-y-2.5">
				{items.map((item, index) => (
					<li key={item.id} className="flex items-center gap-3">
						<span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
							{index + 1}
						</span>
						<div className="min-w-0 flex-1">
							<p className="truncate text-sm font-medium text-foreground">
								{item.description}
							</p>
							<p className="text-xs text-muted-foreground">
								{FREQUENCY_LABELS[item.frequency]}
								{item.isVariable ? ' · Estimado' : ''}
							</p>
						</div>
						<span className="shrink-0 font-mono text-sm font-bold text-foreground">
							{fmtGs(item.amountGs)}
						</span>
					</li>
				))}
			</ul>
		</div>
	)
}
