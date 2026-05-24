import type { ExchangeRate } from '@/domain/entities/exchange-rate'

const SOURCE_CONFIG = {
	itau: {
		label: 'Itaú',
		textColor: 'text-blue-400',
		bgColor: 'bg-blue-400/10',
	},
	ueno: {
		label: 'Ueno',
		textColor: 'text-violet-400',
		bgColor: 'bg-violet-400/10',
	},
	bcp: {
		label: 'BCP',
		textColor: 'text-amber-400',
		bgColor: 'bg-amber-400/10',
	},
} as const

const MONTHS = [
	'enero',
	'febrero',
	'marzo',
	'abril',
	'mayo',
	'junio',
	'julio',
	'agosto',
	'septiembre',
	'octubre',
	'noviembre',
	'diciembre',
]

const DAYS = [
	'domingo',
	'lunes',
	'martes',
	'miércoles',
	'jueves',
	'viernes',
	'sábado',
]

function dateKey(d: Date): string {
	return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`
}

function formatDateLabel(d: Date): string {
	return `${DAYS[d.getUTCDay()]}, ${d.getUTCDate()} de ${MONTHS[d.getUTCMonth()]} de ${d.getUTCFullYear()}`
}

function formatTime(d: Date): string {
	return `${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')}`
}

function formatRate(value: number | null): string {
	if (value == null) return '—'
	return Math.round(value).toLocaleString('en-US')
}

function groupByDate(
	rates: ExchangeRate[],
): Array<{ key: string; label: string; entries: ExchangeRate[] }> {
	const map = new Map<string, ExchangeRate[]>()
	for (const rate of rates) {
		const key = dateKey(rate.recordedAt)
		const group = map.get(key) ?? []
		group.push(rate)
		map.set(key, group)
	}
	return Array.from(map.entries()).map(([key, entries]) => ({
		key,
		// biome-ignore lint/style/noNonNullAssertion: map entries always have ≥1 element
		label: formatDateLabel(entries[0]!.recordedAt),
		entries,
	}))
}

export function ExchangeRateList({ rates }: { rates: ExchangeRate[] }) {
	if (rates.length === 0) {
		return (
			<p className="py-10 text-center text-sm text-muted-foreground">
				No hay tasas registradas.
			</p>
		)
	}

	const groups = groupByDate(rates)

	return (
		<div className="space-y-6">
			{groups.map(({ key, label, entries }) => (
				<div key={key}>
					<p className="mb-2 text-xs font-semibold capitalize tracking-wider text-muted-foreground">
						{label}
					</p>
					<div className="space-y-2">
						{entries.map((rate) => {
							const cfg = SOURCE_CONFIG[rate.source]
							const spread =
								rate.rateBuy != null && rate.rateSell != null
									? rate.rateSell - rate.rateBuy
									: null

							return (
								<div
									key={rate.id}
									className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3.5"
								>
									{/* Source badge */}
									<span
										className={`shrink-0 rounded-lg px-2.5 py-1 text-xs font-bold ${cfg.bgColor} ${cfg.textColor}`}
									>
										{cfg.label}
									</span>

									{/* Rates */}
									<div className="flex flex-1 flex-wrap items-center gap-x-5 gap-y-1">
										{rate.rateBuy != null && (
											<RateCell
												label="Compra"
												value={formatRate(rate.rateBuy)}
											/>
										)}
										{rate.rateSell != null && (
											<RateCell
												label="Venta"
												value={formatRate(rate.rateSell)}
											/>
										)}
										{rate.rateMid != null && (
											<RateCell
												label="Media"
												value={formatRate(rate.rateMid)}
											/>
										)}
										{spread != null && (
											<RateCell
												label="Spread"
												value={formatRate(spread)}
												muted
											/>
										)}
									</div>

									{/* Time */}
									<span className="shrink-0 font-mono text-xs text-muted-foreground">
										{formatTime(rate.recordedAt)}
									</span>
								</div>
							)
						})}
					</div>
				</div>
			))}
		</div>
	)
}

function RateCell({
	label,
	value,
	muted,
}: {
	label: string
	value: string
	muted?: boolean
}) {
	return (
		<div>
			<p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
				{label}
			</p>
			<p
				className={`font-mono text-sm font-semibold ${muted ? 'text-muted-foreground' : 'text-foreground'}`}
			>
				{value}
			</p>
		</div>
	)
}
