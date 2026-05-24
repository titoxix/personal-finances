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

type Bests = { bestBuyId: number | null; bestSellId: number | null }

// Best buy  = highest rateBuy  → bank pays you the most Gs when you sell USD
// Best sell = lowest  rateSell → bank charges you the fewest Gs when you buy USD
// Only meaningful when ≥2 banks have that rate
function computeBests(entries: ExchangeRate[]): Bests {
	const withBuy = entries.filter((e) => e.source !== 'bcp' && e.rateBuy != null)
	const withSell = entries.filter(
		(e) => e.source !== 'bcp' && e.rateSell != null,
	)

	const bestBuyId =
		withBuy.length >= 2
			? withBuy.reduce((best, e) =>
					(e.rateBuy ?? 0) > (best.rateBuy ?? 0) ? e : best,
				).id
			: null

	const bestSellId =
		withSell.length >= 2
			? withSell.reduce((best, e) =>
					(e.rateSell ?? Infinity) < (best.rateSell ?? Infinity) ? e : best,
				).id
			: null

	return { bestBuyId, bestSellId }
}

function groupByDate(rates: ExchangeRate[]): Array<{
	key: string
	label: string
	entries: ExchangeRate[]
	bests: Bests
}> {
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
		bests: computeBests(entries),
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
			{groups.map(({ key, label, entries, bests }) => {
				const bestBuyEntry = bests.bestBuyId
					? entries.find((e) => e.id === bests.bestBuyId)
					: null
				const bestSellEntry = bests.bestSellId
					? entries.find((e) => e.id === bests.bestSellId)
					: null

				return (
					<div key={key}>
						{/* Date label */}
						<p className="mb-2 text-xs font-semibold capitalize tracking-wider text-muted-foreground">
							{label}
						</p>

						{/* Recommendation strip — visible first on all screen sizes */}
						{(bestBuyEntry || bestSellEntry) && (
							<div className="mb-2 flex flex-wrap gap-2">
								{bestBuyEntry && (
									<div className="flex items-center gap-1.5 rounded-xl bg-emerald-500/10 px-3 py-1.5">
										<span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400/70">
											Vender USD
										</span>
										<span className="font-mono text-xs font-bold text-emerald-400">
											{SOURCE_CONFIG[bestBuyEntry.source].label} ·{' '}
											{formatRate(bestBuyEntry.rateBuy)} Gs
										</span>
									</div>
								)}
								{bestSellEntry && (
									<div className="flex items-center gap-1.5 rounded-xl bg-sky-500/10 px-3 py-1.5">
										<span className="text-[10px] font-bold uppercase tracking-wider text-sky-400/70">
											Comprar USD
										</span>
										<span className="font-mono text-xs font-bold text-sky-400">
											{SOURCE_CONFIG[bestSellEntry.source].label} ·{' '}
											{formatRate(bestSellEntry.rateSell)} Gs
										</span>
									</div>
								)}
							</div>
						)}

						{/* Rate cards */}
						<div className="space-y-2">
							{entries.map((rate) => {
								const cfg = SOURCE_CONFIG[rate.source]
								const isBestBuy = rate.id === bests.bestBuyId
								const isBestSell = rate.id === bests.bestSellId
								const spread =
									rate.rateBuy != null && rate.rateSell != null
										? rate.rateSell - rate.rateBuy
										: null

								return (
									<div
										key={rate.id}
										className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3.5"
									>
										{/* Source badge + best badges (desktop inline) */}
										<div className="flex shrink-0 flex-col gap-1">
											<span
												className={`rounded-lg px-2.5 py-1 text-xs font-bold ${cfg.bgColor} ${cfg.textColor}`}
											>
												{cfg.label}
											</span>
											{/* Inline badges — visible on desktop, hidden on mobile (strip covers it) */}
											<div className="hidden gap-1 lg:flex lg:flex-col">
												{isBestBuy && (
													<span className="rounded-md bg-emerald-500/15 px-1.5 py-0.5 text-center text-[9px] font-bold uppercase tracking-wide text-emerald-400">
														↑ Vender
													</span>
												)}
												{isBestSell && (
													<span className="rounded-md bg-sky-500/15 px-1.5 py-0.5 text-center text-[9px] font-bold uppercase tracking-wide text-sky-400">
														↓ Comprar
													</span>
												)}
											</div>
										</div>

										{/* Rates */}
										<div className="flex flex-1 flex-wrap items-center gap-x-5 gap-y-1">
											{rate.rateBuy != null && (
												<RateCell
													label="Compra"
													value={formatRate(rate.rateBuy)}
													highlight={isBestBuy}
												/>
											)}
											{rate.rateSell != null && (
												<RateCell
													label="Venta"
													value={formatRate(rate.rateSell)}
													highlight={isBestSell}
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
				)
			})}
		</div>
	)
}

function RateCell({
	label,
	value,
	muted,
	highlight,
}: {
	label: string
	value: string
	muted?: boolean
	highlight?: boolean
}) {
	return (
		<div>
			<p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
				{label}
			</p>
			<p
				className={`font-mono text-sm font-semibold ${
					highlight
						? 'text-emerald-400'
						: muted
							? 'text-muted-foreground'
							: 'text-foreground'
				}`}
			>
				{value}
			</p>
		</div>
	)
}
