'use client'

import { CalendarDays, CheckCircle2, PlusCircle } from 'lucide-react'
import Link from 'next/link'
import { useState, useTransition } from 'react'
import type { CreateTransactionPayload } from '@/app/(app)/transactions/actions'
import type { Category } from '@/domain/entities/category'
import type { EssentialityLevel } from '@/domain/entities/essentiality-level'
import type { InstallmentPlan } from '@/domain/entities/installment-plan'
import type {
	PaymentMethod,
	RecurringItem,
} from '@/domain/entities/recurring-item'
import { cn, formatAmountDisplay, parseAmountInput } from '@/lib/utils'

const PAYMENT_METHODS: Array<{ value: PaymentMethod; label: string }> = [
	{ value: 'itau_visa', label: 'Itaú Visa' },
	{ value: 'ueno_mastercard', label: 'Ueno MC' },
	{ value: 'transferencia', label: 'Transferencia' },
	{ value: 'itau_debito', label: 'Itaú Débito' },
	{ value: 'ueno_debito', label: 'Ueno Débito' },
	{ value: 'mango', label: 'Mango' },
	{ value: 'gnb_mastercard', label: 'GNB MC' },
]

type Props = {
	categories: Category[]
	essentialityLevels: EssentialityLevel[]
	recurringItems: RecurringItem[]
	installmentPlans: InstallmentPlan[]
	onSubmit: (
		payload: CreateTransactionPayload,
	) => Promise<{ error: string } | undefined>
	initialValues?: CreateTransactionPayload
	onDelete?: () => Promise<{ error: string } | undefined>
}

function todayISO() {
	return new Date().toISOString().split('T')[0] as string
}

function planInstallmentAmount(
	plan: InstallmentPlan,
): { amount: number; currency: 'gs' | 'usd' } | null {
	if (plan.installmentAmountGs != null)
		return { amount: plan.installmentAmountGs, currency: 'gs' }
	if (plan.totalAmountGs != null)
		return {
			amount: plan.totalAmountGs / plan.installmentsTotal,
			currency: 'gs',
		}
	if (plan.totalAmountUsd != null)
		return {
			amount: plan.totalAmountUsd / plan.installmentsTotal,
			currency: 'usd',
		}
	return null
}

