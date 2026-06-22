'use client'

import {
	AlertTriangle,
	CheckCircle2,
	Clock,
	SkipForward,
	Undo2,
} from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import {
	skipRecurringItem,
	unskipRecurringItem,
} from '@/app/(app)/recurring-items/actions'
import {
	AlertDialog,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
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
	skipped: RecurringRow[]
	skipReasonByItemId: Map<number, string>
	recurringIdToTxInfo: Map<number, TxInfo>
	currentMonth: Date
}

function formatAmount(item: RecurringRow): string {
	if (item.isVariable) return 'Variable'
	if (item.amountGs != null) return fmtGs(item.amountGs)
	if (item.amountUsd != null) return `$${item.amountUsd.toFixed(2)}`
	return '—'
}

function isOverdue(
	item: RecurringRow,
	isFutureMonth: boolean,
	isPastMonth: boolean,
	todayDay: number,
): boolean {
	return (
		!isFutureMonth &&
		item.billingDay != null &&
		(isPastMonth || item.billingDay < todayDay)
	)
}

function PendingItem({
	item,
	overdue,
	onSkip,
}: {
	item: RecurringRow
	overdue: boolean
	onSkip: (item: RecurringRow) => void
}) {
	return (
		<li
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
			<div className="flex items-center gap-2 shrink-0">
				<span
					className={`text-sm font-semibold${overdue ? ' text-destructive' : ' text-foreground'}`}
				>
					{formatAmount(item)}
				</span>
				<button
					type="button"
					onClick={() => onSkip(item)}
					className="rounded-full px-2.5 py-1 text-xs font-bold text-muted-foreground bg-muted hover:bg-muted/80 transition-opacity"
				>
					Saltar
				</button>
				<Link
					href={`/transactions/new?recurringItemId=${item.id}`}
					className={`rounded-full px-3 py-1 text-xs font-bold text-primary-foreground hover:opacity-90 transition-opacity${overdue ? ' bg-destructive' : ' bg-primary'}`}
				>
					Pagar
				</Link>
			</div>
		</li>
	)
}

