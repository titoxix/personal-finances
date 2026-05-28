'use client'

import { Check } from 'lucide-react'
import { parseAmountInput, formatAmountDisplay } from '@/lib/utils'
import { useState, useTransition } from 'react'
import type {
	CreateRecurringItemPayload,
	UpdateRecurringItemPayload,
} from '@/app/(app)/recurring-items/actions'
import type { Category } from '@/domain/entities/category'
import type { EssentialityLevel } from '@/domain/entities/essentiality-level'
import type {
	PaymentMethod,
	RecurringFrequency,
	RecurringItem,
} from '@/domain/entities/recurring-item'

const PAYMENT_METHODS: Array<{ value: PaymentMethod; label: string }> = [
	{ value: 'itau_visa', label: 'Itaú Visa' },
	{ value: 'ueno_mastercard', label: 'Ueno MC' },
	{ value: 'itau_debito', label: 'Itaú Débito' },
	{ value: 'ueno_debito', label: 'Ueno Débito' },
	{ value: 'transferencia', label: 'Transferencia' },
	{ value: 'mango', label: 'Mango' },
	{ value: 'gnb_mastercard', label: 'GNB MC' },
]

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

type NewProps = {
	mode: 'create'
	categories: Category[]
	essentialityLevels: EssentialityLevel[]
	onSubmit: (
		payload: CreateRecurringItemPayload,
	) => Promise<{ error: string } | undefined>
}

type EditProps = {
	mode: 'edit'
	categories: Category[]
	essentialityLevels: EssentialityLevel[]
	onSubmit: (
		payload: UpdateRecurringItemPayload,
	) => Promise<{ error: string } | undefined>
	onDeactivate: () => Promise<{ error: string } | undefined>
	initialValues: RecurringItem
}

type Props = NewProps | EditProps

