function fmtGs(amount: number): string {
	return `₲ ${new Intl.NumberFormat('es-PY').format(Math.round(amount))}`
}

export type RecurringByCategoryRow = {
	categoryId: number
	label: string
	totalGs: number
	count: number
}

type Props = {
	items: RecurringByCategoryRow[]
}

export function RecurringByCategory({ items }: Props) {
	if (items.length === 0) return null

	return (
		<div className="mb-5 rounded-2xl border border-border bg-card p-4">
			<p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
				Recurrentes por categoría
			</p>
			<ul className="space-y-2.5">
				{items.map((item) => (
					<li key={item.categoryId} className="flex items-center gap-3">
						<div className="min-w-0 flex-1">
							<p className="truncate text-sm font-medium text-foreground">
								{item.label}
							</p>
							<p className="text-xs text-muted-foreground">
								{item.count} {item.count === 1 ? 'recurrente' : 'recurrentes'}
							</p>
						</div>
						<span className="shrink-0 font-mono text-sm font-bold text-foreground">
							{fmtGs(item.totalGs)}
						</span>
					</li>
				))}
			</ul>
		</div>
	)
}
