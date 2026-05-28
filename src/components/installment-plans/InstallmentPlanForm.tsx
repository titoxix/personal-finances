'use client'

import { Check } from 'lucide-react'
import { useState, useTransition } from 'react'
import type {
	CreateInstallmentPlanPayload,
	UpdateInstallmentPlanPayload,
} from '@/app/(app)/installment-plans/actions'
import type { Category } from '@/domain/entities/category'
import type { EssentialityLevel } from '@/domain/entities/essentiality-level'
import type { InstallmentPlan } from '@/domain/entities/installment-plan'
import type { PaymentMethod } from '@/domain/entities/recurring-item'
import { formatAmountDisplay, parseAmountInput } from '@/lib/utils'

const PAYMENT_METHODS: Array<{ value: PaymentMethod; label: string }> = [
	{ value: 'itau_visa', label: 'Itaú Visa' },
	{ value: 'ueno_mastercard', label: 'Ueno MC' },
	{ value: 'itau_debito', label: 'Itaú Débito' },
	{ value: 'ueno_debito', label: 'Ueno Débito' },
	{ value: 'transferencia', label: 'Transferencia' },
	{ value: 'mango', label: 'Mango' },
	{ value: 'gnb_mastercard', label: 'GNB MC' },
]

function toDateInputValue(date: Date): string {
	return date.toISOString().split('T')[0] ?? ''
}

type NewProps = {
	mode: 'create'
	categories: Category[]
	essentialityLevels: EssentialityLevel[]
	onSubmit: (
		payload: CreateInstallmentPlanPayload,
	) => Promise<{ error: string } | undefined>
}

type EditProps = {
	mode: 'edit'
	categories: Category[]
	essentialityLevels: EssentialityLevel[]
	onSubmit: (
		payload: UpdateInstallmentPlanPayload,
	) => Promise<{ error: string } | undefined>
	onDeactivate: () => Promise<{ error: string } | undefined>
	initialValues: InstallmentPlan
}

type Props = NewProps | EditProps