export function RecurringItemForm(props: Props) {
	const { mode, categories, essentialityLevels } = props
	const iv = mode === 'edit' ? props.initialValues : undefined

	const [description, setDescription] = useState(iv?.description ?? '')
	const [categoryId, setCategoryId] = useState<number | ''>(
		iv?.categoryId ?? '',
	)
	const [essentialityId, setEssentialityId] = useState<number | ''>(
		iv?.essentialityId ?? '',
	)
	const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | ''>(
		iv?.paymentMethod ?? '',
	)
	const [frequency, setFrequency] = useState<RecurringFrequency>(
		iv?.frequency ?? 'monthly',
	)
	const [billingDay, setBillingDay] = useState(iv?.billingDay?.toString() ?? '')
	const [billingMonth, setBillingMonth] = useState(
		iv?.billingMonth?.toString() ?? '',
	)
	const [isVariable, setIsVariable] = useState(iv?.isVariable ?? false)
	const [amountGs, setAmountGs] = useState(iv?.amountGs?.toString() ?? '')
	const [amountUsd, setAmountUsd] = useState(iv?.amountUsd?.toString() ?? '')
	const [notes, setNotes] = useState(iv?.notes ?? '')
	const [error, setError] = useState<string | null>(null)
	const [isPending, startTransition] = useTransition()
	const [isDeactivating, startDeactivateTransition] = useTransition()

	const amountOk = isVariable || Number(amountGs) > 0 || Number(amountUsd) > 0
	const billingOk =
		billingDay !== '' && (frequency === 'monthly' || billingMonth !== '')
	const isValid =
		description.trim().length > 0 &&
		categoryId !== '' &&
		essentialityId !== '' &&
		paymentMethod !== '' &&
		billingOk &&
		amountOk

	function handleSubmit() {
		if (!isValid) {
			setError('Completá todos los campos requeridos.')
			return
		}
		setError(null)
		startTransition(async () => {
			let result: { error: string } | undefined

			if (mode === 'create') {
				result = await props.onSubmit({
					description: description.trim(),
					categoryId: categoryId as number,
					essentialityId: essentialityId as number,
					paymentMethod: paymentMethod as PaymentMethod,
					frequency,
					billingDay: Number(billingDay),
					billingMonth:
						frequency === 'annual' ? Number(billingMonth) : undefined,
					isVariable,
					amountGs: amountGs ? Number(amountGs) : undefined,
					amountUsd: amountUsd ? Number(amountUsd) : undefined,
					notes: notes.trim() || undefined,
				})
			} else {
				result = await props.onSubmit({
					description: description.trim(),
					categoryId: categoryId as number,
					essentialityId: essentialityId as number,
					paymentMethod: paymentMethod as PaymentMethod,
					frequency,
					billingDay: Number(billingDay),
					billingMonth: frequency === 'annual' ? Number(billingMonth) : null,
					isVariable,
					amountGs: amountGs ? Number(amountGs) : null,
					amountUsd: amountUsd ? Number(amountUsd) : null,
					notes: notes.trim() || null,
				})
			}

			if (result?.error) setError(result.error)
		})
	}

	function handleDeactivate() {
		if (mode !== 'edit') return
		startDeactivateTransition(async () => {
			const result = await props.onDeactivate()
			if (result?.error) setError(result.error)
		})
	}

	return (
		<div className="space-y-5 pb-6">
			{/* Description */}
			<div className="space-y-2">
				<label
					htmlFor="ri-description"
					className="text-sm font-semibold text-foreground"
				>
					Descripción <span className="text-primary">*</span>
				</label>
				<input
					id="ri-description"
					type="text"
					value={description}
					onChange={(e) => setDescription(e.target.value)}
					placeholder="e.g. Netflix, Alquiler, Asismed"
					className="w-full rounded-2xl border border-border bg-card px-4 py-3.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/60 transition-colors"
				/>
			</div>

			{/* Frequency */}
			<div className="space-y-2">
				<p className="text-sm font-semibold text-foreground">
					Frecuencia <span className="text-primary">*</span>
				</p>
				<div className="grid grid-cols-2 gap-2">
					{(['monthly', 'annual'] as const).map((f) => (
						<button
							key={f}
							type="button"
							onClick={() => {
								setFrequency(f)
								if (f === 'monthly') setBillingMonth('')
							}}
							className={`rounded-2xl border py-3.5 text-sm font-semibold transition-colors ${
								frequency === f
									? 'border-primary bg-primary/10 text-primary'
									: 'border-border bg-card text-muted-foreground'
							}`}
						>
							{f === 'monthly' ? 'Mensual' : 'Anual'}
						</button>
					))}
				</div>
			</div>

			{/* Billing day / month */}
			<div
				className={`grid gap-3 ${frequency === 'annual' ? 'grid-cols-2' : 'grid-cols-1'}`}
			>
				<div className="space-y-2">
					<label
						htmlFor="ri-billing-day"
						className="text-sm font-semibold text-foreground"
					>
						Día de cobro <span className="text-primary">*</span>
					</label>
					<input
						id="ri-billing-day"
						type="number"
						min={1}
						max={31}
						value={billingDay}
						onChange={(e) => setBillingDay(e.target.value)}
						placeholder="1 – 31"
						className="w-full rounded-2xl border border-border bg-card px-4 py-3.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/60 transition-colors"
					/>
				</div>
				{frequency === 'annual' && (
					<div className="space-y-2">
						<label
							htmlFor="ri-billing-month"
							className="text-sm font-semibold text-foreground"
						>
							Mes de cobro <span className="text-primary">*</span>
						</label>
						<select
							id="ri-billing-month"
							value={billingMonth}
							onChange={(e) => setBillingMonth(e.target.value)}
							className="w-full rounded-2xl border border-border bg-card px-4 py-3.5 text-sm text-foreground outline-none focus:border-primary/60 transition-colors"
						>
							<option value="">Mes</option>
							{MONTHS_ES.map((m, i) => (
								<option key={m} value={i + 1}>
									{m}
								</option>
							))}
						</select>
					</div>
				)}
			</div>

			{/* Category */}
			<div className="space-y-2">
				<label
					htmlFor="ri-category"
					className="text-sm font-semibold text-foreground"
				>
					Categoría <span className="text-primary">*</span>
				</label>
				<select
					id="ri-category"
					value={categoryId}
					onChange={(e) => setCategoryId(Number(e.target.value) || '')}
					className="w-full rounded-2xl border border-border bg-card px-4 py-3.5 text-sm text-foreground outline-none focus:border-primary/60 transition-colors"
				>
					<option value="">Seleccionar</option>
					{categories
						.filter((c) => c.active)
						.map((c) => (
							<option key={c.id} value={c.id}>
								{c.label}
							</option>
						))}
				</select>
			</div>

			{/* Essentiality */}
			<div className="space-y-2">
				<label
					htmlFor="ri-essentiality"
					className="text-sm font-semibold text-foreground"
				>
					Esencialidad <span className="text-primary">*</span>
				</label>
				<select
					id="ri-essentiality"
					value={essentialityId}
					onChange={(e) => setEssentialityId(Number(e.target.value) || '')}
					className="w-full rounded-2xl border border-border bg-card px-4 py-3.5 text-sm text-foreground outline-none focus:border-primary/60 transition-colors"
				>
					<option value="">Seleccionar</option>
					{essentialityLevels.map((e) => (
						<option key={e.id} value={e.id}>
							{e.label}
						</option>
					))}
				</select>
			</div>

			{/* Payment method */}
			<div className="space-y-2">
				<label
					htmlFor="ri-payment"
					className="text-sm font-semibold text-foreground"
				>
					Método de pago <span className="text-primary">*</span>
				</label>
				<select
					id="ri-payment"
					value={paymentMethod}
					onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
					className="w-full rounded-2xl border border-border bg-card px-4 py-3.5 text-sm text-foreground outline-none focus:border-primary/60 transition-colors"
				>
					<option value="">Seleccionar</option>
					{PAYMENT_METHODS.map((pm) => (
						<option key={pm.value} value={pm.value}>
							{pm.label}
						</option>
					))}
				</select>
			</div>

			{/* Is variable */}
			<div className="flex items-center justify-between rounded-2xl border border-border bg-card p-4">
				<div>
					<p className="text-sm font-semibold text-foreground">
						Monto variable
					</p>
					<p className="text-xs text-muted-foreground">
						El monto cambia cada período (ej: electricidad)
					</p>
				</div>
				<button
					type="button"
					role="switch"
					aria-checked={isVariable}
					onClick={() => setIsVariable((v) => !v)}
					className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${
						isVariable ? 'bg-primary' : 'bg-muted'
					}`}
				>
					<span
						className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all ${
							isVariable ? 'left-6' : 'left-1'
						}`}
					/>
				</button>
			</div>

			{/* Amount Gs */}
			<div className="space-y-2">
				<label
					htmlFor="ri-amount-gs"
					className="text-sm font-semibold text-foreground"
				>
					Monto en Gs
					{!isVariable && <span className="ml-1 text-primary">*</span>}
					{isVariable && (
						<span className="ml-1 font-normal text-muted-foreground">
							(Estimación)
						</span>
					)}
				</label>
				<input
					id="ri-amount-gs"
					type="text"
					inputMode="numeric"
					value={formatAmountDisplay(amountGs)}
					onChange={(e) => setAmountGs(parseAmountInput(e.target.value))}
					placeholder="0"
					className="w-full rounded-2xl border border-border bg-card px-4 py-3.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/60 transition-colors"
				/>
			</div>

			{/* Amount USD */}
			<div className="space-y-2">
				<label
					htmlFor="ri-amount-usd"
					className="text-sm font-semibold text-foreground"
				>
					Monto en USD{' '}
					<span className="font-normal text-muted-foreground">(Opcional)</span>
				</label>
				<input
					id="ri-amount-usd"
					type="text"
					inputMode="decimal"
					value={formatAmountDisplay(amountUsd, true)}
					onChange={(e) => setAmountUsd(parseAmountInput(e.target.value, true))}
					placeholder="0.00"
					className="w-full rounded-2xl border border-border bg-card px-4 py-3.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/60 transition-colors"
				/>
			</div>

			{/* Notes */}
			<div className="space-y-2">
				<label
					htmlFor="ri-notes"
					className="text-sm font-semibold text-foreground"
				>
					Notas{' '}
					<span className="font-normal text-muted-foreground">(Opcional)</span>
				</label>
				<textarea
					id="ri-notes"
					value={notes}
					onChange={(e) => setNotes(e.target.value)}
					placeholder="Contexto adicional..."
					rows={3}
					className="w-full resize-none rounded-2xl border border-border bg-card px-4 py-3.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/60 transition-colors"
				/>
			</div>

			{/* Error */}
			{error && (
				<p className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-2.5 text-sm text-destructive">
					{error}
				</p>
			)}

			{/* Submit */}
			<button
				type="button"
				onClick={handleSubmit}
				disabled={isPending}
				className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 text-base font-bold text-primary-foreground transition-opacity disabled:opacity-60"
			>
				<Check className="h-5 w-5" />
				{isPending ? 'Guardando...' : 'Guardar'}
			</button>

			{/* Deactivate — edit mode, only if currently active */}
			{mode === 'edit' && props.initialValues.active && (
				<button
					type="button"
					onClick={handleDeactivate}
					disabled={isDeactivating}
					className="w-full rounded-2xl border border-destructive/30 py-3.5 text-sm font-semibold text-destructive transition-opacity disabled:opacity-60"
				>
					{isDeactivating ? 'Desactivando...' : 'Desactivar'}
				</button>
			)}
		</div>
	)
}
