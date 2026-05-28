import { ChevronRight } from 'lucide-react'
import Link from 'next/link'
import type { MonthlySnapshot } from '@/domain/entities/monthly-snapshot'

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

function formatMonth(date: Date): string {
	return `${MONTHS_ES[date.getUTCMonth()]} ${date.getUTCFullYear()}`
}

type Props = {
	snapshot: MonthlySnapshot
}

export function MonthlySnapshotCard({ snapshot }: Props) {
	const netWorthStr =
		snapshot.netWorthUsd != null
			? new Intl.NumberFormat('en-US', {
					style: 'currency',
					currency: 'USD',
					maximumFractionDigits: 0,
				}).format(snapshot.netWorthUsd)
			: null

	const savingsStr =
		snapshot.savingsRatePct != null
			? `${snapshot.savingsRatePct.toFixed(1)}% ahorro`
			: null

	const incomeStr =
		snapshot.incomeUsd != null
			? new Intl.NumberFormat('en-US', {
					style: 'currency',
					currency: 'USD',
					maximumFractionDigits: 0,
				}).format(snapshot.incomeUsd)
			: null

	return (
		<Link
			href={`/snapshots/${snapshot.id}/edit`}
			className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3.5 transition-colors hover:bg-card/80"
		>
			<div className="min-w-0 flex-1">
				<div className="flex items-center justify-between gap-2">
					<p className="text-sm font-semibold text-foreground">
						{formatMonth(snapshot.month)}
					</p>
					{netWorthStr && (
						<span className="shrink-0 font-mono text-sm font-bold text-primary">
							{netWorthStr}
						</span>
					)}
				</div>
				<div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5">
					{incomeStr && (
						<span className="text-xs text-muted-foreground">
							Ingreso {incomeStr}
						</span>
					)}
					{incomeStr && savingsStr && (
						<span className="text-xs text-muted-foreground">·</span>
					)}
					{savingsStr && (
						<span className="text-xs text-muted-foreground">{savingsStr}</span>
					)}
					{!incomeStr && !savingsStr && (
						<span className="text-xs text-muted-foreground">
							Sin datos principales
						</span>
					)}
				</div>
			</div>
			<ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
		</Link>
	)
}