function PaidItem({
	item,
	info,
}: {
	item: RecurringRow
	info: TxInfo | undefined
}) {
	return (
		<li className="flex items-center justify-between px-4 py-3 gap-3">
			<div className="min-w-0 flex items-center gap-2">
				<CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
				<div className="min-w-0">
					<p className="text-sm font-medium text-foreground truncate">
						{item.description}
					</p>
					{info != null && (
						<p className="text-xs text-muted-foreground">
							{fmtPaidAt(info.paidAt)} · {PAYMENT_LABELS[info.paymentMethod]}
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
}

function SkippedItem({
	item,
	reason,
	monthIso,
	onUnskipped,
}: {
	item: RecurringRow
	reason: string
	monthIso: string
	onUnskipped: () => void
}) {
	const [loading, setLoading] = useState(false)

	async function handleUnskip() {
		setLoading(true)
		const result = await unskipRecurringItem(item.id, monthIso)
		if (result?.error) {
			setLoading(false)
		} else {
			onUnskipped()
		}
	}

	return (
		<li className="flex items-center justify-between px-4 py-3 gap-3">
			<div className="min-w-0 flex items-center gap-2">
				<SkipForward className="h-4 w-4 text-amber-500 shrink-0" />
				<div className="min-w-0">
					<p className="text-sm font-medium text-foreground truncate">
						{item.description}
					</p>
					<p className="text-xs text-muted-foreground truncate">{reason}</p>
				</div>
			</div>
			<div className="flex items-center gap-2 shrink-0">
				<span className="text-sm text-muted-foreground line-through">
					{formatAmount(item)}
				</span>
				<button
					type="button"
					onClick={handleUnskip}
					disabled={loading}
					className="rounded-full p-1.5 text-muted-foreground hover:bg-muted transition-colors disabled:opacity-50"
					title="Revertir"
				>
					<Undo2 className="h-3.5 w-3.5" />
				</button>
			</div>
		</li>
	)
}

function ViewAllFooter({ href, label }: { href: string; label: string }) {
	return (
		<div className="border-t border-border px-4 py-2 text-center">
			<Link
				href={href}
				className="text-xs font-semibold text-primary hover:underline"
			>
				{label}
			</Link>
		</div>
	)
}

export function RecurringSection({
	pending,
	paid,
	skipped,
	skipReasonByItemId,
	recurringIdToTxInfo,
	currentMonth,
}: Props) {
	const [skipTarget, setSkipTarget] = useState<RecurringRow | null>(null)
	const [reason, setReason] = useState('')
	const [submitting, setSubmitting] = useState(false)

	if (pending.length === 0 && paid.length === 0 && skipped.length === 0)
		return null

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

	const overdueItems = pending.filter((item) =>
		isOverdue(item, isFutureMonth, isPastMonth, todayDay),
	)
	const upcomingItems = pending.filter(
		(item) => !isOverdue(item, isFutureMonth, isPastMonth, todayDay),
	)

	const maxUpcoming = 3
	const maxPaid = 3
	const visibleUpcoming = upcomingItems.slice(0, maxUpcoming)
	const visiblePaid = paid.slice(0, maxPaid)
	const hasMoreUpcoming = upcomingItems.length > maxUpcoming
	const hasMorePaid = paid.length > maxPaid

	const monthIso = currentMonth.toISOString()

	async function handleSkipSubmit() {
		if (!skipTarget || !reason.trim()) return
		setSubmitting(true)
		const result = await skipRecurringItem(
			skipTarget.id,
			monthIso,
			reason.trim(),
		)
		setSubmitting(false)
		if (!result?.error) {
			setSkipTarget(null)
			setReason('')
		}
	}

	return (
		<div className="space-y-3">
			<h2 className="text-base font-bold text-foreground">Recurrentes</h2>

			{overdueItems.length > 0 && (
				<div className="rounded-2xl border border-border bg-card overflow-hidden">
					<div className="flex items-center gap-2 px-4 py-2.5 border-b border-border bg-destructive/10">
						<AlertTriangle className="h-3.5 w-3.5 text-destructive" />
						<span className="text-xs font-semibold uppercase tracking-wider text-destructive">
							Vencidos ({overdueItems.length})
						</span>
					</div>
					<ul className="divide-y divide-border">
						{overdueItems.map((item) => (
							<PendingItem
								key={item.id}
								item={item}
								overdue
								onSkip={setSkipTarget}
							/>
						))}
					</ul>
				</div>
			)}

			{visibleUpcoming.length > 0 && (
				<div className="rounded-2xl border border-border bg-card overflow-hidden">
					<div className="flex items-center gap-2 px-4 py-2.5 border-b border-border bg-muted/30">
						<Clock className="h-3.5 w-3.5 text-muted-foreground" />
						<span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
							Pendientes
						</span>
					</div>
					<ul className="divide-y divide-border">
						{visibleUpcoming.map((item) => (
							<PendingItem
								key={item.id}
								item={item}
								overdue={false}
								onSkip={setSkipTarget}
							/>
						))}
					</ul>
					{hasMoreUpcoming && (
						<ViewAllFooter
							href="/recurring-items"
							label={`Ver todos (${upcomingItems.length})`}
						/>
					)}
				</div>
			)}

			{skipped.length > 0 && (
				<div className="rounded-2xl border border-border bg-card overflow-hidden">
					<div className="flex items-center gap-2 px-4 py-2.5 border-b border-border bg-amber-500/10">
						<SkipForward className="h-3.5 w-3.5 text-amber-500" />
						<span className="text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
							Saltados ({skipped.length})
						</span>
					</div>
					<ul className="divide-y divide-border">
						{skipped.map((item) => (
							<SkippedItem
								key={item.id}
								item={item}
								reason={skipReasonByItemId.get(item.id) ?? ''}
								monthIso={monthIso}
								onUnskipped={() => {}}
							/>
						))}
					</ul>
				</div>
			)}

			{visiblePaid.length > 0 && (
				<div className="rounded-2xl border border-border bg-card overflow-hidden">
					<div className="flex items-center gap-2 px-4 py-2.5 border-b border-border bg-muted/30">
						<CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
						<span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
							Pagados
						</span>
					</div>
					<ul className="divide-y divide-border">
						{visiblePaid.map((item) => (
							<PaidItem
								key={item.id}
								item={item}
								info={recurringIdToTxInfo.get(item.id)}
							/>
						))}
					</ul>
					{hasMorePaid && (
						<ViewAllFooter
							href="/recurring-items"
							label={`Ver todos (${paid.length})`}
						/>
					)}
				</div>
			)}

			<AlertDialog
				open={skipTarget != null}
				onOpenChange={(open) => {
					if (!open) {
						setSkipTarget(null)
						setReason('')
					}
				}}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Saltar recurrente</AlertDialogTitle>
						<AlertDialogDescription>
							{skipTarget?.description} — no se contará en el resumen de este
							mes.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<div>
						<label
							htmlFor="skip-reason"
							className="block text-sm font-medium text-foreground mb-1.5"
						>
							Motivo
						</label>
						<input
							id="skip-reason"
							type="text"
							value={reason}
							onChange={(e) => setReason(e.target.value)}
							placeholder="Ej: Lo pagó mi esposa"
							className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
						/>
					</div>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancelar</AlertDialogCancel>
						<Button
							onClick={handleSkipSubmit}
							disabled={!reason.trim() || submitting}
						>
							{submitting ? 'Saltando...' : 'Confirmar'}
						</Button>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	)
}
