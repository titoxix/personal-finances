import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import Link from 'next/link'
import {
	budgetService,
	categoryService,
	essentialityService,
	exchangeRateService,
	transactionService,
} from '@/lib/container'

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

const COLOR_VARIANTS = [
	{ bg: 'bg-emerald-500/15', text: 'text-emerald-400' },
	{ bg: 'bg-blue-500/15', text: 'text-blue-400' },
	{ bg: 'bg-purple-500/15', text: 'text-purple-400' },
	{ bg: 'bg-orange-500/15', text: 'text-orange-400' },
	{ bg: 'bg-rose-500/15', text: 'text-rose-400' },
	{ bg: 'bg-cyan-500/15', text: 'text-cyan-400' },
	{ bg: 'bg-yellow-500/15', text: 'text-yellow-400' },
	{ bg: 'bg-pink-500/15', text: 'text-pink-400' },
]

function parseMonthParam(param: string | undefined): Date {
	if (param) {
		const [y, m] = param.split('-').map(Number)
		if (y && m && m >= 1 && m <= 12) return new Date(Date.UTC(y, m - 1, 1))
	}
	const now = new Date()
	return new Date(Date.UTC(now.getFullYear(), now.getMonth(), 1))
}

function toMonthParam(date: Date): string {
	return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`
}

function fmtUsd(n: number): string {
	return `$${n.toFixed(0)}`
}

function fmtGs(n: number): string {
	if (n >= 1_000_000) return `₲${(n / 1_000_000).toFixed(1)}M`
	if (n >= 1_000) return `₲${(n / 1_000).toFixed(0)}K`
	return `₲${n.toFixed(0)}`
}

export default async function BudgetsPage({
	searchParams,
}: {
	searchParams: Promise<{ month?: string }>
}) {
	const { month: monthParam } = await searchParams
	const targetDate = parseMonthParam(monthParam)

	const prevMonth = new Date(
		Date.UTC(targetDate.getUTCFullYear(), targetDate.getUTCMonth() - 1, 1),
	)
	const nextMonth = new Date(
		Date.UTC(targetDate.getUTCFullYear(), targetDate.getUTCMonth() + 1, 1),
	)

	const [budgets, transactions, categories, essentialityLevels, latestRate] =
		await Promise.all([
			budgetService.findByMonth(targetDate),
			transactionService.findByMonth(targetDate),
			categoryService.findAll(),
			essentialityService.findAll(),
			exchangeRateService.findLatestBySource('itau'),
		])

	const gsToUsd = latestRate?.rateSell ?? latestRate?.rateMid ?? 6000

	const spentMap = new Map<number, { usd: number; gs: number }>()
	for (const tx of transactions) {
		const prev = spentMap.get(tx.categoryId) ?? { usd: 0, gs: 0 }
		const usdEq = tx.amountUsd ?? (tx.amountGs ? tx.amountGs / gsToUsd : 0)
		const gsEq = tx.amountGs ?? (tx.amountUsd ? tx.amountUsd * gsToUsd : 0)
		spentMap.set(tx.categoryId, { usd: prev.usd + usdEq, gs: prev.gs + gsEq })
	}

	const categoryMap = new Map(categories.map((c) => [c.id, c]))
	const essentialityMap = new Map(essentialityLevels.map((l) => [l.id, l]))

	let totalBudgetedUsd = 0
	let totalSpentUsd = 0
	for (const budget of budgets) {
		const bUsd =
			budget.budgetedUsd ??
			(budget.budgetedGs ? budget.budgetedGs / gsToUsd : 0)
		const spent = spentMap.get(budget.categoryId) ?? { usd: 0, gs: 0 }
		totalBudgetedUsd += bUsd
		totalSpentUsd += spent.usd
	}

	const monthLabel = `${MONTHS_ES[targetDate.getUTCMonth()]} ${targetDate.getUTCFullYear()}`
	const totalPct =
		totalBudgetedUsd > 0
			? Math.round((totalSpentUsd / totalBudgetedUsd) * 100)
			: 0
	const totalOver = totalSpentUsd > totalBudgetedUsd

	return (
		<div>
			{/* ── Header ── */}
			<div className="mb-5 flex items-end justify-between">
				<div>
					<p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
						Planificación
					</p>
					<h1 className="text-2xl font-bold text-foreground">Presupuestos</h1>
				</div>
				<Link
					href="/budgets/new"
					className="flex shrink-0 items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90"
				>
					<Plus className="h-4 w-4" strokeWidth={2.5} />
					Nuevo
				</Link>
			</div>

			{/* ── Navegador de mes ── */}
			<div className="mb-4 flex items-center justify-between rounded-2xl border border-border bg-card px-4 py-3">
				<Link
					href={`/budgets?month=${toMonthParam(prevMonth)}`}
					className="rounded-lg p-1 text-muted-foreground transition-colors hover:text-foreground"
				>
					<ChevronLeft className="h-5 w-5" />
				</Link>
				<span className="text-sm font-semibold text-foreground">
					{monthLabel}
				</span>
				<Link
					href={`/budgets?month=${toMonthParam(nextMonth)}`}
					className="rounded-lg p-1 text-muted-foreground transition-colors hover:text-foreground"
				>
					<ChevronRight className="h-5 w-5" />
				</Link>
			</div>

			{/* ── Resumen del mes ── */}
			{budgets.length > 0 && (
				<div className="mb-4 rounded-2xl border border-border bg-card p-4">
					<div className="flex items-end justify-between">
						<div>
							<p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
								Total gastado
							</p>
							<p className="font-mono text-2xl font-bold text-foreground">
								{fmtUsd(totalSpentUsd)}
							</p>
							<p className="font-mono text-xs text-muted-foreground">
								de {fmtUsd(totalBudgetedUsd)} presupuestados
							</p>
						</div>
						<span
							className={`font-mono text-lg font-bold ${totalOver ? 'text-destructive' : 'text-primary'}`}
						>
							{totalBudgetedUsd > 0 ? `${totalPct}%` : '—'}
						</span>
					</div>
					<div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
						<div
							className={`h-full rounded-full transition-all duration-500 ${totalOver ? 'bg-destructive' : 'bg-primary'}`}
							style={{ width: `${Math.min(totalPct, 100)}%` }}
						/>
					</div>
				</div>
			)}

			{/* ── Lista de presupuestos ── */}
			{budgets.length === 0 ? (
				<div className="flex flex-col items-center gap-3 py-16 text-center">
					<p className="text-base font-semibold text-foreground">
						Sin presupuestos
					</p>
					<p className="max-w-[240px] text-sm text-muted-foreground">
						Creá tu primer presupuesto para {monthLabel.toLowerCase()}.
					</p>
					<Link
						href="/budgets/new"
						className="mt-2 rounded-full bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground"
					>
						Crear presupuesto
					</Link>
				</div>
			) : (
				<div className="space-y-2">
					{budgets.map((budget, idx) => {
						const category = categoryMap.get(budget.categoryId)
						const essentiality = essentialityMap.get(budget.essentialityId)
						const spent = spentMap.get(budget.categoryId) ?? { usd: 0, gs: 0 }

						const isUsd = budget.budgetedUsd != null
						const budgetedAmt = isUsd
							? (budget.budgetedUsd ?? 0)
							: (budget.budgetedGs ?? 0)
						const spentAmt = isUsd ? spent.usd : spent.gs
						const pct =
							budgetedAmt > 0 ? Math.round((spentAmt / budgetedAmt) * 100) : 0
						const isOver = pct >= 100
						const isWarning = pct >= 75 && !isOver

						const colorIdx = idx % COLOR_VARIANTS.length
						const colorBg = COLOR_VARIANTS[colorIdx]?.bg ?? 'bg-emerald-500/15'
						const colorText =
							COLOR_VARIANTS[colorIdx]?.text ?? 'text-emerald-400'
						const initial = (category?.label ?? '?').charAt(0).toUpperCase()
						const fmt = isUsd ? fmtUsd : fmtGs
						const barClass = isOver
							? 'bg-destructive'
							: isWarning
								? 'bg-yellow-400'
								: 'bg-primary'
						// Heredado = recurrente creado en un mes anterior
						const isInherited =
							budget.isRecurring && budget.month.getTime() !== targetDate.getTime()

						return (
							<Link
								key={budget.id}
								href={`/budgets/${budget.id}/edit`}
								className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3.5 transition-colors hover:bg-card/80"
							>
								{/* Ícono */}
								<div
									className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold ${colorBg} ${colorText}`}
								>
									{initial}
								</div>

								{/* Contenido */}
								<div className="min-w-0 flex-1">
									<div className="flex items-center justify-between gap-2">
										<div className="flex min-w-0 items-center gap-1.5">
											<p className="truncate text-sm font-semibold text-foreground">
												{category?.label ?? '—'}
											</p>
											{budget.isRecurring && (
												<span
													title={
														isInherited
															? `Heredado de ${MONTHS_ES[budget.month.getUTCMonth()]} ${budget.month.getUTCFullYear()}`
															: 'Recurrente'
													}
													className="shrink-0 text-[10px] text-primary"
												>
													↺
												</span>
											)}
										</div>
										<span
											className={`shrink-0 font-mono text-xs font-bold ${isOver ? 'text-destructive' : isWarning ? 'text-yellow-400' : 'text-primary'}`}
										>
											{pct}%
										</span>
									</div>
									<div className="mt-0.5 flex items-center justify-between gap-2">
										<span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
											{essentiality?.label ?? '—'}
										</span>
										<span className="font-mono text-xs text-muted-foreground">
											{fmt(spentAmt)} / {fmt(budgetedAmt)}
										</span>
									</div>
									<div className="mt-2 h-1 overflow-hidden rounded-full bg-muted">
										<div
											className={`h-full rounded-full transition-all duration-500 ${barClass}`}
											style={{ width: `${Math.min(pct, 100)}%` }}
										/>
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
