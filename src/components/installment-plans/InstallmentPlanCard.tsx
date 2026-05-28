import { ChevronRight } from 'lucide-react'
import Link from 'next/link'
import type { Category } from '@/domain/entities/category'
import type { EssentialityLevel } from '@/domain/entities/essentiality-level'
import type { InstallmentPlan } from '@/domain/entities/installment-plan'

const PAYMENT_LABELS: Record<string, string> = {
	itau_visa: 'Itaú Visa',
	ueno_mastercard: 'Ueno MC',
	itau_debito: 'Itaú Débito',
	ueno_debito: 'Ueno Débito',
	transferencia: 'Transferencia',
	mango: 'Mango',
	gnb_mastercard: 'GNB MC',
}

const MONTHS_ES = [
	'Ene',
	'Feb',
	'Mar',
	'Abr',
	'May',
	'Jun',
	'Jul',
	'Ago',
	'Sep',
	'Oct',
	'Nov',
	'Dic',
]

function formatDate(date: Date): string {
	return `${MONTHS_ES[date.getUTCMonth()]} ${date.getUTCFullYear()}`
}

type Props = {
	plan: InstallmentPlan
	category: Category | undefined
	essentiality: EssentialityLevel | undefined
}

export function InstallmentPlanCard({ plan, category, essentiality }: Props) {
	const progress =
		plan.installmentsTotal > 0
			? (plan.installmentsPaid / plan.installmentsTotal) * 100
			: 0
	const isComplete = plan.installmentsPaid >= plan.installmentsTotal

	const amountLabel =
		plan.installmentAmountGs != null
			? `₲ ${Math.round(plan.installmentAmountGs).toLocaleString()}/cuota`
			: plan.totalAmountGs != null
				? `₲ ${Math.round(plan.totalAmountGs).toLocaleString()}`
				: plan.totalAmountUsd != null
					? `$${plan.totalAmountUsd.toLocaleString()}`
					: '—'

	return (
		<Link
			href={`/installment-plans/${plan.id}/edit`}
			className={`flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3.5 transition-colors hover:bg-card/80 ${
				!plan.active ? 'opacity-50' : ''
			}`}
		>
			{/* Status dot */}
			<div
				className={`h-2.5 w-2.5 shrink-0 rounded-full ${
					isComplete || !plan.active ? 'bg-muted-foreground/40' : 'bg-primary'
				}`}
			/>

			{/* Content */}
			<div className="min-w-0 flex-1">
				<div className="flex items-center justify-between gap-2">
					<p className="truncate text-sm font-semibold text-foreground">
						{plan.description}
					</p>
					<span className="shrink-0 font-mono text-sm font-bold text-primary">
						{amountLabel}
					</span>
				</div>

				{/* Progress */}
				<div className="mt-2 space-y-1">
					<div className="flex items-center justify-between">
						<span className="text-xs text-muted-foreground">
							{plan.installmentsPaid}/{plan.installmentsTotal} cuotas
							{isComplete && ' · Completado'}
						</span>
						{plan.endDate && (
							<span className="text-xs text-muted-foreground">
								Hasta {formatDate(plan.endDate)}
							</span>
						)}
					</div>
					<div className="h-1.5 w-full overflow-hidden rounded-full bg-border">
						<div
							className={`h-full rounded-full transition-all ${
								isComplete ? 'bg-muted-foreground/50' : 'bg-primary'
							}`}
							style={{ width: `${progress}%` }}
						/>
					</div>
				</div>

				{/* Meta */}
				<div className="mt-1.5 flex flex-wrap items-center gap-2">
					{category && (
						<span className="text-xs text-muted-foreground">
							{category.label}
						</span>
					)}
					{essentiality && (
						<>
							<span className="text-xs text-muted-foreground">·</span>
							<span className="text-xs text-muted-foreground">
								{essentiality.label}
							</span>
						</>
					)}
					<span className="text-xs text-muted-foreground">·</span>
					<span className="text-xs text-muted-foreground">
						{PAYMENT_LABELS[plan.paymentMethod] ?? plan.paymentMethod}
					</span>
				</div>
			</div>

			<ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
		</Link>
	)
}
