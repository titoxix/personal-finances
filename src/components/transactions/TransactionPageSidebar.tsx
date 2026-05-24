// Desktop-only sidebar cards — MOCK DATA, replace with real aggregations when available

const OPTIMIZATION_MSG =
	'Has realizado 5 transacciones menos que el mes pasado. ¡Buen trabajo controlando tus gastos!'

// ─── MOCK DATA — delete this block and replace with real data when available ───
const SPENDING_BY_CATEGORY = [
	{ label: 'Alimentación', amount: 1240, max: 1500 },
	{ label: 'Transporte', amount: 850, max: 1500 },
	{ label: 'Suscripciones', amount: 420, max: 1500 },
]
// ─────────────────────────────────────────────────────────────────────────────

export function TransactionPageSidebar() {
	return (
		<aside className="hidden lg:flex lg:flex-col lg:gap-4 lg:self-start">
			{/* Optimización */}
			<div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0fba7c] to-[#065f46] p-5">
				<div className="pointer-events-none absolute -right-6 -top-6 h-32 w-32 rounded-full bg-white/10" />
				<div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-white/20 text-lg">
					📈
				</div>
				<p className="text-sm font-bold text-[#003824]">Optimización</p>
				<p className="mt-1 text-xs leading-relaxed text-[#003824]/80">{OPTIMIZATION_MSG}</p>
				<button
					type="button"
					className="mt-3 text-xs font-semibold text-[#003824] underline-offset-2 hover:underline"
				>
					Ver detalle →
				</button>
			</div>

			{/* Gasto por Categoría */}
			<div className="rounded-2xl border border-border bg-card p-5">
				<p className="mb-4 text-sm font-bold text-foreground">Gasto por Categoría</p>
				<div className="space-y-3.5">
					{SPENDING_BY_CATEGORY.map(({ label, amount, max }) => (
						<div key={label}>
							<div className="mb-1.5 flex items-center justify-between">
								<span className="text-xs text-muted-foreground">{label}</span>
								<span className="text-xs font-semibold tabular-nums text-foreground">
									${amount.toLocaleString('en-US')}
								</span>
							</div>
							<div className="h-1.5 overflow-hidden rounded-full bg-secondary">
								<div
									className="h-full rounded-full bg-primary transition-all"
									style={{ width: `${Math.min(100, (amount / max) * 100)}%` }}
								/>
							</div>
						</div>
					))}
				</div>
			</div>
		</aside>
	)
}