export function TransactionForm({
	categories,
	essentialityLevels,
	recurringItems,
	installmentPlans,
	onSubmit,
	initialValues,
	onDelete,
}: Props) {
	const preselectedItem =
		initialValues?.recurringItemId != null
			? recurringItems.find((r) => r.id === initialValues.recurringItemId)
			: undefined

	const preselectedPlan =
		initialValues?.installmentPlanId != null
			? installmentPlans.find((p) => p.id === initialValues.installmentPlanId)
			: undefined
	const preselectedPlanAmount = preselectedPlan
		? planInstallmentAmount(preselectedPlan)
		: null

	const [currency, setCurrency] = useState<'gs' | 'usd'>(() => {
		if (preselectedItem && !preselectedItem.isVariable) {
			if (preselectedItem.amountGs != null) return 'gs'
			if (preselectedItem.amountUsd != null) return 'usd'
		}
		if (preselectedPlanAmount) return preselectedPlanAmount.currency
		return initialValues?.currency ?? 'gs'
	})
	const [amount, setAmount] = useState(() => {
		if (preselectedItem && !preselectedItem.isVariable) {
			if (preselectedItem.amountGs != null)
				return preselectedItem.amountGs.toString()
			if (preselectedItem.amountUsd != null)
				return preselectedItem.amountUsd.toString()
		}
		if (preselectedPlanAmount) return preselectedPlanAmount.amount.toString()
		return initialValues?.amount?.toString() ?? ''
	})
	const [description, setDescription] = useState(
		initialValues?.description ?? '',
	)
	const [categoryId, setCategoryId] = useState<number | ''>(
		preselectedItem?.categoryId ??
			preselectedPlan?.categoryId ??
			initialValues?.categoryId ??
			'',
	)
	const [essentialityId, setEssentialityId] = useState<number | null>(
		preselectedItem?.essentialityId ??
			preselectedPlan?.essentialityId ??
			initialValues?.essentialityId ??
			null,
	)
	const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(
		preselectedItem?.paymentMethod ??
			preselectedPlan?.paymentMethod ??
			initialValues?.paymentMethod ??
			null,
	)
	const [date, setDate] = useState(initialValues?.date ?? todayISO())
	const [recurringItemId, setRecurringItemId] = useState<number | null>(
		initialValues?.recurringItemId ?? null,
	)
	const [installmentPlanId, setInstallmentPlanId] = useState<number | null>(
		initialValues?.installmentPlanId ?? null,
	)
	const [error, setError] = useState<string | null>(null)
	const [isPending, startTransition] = useTransition()
	const [isDeleting, startDeleteTransition] = useTransition()

	function handleRecurringSelect(id: number | null) {
		setRecurringItemId(id)
		if (id == null) return
		const item = recurringItems.find((r) => r.id === id)
		if (!item) return
		if (!item.isVariable) {
			if (item.amountGs != null) {
				setCurrency('gs')
				setAmount(item.amountGs.toString())
			} else if (item.amountUsd != null) {
				setCurrency('usd')
				setAmount(item.amountUsd.toString())
			}
		}
		if (item.categoryId) setCategoryId(item.categoryId)
		if (item.essentialityId) setEssentialityId(item.essentialityId)
		if (item.paymentMethod) setPaymentMethod(item.paymentMethod)
	}

	const selectedPlan =
		installmentPlanId != null
			? installmentPlans.find((p) => p.id === installmentPlanId)
			: undefined

	function handleInstallmentPlanSelect(id: number | null) {
		setInstallmentPlanId(id)
		if (id == null) return
		const plan = installmentPlans.find((p) => p.id === id)
		if (!plan) return
		const planAmount = planInstallmentAmount(plan)
		if (planAmount) {
			setCurrency(planAmount.currency)
			setAmount(planAmount.amount.toString())
		}
		if (plan.categoryId) setCategoryId(plan.categoryId)
		if (plan.essentialityId) setEssentialityId(plan.essentialityId)
		if (plan.paymentMethod) setPaymentMethod(plan.paymentMethod)
	}

	const isValid =
		Number(amount) > 0 &&
		description.trim().length > 0 &&
		categoryId !== '' &&
		essentialityId !== null &&
		paymentMethod !== null

	function handleSubmit() {
		if (!isValid) {
			setError('Completá todos los campos antes de guardar.')
			return
		}
		setError(null)
		startTransition(async () => {
			const result = await onSubmit({
				amount: Number(amount),
				currency,
				description: description.trim(),
				categoryId: categoryId as number,
				essentialityId: essentialityId as number,
				paymentMethod: paymentMethod as PaymentMethod,
				date: date as string,
				recurringItemId: recurringItemId ?? undefined,
				installmentPlanId: installmentPlanId ?? undefined,
			})
			if (result?.error) setError(result.error)
		})
	}

	function handleDelete() {
		if (!onDelete) return
		startDeleteTransition(async () => {
			const result = await onDelete()
			if (result?.error) setError(result.error)
		})
	}

	return (
		<div className="space-y-5 pb-6">
			{/* ── Amount ── */}
			<div className="rounded-2xl border border-border bg-card p-4">
				<div className="flex items-center justify-between">
					<span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
						Monto
					</span>
					{/* Currency toggle */}
					<div className="flex items-center gap-1 rounded-full bg-secondary p-1">
						{(['gs', 'usd'] as const).map((c) => (
							<button
								key={c}
								type="button"
								onClick={() => {
									setCurrency(c)
									setAmount('')
								}}
								className={cn(
									'rounded-full px-3 py-0.5 text-xs font-bold transition-colors',
									currency === c
										? 'bg-primary text-primary-foreground'
										: 'text-muted-foreground hover:text-foreground',
								)}
							>
								{c === 'gs' ? 'Gs' : 'USD'}
							</button>
						))}
					</div>
				</div>

				<div className="mt-3 flex items-baseline gap-2">
					<span className="text-2xl font-bold text-muted-foreground">
						{currency === 'gs' ? '₲' : '$'}
					</span>
					<input
						type="text"
						inputMode={currency === 'gs' ? 'numeric' : 'decimal'}
						value={formatAmountDisplay(amount, currency === 'usd')}
						onChange={(e) =>
							setAmount(parseAmountInput(e.target.value, currency === 'usd'))
						}
						placeholder="0"
						className="w-full bg-transparent text-4xl font-bold text-foreground outline-none placeholder:text-muted-foreground/40"
					/>
				</div>
			</div>

			{/* ── Recurring item ── */}
			{recurringItems.length > 0 && (
				<div className="space-y-2">
					<label
						htmlFor="recurring"
						className="text-sm font-semibold text-foreground"
					>
						Recurrente (opcional)
					</label>
					<div className="relative">
						<select
							id="recurring"
							value={recurringItemId ?? ''}
							onChange={(e) =>
								handleRecurringSelect(
									e.target.value === '' ? null : Number(e.target.value),
								)
							}
							className="w-full appearance-none rounded-2xl border border-border bg-card px-4 py-3.5 text-sm text-foreground outline-none focus:border-primary/60 transition-colors"
						>
							<option value="">Sin recurrente</option>
							{recurringItems.map((item) => (
								<option key={item.id} value={item.id}>
									{item.description}
								</option>
							))}
						</select>
						<div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">
							<svg
								aria-hidden="true"
								width="16"
								height="16"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
							>
								<path d="m6 9 6 6 6-6" />
							</svg>
						</div>
					</div>
					{recurringItemId != null && (
						<p className="text-xs text-muted-foreground">
							Montos y categoría pre-cargados — podés modificarlos.
						</p>
					)}
				</div>
			)}

			{/* ── Installment plan ── */}
			{installmentPlans.length > 0 && (
				<div className="space-y-2">
					<label
						htmlFor="installment-plan"
						className="text-sm font-semibold text-foreground"
					>
						Plan de cuotas (opcional)
					</label>
					<div className="relative">
						<select
							id="installment-plan"
							value={installmentPlanId ?? ''}
							onChange={(e) =>
								handleInstallmentPlanSelect(
									e.target.value === '' ? null : Number(e.target.value),
								)
							}
							className="w-full appearance-none rounded-2xl border border-border bg-card px-4 py-3.5 text-sm text-foreground outline-none focus:border-primary/60 transition-colors"
						>
							<option value="">Sin plan de cuotas</option>
							{installmentPlans.map((plan) => (
								<option key={plan.id} value={plan.id}>
									{plan.description}
								</option>
							))}
						</select>
						<div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">
							<svg
								aria-hidden="true"
								width="16"
								height="16"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
							>
								<path d="m6 9 6 6 6-6" />
							</svg>
						</div>
					</div>
					{selectedPlan && (
						<p className="text-xs text-muted-foreground">
							Cuota {selectedPlan.installmentsPaid + 1} de{' '}
							{selectedPlan.installmentsTotal} — montos y categoría
							pre-cargados, podés modificarlos.
						</p>
					)}
				</div>
			)}

			{/* ── Description ── */}
			<div className="space-y-2">
				<label
					htmlFor="description"
					className="text-sm font-semibold text-foreground"
				>
					Descripción
				</label>
				<input
					id="description"
					type="text"
					value={description}
					onChange={(e) => setDescription(e.target.value)}
					placeholder="¿En qué gastaste?"
					className="w-full rounded-2xl border border-border bg-card px-4 py-3.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/60 transition-colors"
				/>
			</div>

			{/* ── Category ── */}
			<div className="space-y-2">
				<label
					htmlFor="category"
					className="text-sm font-semibold text-foreground"
				>
					Categoría
				</label>
				<div className="relative">
					<select
						id="category"
						value={categoryId}
						onChange={(e) =>
							setCategoryId(e.target.value === '' ? '' : Number(e.target.value))
						}
						className="w-full appearance-none rounded-2xl border border-border bg-card px-4 py-3.5 text-sm text-foreground outline-none focus:border-primary/60 transition-colors"
					>
						<option value="" disabled>
							Seleccionar categoría
						</option>
						{categories.map((cat) => (
							<option key={cat.id} value={cat.id}>
								{cat.label}
							</option>
						))}
					</select>
					<div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">
						<svg
							aria-hidden="true"
							width="16"
							height="16"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
						>
							<path d="m6 9 6 6 6-6" />
						</svg>
					</div>
				</div>
				<Link
					href="/categories/new"
					className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
				>
					<PlusCircle className="h-3.5 w-3.5" />
					Crear nueva categoría
				</Link>
			</div>

			{/* ── Priority ── */}
			<div className="space-y-2">
				<p className="text-sm font-semibold text-foreground">Prioridad</p>
				<div className="flex flex-wrap gap-2">
					{essentialityLevels.map((level) => (
						<button
							key={level.id}
							type="button"
							onClick={() => setEssentialityId(level.id)}
							className={cn(
								'rounded-full border px-4 py-2 text-sm font-medium transition-colors',
								essentialityId === level.id
									? 'border-primary bg-primary/10 text-primary'
									: 'border-border text-foreground hover:border-primary/50',
							)}
						>
							{level.label}
						</button>
					))}
				</div>
			</div>

			{/* ── Payment method ── */}
			<div className="space-y-2">
				<p className="text-sm font-semibold text-foreground">Método de Pago</p>
				<div className="flex flex-wrap gap-2">
					{PAYMENT_METHODS.map(({ value, label }) => (
						<button
							key={value}
							type="button"
							onClick={() => setPaymentMethod(value)}
							className={cn(
								'rounded-full border px-4 py-2 text-sm font-medium transition-colors',
								paymentMethod === value
									? 'border-primary bg-primary text-primary-foreground'
									: 'border-border text-foreground hover:border-primary/50',
							)}
						>
							{label}
						</button>
					))}
				</div>
			</div>

			{/* ── Date ── */}
			<div className="space-y-2">
				<label htmlFor="date" className="text-sm font-semibold text-foreground">
					Fecha
				</label>
				<div className="relative">
					<input
						id="date"
						type="date"
						value={date}
						onChange={(e) => setDate(e.target.value)}
						className="w-full rounded-2xl border border-border bg-card px-4 py-3.5 text-sm text-foreground outline-none focus:border-primary/60 transition-colors [color-scheme:dark]"
					/>
					<CalendarDays className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
				</div>
			</div>

			{/* ── Error ── */}
			{error && (
				<p className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-2.5 text-sm text-destructive">
					{error}
				</p>
			)}

			{/* ── Submit ── */}
			<button
				type="button"
				onClick={handleSubmit}
				disabled={isPending || isDeleting}
				className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 text-base font-bold text-primary-foreground transition-opacity disabled:opacity-60"
			>
				<CheckCircle2 className="h-5 w-5" />
				{isPending ? 'Guardando...' : initialValues ? 'Actualizar' : 'Guardar'}
			</button>

			{/* ── Delete (edit mode only) ── */}
			{onDelete && (
				<button
					type="button"
					onClick={handleDelete}
					disabled={isPending || isDeleting}
					className="flex w-full items-center justify-center rounded-2xl border border-destructive/40 py-3.5 text-sm font-semibold text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-60"
				>
					{isDeleting ? 'Eliminando...' : 'Eliminar transacción'}
				</button>
			)}
		</div>
	)
}
