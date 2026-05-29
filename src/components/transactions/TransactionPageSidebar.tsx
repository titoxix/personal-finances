export type CategorySpend = {
	label: string
	amountGs: number
}

function fmtGs(n: number): string {
	if (n >= 1_000_000) return `₲${(n / 1_000_000).toFixed(1)}M`
	if (n >= 1_000) return `₲${(n / 1_000).toFixed(0)}K`
	return `₲${n.toFixed(0)}`
}

type Props = {
	spendingByCategory: CategorySpend[]
}

export function TransactionPageSidebar({ spendingByCategory }: Props) {
	const maxGs = Math.max(...spendingByCategory.map((c) => c.amountGs), 1)

	return (
		<aside className="hidden lg:flex lg:flex-col lg:gap-4 lg:self-start">
			<div className="rounded-2xl border border-border bg-card p-5">
				<p className="mb-4 text-sm font-bold text-foreground">
					Gasto por Categoría
				</p>
				{spendingByCategory.length === 0 ? (
					<p className="text-xs text-muted-foreground">
						Sin gastos registrados este mes.
					</p>
				) : (
					<div className="space-y-3.5">
						{spendingByCategory.map(({ label, amountGs }) => (
							<div key={label}>
								<div className="mb-1.5 flex items-center justify-between">
									<span className="text-xs text-muted-foreground">{label}</span>
									<span className="text-xs font-semibold tabular-nums text-foreground">
										{fmtGs(amountGs)}
									</span>
								</div>
								<div className="h-1.5 overflow-hidden rounded-full bg-secondary">
									<div
										className="h-full rounded-full bg-primary transition-all"
										style={{ width: `${(amountGs / maxGs) * 100}%` }}
									/>
								</div>
							</div>
						))}
					</div>
				)}
			</div>
		</aside>
	)
}
