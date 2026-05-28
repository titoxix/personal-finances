import { ChevronRight } from 'lucide-react'
import Link from 'next/link'
import type { Category } from '@/domain/entities/category'
import type { EssentialityLevel } from '@/domain/entities/essentiality-level'
import type { RecurringItem } from '@/domain/entities/recurring-item'

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

const PAYMENT_LABELS: Record<string, string> = {
	itau_visa: 'Itaú Visa',
	ueno_mastercard: 'Ueno MC',
	itau_debito: 'Itaú Débito',
	ueno_debito: 'Ueno Débito',
	transferencia: 'Transferencia',
	mango: 'Mango',
	gnb_mastercard: 'GNB MC',
}

type Props = {
	item: RecurringItem
	category: Category | undefined
	essentiality: EssentialityLevel | undefined
}

export function RecurringItemCard({ item, category, essentiality }: Props) {
	const amountLabel = item.isVariable
		? 'Variable'
		: item.amountGs != null
			? `₲ ${Math.round(item.amountGs).toLocaleString()}`
			: item.amountUsd != null
				? `$${item.amountUsd.toLocaleString()}`
				: '—'

	const billingLabel =
		item.frequency === 'monthly'
			? `Día ${item.billingDay}`
			: `${MONTHS_ES[(item.billingMonth ?? 1) - 1]} · Día ${item.billingDay}`

	return (
		<Link
			href={`/recurring-items/${item.id}/edit`}
			className={`flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3.5 transition-colors hover:bg-card/80 ${
				!item.active ? 'opacity-50' : ''
			}`}
		>
			{/* Active dot */}
			<div
				className={`h-2.5 w-2.5 shrink-0 rounded-full ${
					item.active ? 'bg-primary' : 'bg-muted-foreground/40'
				}`}
			/>

			{/* Content */}
			<div className="min-w-0 flex-1">
				<div className="flex items-center justify-between gap-2">
					<p className="truncate text-sm font-semibold text-foreground">
						{item.description}
					</p>
					<span className="font-mono text-sm font-bold text-primary shrink-0">
						{amountLabel}
					</span>
				</div>
				<div className="mt-1 flex items-center gap-2 flex-wrap">
					<span
						className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
							item.frequency === 'monthly'
								? 'bg-primary/10 text-primary'
								: 'bg-secondary text-muted-foreground'
						}`}
					>
						{item.frequency === 'monthly' ? 'Mensual' : 'Anual'}
					</span>
					<span className="text-xs text-muted-foreground">{billingLabel}</span>
					{category && (
						<span className="text-xs text-muted-foreground">
							{category.label}
						</span>
					)}
					{essentiality && (
						<span className="text-xs text-muted-foreground">·</span>
					)}
					{essentiality && (
						<span className="text-xs text-muted-foreground">
							{essentiality.label}
						</span>
					)}
				</div>
				<p className="mt-0.5 text-[11px] text-muted-foreground/70">
					{PAYMENT_LABELS[item.paymentMethod] ?? item.paymentMethod}
				</p>
			</div>

			<ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
		</Link>
	)
}
