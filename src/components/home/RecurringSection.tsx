import { AlertTriangle, CheckCircle2, Clock } from 'lucide-react'
import Link from 'next/link'
import type { PaymentMethod } from '@/domain/entities/recurring-item'

function fmtGs(amount: number): string {
	return `₲ ${new Intl.NumberFormat('es-PY').format(Math.round(amount))}`
}

function fmtPaidAt(date: Date): string {
	const d = new Date(date)
	const day = d.getDate()
	const month = d.toLocaleString('es-PY', { month: 'short' })
	const hh = String(d.getHours()).padStart(2, '0')
	const mm = String(d.getMinutes()).padStart(2, '0')
	return `${day} ${month} ${hh}:${mm}`
}

const PAYMENT_LABELS: Record<PaymentMethod, string> = {
	itau_visa: 'Itaú Visa',
	ueno_mastercard: 'Ueno MC',
	transferencia: 'Transferencia',
	itau_debito: 'Itaú Débito',
	ueno_debito: 'Ueno Débito',
	mango: 'Mango',
	gnb_mastercard: 'GNB MC',
}

type TxInfo = { txId: number; paidAt: Date; paymentMethod: PaymentMethod }

type RecurringRow = {
	id: number
	description: string
	billingDay: number | null
	amountGs: number | null
	amountUsd: number | null
	isVariable: boolean
}

type Props = {
	pending: RecurringRow[]
	paid: RecurringRow[]
	recurringIdToTxInfo: Map<number, TxInfo>
	currentMonth: Date
}

function formatAmount(item: RecurringRow): string {
	if (item.isVariable) return 'Variable'
	if (item.amountGs != null) return fmtGs(item.amountGs)
	if (item.amountUsd != null) return `$${item.amountUsd.toFixed(2)}`
	return '—'
}

export function RecurringSection({
	pending,
	paid,
	recurringIdToTxInfo,
	currentMonth,
}: Props) {
	if (pending.length === 0 && paid.length === 0) return null

	const now = new Date()
	const viewingYear = currentMonth.getUTCFullYear()
	const viewingMonth = currentMonth.getUTCMonth()
	const isFutureMonth =
		viewingYear > now.getUTCFullYear() ||
		(viewingYear === now.getUTCFullYear() && viewingMonth > now.getUTCMonth())
	const isPastMonth =
		viewingYear < now.getUTCFullYear() ||
		(viewingYear === now.getUTCFullYear() && viewingMonth < now.getUTCMonth())
	const todayDay = now.getUTCDate()

	return (
		<div className="space-y-3">
			<h2 className="text-base font-bold text-foreground">Recurrentes</h2>

			{pending.length > 0 && (
				<div className="rounded-2xl border border-border bg-card overflow-hidden">
					<div className="flex items-center gap-2 px-4 py-2.5 border-b border-border bg-muted/30">
						<Clock className="h-3.5 w-3.5 text-muted-foreground" />
						<span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
							Pendientes
						</span>
					</div>
					<ul className="divide-y divide-border">
						{pending.map((item) => {
							const overdue =
								!isFutureMonth &&
								item.billingDay != null &&
								(isPastMonth || item.billingDay < todayDay)
							return (
								<li
									key={item.id}
									className={`flex items-center justify-between px-4 py-3 gap-3${overdue ? ' bg-destructive/5' : ''}`}
								>
									<div className="min-w-0">
										<div className="flex items-center gap-1.5">
											{overdue && (
												<AlertTriangle className="h-3.5 w-3.5 shrink-0 text-destructive" />
											)}
											<p
												className={`text-sm font-medium truncate${overdue ? ' text-destructive' : ' text-foreground'}`}
											>
												{item.description}
											</p>
										</div>
										{item.billingDay != null && (
											<p
												className={`text-xs${overdue ? ' text-destructive/70 font-semibold' : ' text-muted-foreground'}`}
											>
												{overdue
													? `Venció el día ${item.billingDay}`
													: `Día ${item.billingDay}`}
											</p>
										)}
									</div>
									<div className="flex items-center gap-3 shrink-0">
										<span
											className={`text-sm font-semibold${overdue ? ' text-destructive' : ' text-foreground'}`}
										>
											{formatAmount(item)}
										</span>
										<Link
											href={`/transactions/new?recurringItemId=${item.id}`}
											className={`rounded-full px-3 py-1 text-xs font-bold text-primary-foreground hover:opacity-90 transition-opacity${overdue ? ' bg-destructive' : ' bg-primary'}`}
										>
											Pagar
										</Link>
									</div>
								</li>
							)
						})}
					</ul>
				</div>
			)}

			{paid.length > 0 && (
				<div className="rounded-2xl border border-border bg-card overflow-hidden">
					<div className="flex items-center gap-2 px-4 py-2.5 border-b border-border bg-muted/30">
						<CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
						<span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
							Pagados
						</span>
					</div>
					<ul className="divide-y divide-border">
						{paid.map((item) => {
							const info = recurringIdToTxInfo.get(item.id)
							return (
								<li
									key={item.id}
									className="flex items-center justify-between px-4 py-3 gap-3"
								>
									<div className="min-w-0 flex items-center gap-2">
										<CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
										<div className="min-w-0">
											<p className="text-sm font-medium text-foreground truncate">
												{item.description}
											</p>
											{info != null && (
												<p className="text-xs text-muted-foreground">
													{fmtPaidAt(info.paidAt)} ·{' '}
													{PAYMENT_LABELS[info.paymentMethod]}
												</p>
											)}
										</div>
									</div>
									<div className="flex items-center gap-3 shrink-0">
										<span className="text-sm text-muted-foreground">
											{formatAmount(item)}
										</span>
										{info != null && (
											<Link
												href={`/transactions/${info.txId}/edit`}
												className="text-xs text-primary hover:underline"
											>
												Ver
											</Link>
										)}
									</div>
								</li>
							)
						})}
					</ul>
				</div>
			)}
		</div>
	)
}