export function InstallmentPlanForm(props: Props) {
	const { mode, categories, essentialityLevels } = props
	const iv = mode === 'edit' ? props.initialValues : undefined

	const [description, setDescription] = useState(iv?.description ?? '')
	const [installmentsTotal, setInstallmentsTotal] = useState(
		iv?.installmentsTotal?.toString() ?? '',
	)
	const [installmentsPaid, setInstallmentsPaid] = useState(
		iv?.installmentsPaid?.toString() ?? '0',
	)
	const [startDate, setStartDate] = useState(
		iv?.startDate ? toDateInputValue(iv.startDate) : '',
	)
	const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | ''>(
		iv?.paymentMethod ?? '',
	)
	const [categoryId, setCategoryId] = useState<number | ''>(
		iv?.categoryId ?? '',
	)
	const [essentialityId, setEssentialityId] = useState<number | ''>(
		iv?.essentialityId ?? '',
	)
	const [installmentAmountGs, setInstallmentAmountGs] = useState(
		iv?.installmentAmountGs?.toString() ?? '',
	)
	const [totalAmountGs, setTotalAmountGs] = useState(
		iv?.totalAmountGs?.toString() ?? '',
	)
	const [totalAmountUsd, setTotalAmountUsd] = useState(
		iv?.totalAmountUsd?.toString() ?? '',
	)
	const [notes, setNotes] = useState(iv?.notes ?? '')
	const [error, setError] = useState<string | null>(null)
	const [isPending, startTransition] = useTransition()
	const [isDeactivating, startDeactivateTransition] = useTransition()

	const isValid =
		description.trim().length > 0 &&
		(mode === 'create'
			? Number(installmentsTotal) >= 1 && startDate !== ''
			: true) &&
		paymentMethod !== '' &&
		categoryId !== '' &&
		essentialityId !== ''

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
					installmentsTotal: Number(installmentsTotal),
					startDate: new Date(startDate),
					paymentMethod: paymentMethod as PaymentMethod,
					categoryId: categoryId as number,
					essentialityId: essentialityId as number,
					installmentAmountGs: installmentAmountGs
						? Number(installmentAmountGs)
						: undefined,
					totalAmountGs: totalAmountGs ? Number(totalAmountGs) : undefined,
					totalAmountUsd: totalAmountUsd ? Number(totalAmountUsd) : undefined,
					notes: notes.trim() || undefined,
				})
			} else {
				result = await props.onSubmit({
					description: description.trim(),
					installmentsPaid: Number(installmentsPaid),
					paymentMethod: paymentMethod as PaymentMethod,
					categoryId: categoryId as number,
					essentialityId: essentialityId as number,
					installmentAmountGs: installmentAmountGs
						? Number(installmentAmountGs)
						: null,
					totalAmountGs: totalAmountGs ? Number(totalAmountGs) : null,
					totalAmountUsd: totalAmountUsd ? Number(totalAmountUsd) : null,
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
					htmlFor="ip-description"
					className="text-sm font-semibold text-foreground"
				>
					Descripción <span className="text-primary">*</span>
				</label>
				<input
					id="ip-description"
					type="text"
					value={description}
					onChange={(e) => setDescription(e.target.value)}
					placeholder="e.g. iPhone 15, Notebook, Heladera"
					className="w-full rounded-2xl border border-border bg-card px-4 py-3.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/60 transition-colors"
				/>
			</div>

			{/* Total installments — create only */}
			{mode === 'create' && (
				<div className="space-y-2">
					<label
						htmlFor="ip-total"
						className="text-sm font-semibold text-foreground"
					>
						Total de cuotas <span className="text-primary">*</span>
					</label>
					<input
						id="ip-total"
						type="number"
						min={1}
						value={installmentsTotal}
						onChange={(e) => setInstallmentsTotal(e.target.value)}
						placeholder="e.g. 12"
						className="w-full rounded-2xl border border-border bg-card px-4 py-3.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/60 transition-colors"
					/>
				</div>
			)}

			{/* Installments paid — edit only */}
			{mode === 'edit' && iv && (
				<div className="space-y-2">
					<p className="text-sm font-semibold text-foreground">
						Cuotas pagadas
					</p>
					<div className="flex items-center gap-3">
						<button
							type="button"
							onClick={() =>
								setInstallmentsPaid((v) =>
									Math.max(0, Number(v) - 1).toString(),
								)
							}
							className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-border bg-card text-lg font-bold text-foreground transition-colors hover:bg-accent"
						>
							−
						</button>
						<div className="flex-1 rounded-2xl border border-border bg-card px-4 py-3 text-center font-mono text-base font-bold text-foreground">
							{installmentsPaid} / {iv.installmentsTotal}
						</div>
						<button
							type="button"
							onClick={() =>
								setInstallmentsPaid((v) =>
									Math.min(iv.installmentsTotal, Number(v) + 1).toString(),
								)
							}
							className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-border bg-card text-lg font-bold text-foreground transition-colors hover:bg-accent"
						>
							+
						</button>
					</div>
				</div>
			)}

			{/* Start date — create only */}
			{mode === 'create' && (
				<div className="space-y-2">
					<label
						htmlFor="ip-start-date"
						className="text-sm font-semibold text-foreground"
					>
						Fecha de inicio <span className="text-primary">*</span>
					</label>
					<input
						id="ip-start-date"
						type="date"
						value={startDate}
						onChange={(e) => setStartDate(e.target.value)}
						className="w-full rounded-2xl border border-border bg-card px-4 py-3.5 text-sm text-foreground outline-none focus:border-primary/60 transition-colors"
					/>
				</div>
			)}

			{/* Category */}
			<div className="space-y-2">
				<label
					htmlFor="ip-category"
					className="text-sm font-semibold text-foreground"
				>
					Categoría <span className="text-primary">*</span>
				</label>
				<select
					id="ip-category"
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
					htmlFor="ip-essentiality"
					className="text-sm font-semibold text-foreground"
				>
					Esencialidad <span className="text-primary">*</span>
				</label>
				<select
					id="ip-essentiality"
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
					htmlFor="ip-payment"
					className="text-sm font-semibold text-foreground"
				>
					Método de pago <span className="text-primary">*</span>
				</label>
				<select
					id="ip-payment"
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

			{/* Installment amount Gs */}
			<div className="space-y-2">
				<label
					htmlFor="ip-installment-gs"
					className="text-sm font-semibold text-foreground"
				>
					Monto por cuota (Gs){' '}
					<span className="font-normal text-muted-foreground">(Opcional)</span>
				</label>
				<input
					id="ip-installment-gs"
					type="text"
					inputMode="numeric"
					value={formatAmountDisplay(installmentAmountGs)}
					onChange={(e) =>
						setInstallmentAmountGs(parseAmountInput(e.target.value))
					}
					placeholder="0"
					className="w-full rounded-2xl border border-border bg-card px-4 py-3.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/60 transition-colors"
				/>
			</div>

			{/* Total amount Gs */}
			<div className="space-y-2">
				<label
					htmlFor="ip-total-gs"
					className="text-sm font-semibold text-foreground"
				>
					Monto total (Gs){' '}
					<span className="font-normal text-muted-foreground">(Opcional)</span>
				</label>
				<input
					id="ip-total-gs"
					type="text"
					inputMode="numeric"
					value={formatAmountDisplay(totalAmountGs)}
					onChange={(e) => setTotalAmountGs(parseAmountInput(e.target.value))}
					placeholder="0"
					className="w-full rounded-2xl border border-border bg-card px-4 py-3.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/60 transition-colors"
				/>
			</div>

			{/* Total amount USD */}
			<div className="space-y-2">
				<label
					htmlFor="ip-total-usd"
					className="text-sm font-semibold text-foreground"
				>
					Monto total (USD){' '}
					<span className="font-normal text-muted-foreground">(Opcional)</span>
				</label>
				<input
					id="ip-total-usd"
					type="text"
					inputMode="decimal"
					value={formatAmountDisplay(totalAmountUsd, true)}
					onChange={(e) =>
						setTotalAmountUsd(parseAmountInput(e.target.value, true))
					}
					placeholder="0.00"
					className="w-full rounded-2xl border border-border bg-card px-4 py-3.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/60 transition-colors"
				/>
			</div>

			{/* Notes */}
			<div className="space-y-2">
				<label
					htmlFor="ip-notes"
					className="text-sm font-semibold text-foreground"
				>
					Notas{' '}
					<span className="font-normal text-muted-foreground">(Opcional)</span>
				</label>
				<textarea
					id="ip-notes"
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
