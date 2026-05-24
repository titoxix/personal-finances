'use client'

import { CheckCircle2, Lock } from 'lucide-react'
import { useState, useTransition } from 'react'
import type {
	CreateBudgetPayload,
	UpdateBudgetPayload,
} from '@/app/(app)/budgets/actions'
import type { Category } from '@/domain/entities/category'
import type { EssentialityLevel } from '@/domain/entities/essentiality-level'
import { cn } from '@/lib/utils'

function currentMonthISO(): string {
	const now = new Date()
	return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

type CreateProps = {
	mode: 'create'
	categories: Category[]
	essentialityLevels: EssentialityLevel[]
	onSubmit: (
		payload: CreateBudgetPayload,
	) => Promise<{ error: string } | undefined>
}

type EditProps = {
	mode: 'edit'
	categoryLabel: string
	essentialityLevels: EssentialityLevel[]
	initialValues: {
		essentialityId: number
		currency: 'usd' | 'gs'
		amount: number
		notes: string
	}
	onSubmit: (
		payload: UpdateBudgetPayload,
	) => Promise<{ error: string } | undefined>
}

type Props = CreateProps | EditProps

export function BudgetForm(props: Props) {
	const { essentialityLevels } = props

	const [month, setMonth] = useState(currentMonthISO())
	const [categoryId, setCategoryId] = useState<number | ''>('')
	const [essentialityId, setEssentialityId] = useState<number | null>(
		props.mode === 'edit' ? props.initialValues.essentialityId : null,
	)
	const [currency, setCurrency] = useState<'usd' | 'gs'>(
		props.mode === 'edit' ? props.initialValues.currency : 'gs',
	)
	const [amount, setAmount] = useState(
		props.mode === 'edit' ? props.initialValues.amount.toString() : '',
	)
	const [notes, setNotes] = useState(
		props.mode === 'edit' ? props.initialValues.notes : '',
	)
	const [error, setError] = useState<string | null>(null)
	const [isPending, startTransition] = useTransition()

	const isValid =
		Number(amount) > 0 &&
		essentialityId !== null &&
		(props.mode === 'edit' || categoryId !== '')

	function handleSubmit() {
		if (!isValid) {
			setError('Completá todos los campos antes de guardar.')
			return
		}
		setError(null)
		startTransition(async () => {
			let result: { error: string } | undefined
			if (props.mode === 'create') {
				result = await props.onSubmit({
					month,
					categoryId: categoryId as number,
					essentialityId: essentialityId as number,
					currency,
					amount: Number(amount),
					notes: notes.trim() || undefined,
				})
			} else {
				result = await props.onSubmit({
					essentialityId: essentialityId as number,
					currency,
					amount: Number(amount),
					notes: notes.trim() || undefined,
				})
			}
			if (result?.error) setError(result.error)
		})
	}

	return (
		<div className="space-y-5 pb-6">
			{/* ── Monto ── */}
			<div className="rounded-2xl border border-border bg-card p-4">
				<div className="flex items-center justify-between">
					<span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
						Monto presupuestado
					</span>
					<div className="flex items-center gap-1 rounded-full bg-secondary p-1">
						{(['usd', 'gs'] as const).map((c) => (
							<button
								key={c}
								type="button"
								onClick={() => setCurrency(c)}
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
						type="number"
						value={amount}
						onChange={(e) => setAmount(e.target.value)}
						placeholder="0"
						min="0"
						step={currency === 'gs' ? '1000' : '1'}
						className="w-full bg-transparent text-4xl font-bold text-foreground outline-none placeholder:text-muted-foreground/40 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
					/>
				</div>
			</div>

			{/* ── Mes — solo en create ── */}
			{props.mode === 'create' && (
				<div className="space-y-2">
					<label
						htmlFor="budget-month"
						className="text-sm font-semibold text-foreground"
					>
						Mes
					</label>
					<input
						id="budget-month"
						type="month"
						value={month}
						onChange={(e) => setMonth(e.target.value)}
						className="w-full rounded-2xl border border-border bg-card px-4 py-3.5 text-sm text-foreground outline-none focus:border-primary/60 transition-colors [color-scheme:dark]"
					/>
				</div>
			)}

			{/* ── Categoría ── */}
			<div className="space-y-2">
				<label
					htmlFor="budget-category"
					className="text-sm font-semibold text-foreground"
				>
					Categoría
				</label>
				{props.mode === 'create' ? (
					<div className="relative">
						<select
							id="budget-category"
							value={categoryId}
							onChange={(e) =>
								setCategoryId(
									e.target.value === '' ? '' : Number(e.target.value),
								)
							}
							className="w-full appearance-none rounded-2xl border border-border bg-card px-4 py-3.5 text-sm text-foreground outline-none focus:border-primary/60 transition-colors"
						>
							<option value="" disabled>
								Seleccionar categoría
							</option>
							{props.categories.map((cat) => (
								<option key={cat.id} value={cat.id}>
									{cat.label}
								</option>
							))}
						</select>
						<div
							aria-hidden="true"
							className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground"
						>
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
				) : (
					<div className="relative">
						<input
							id="budget-category"
							type="text"
							value={props.categoryLabel}
							disabled
							className="w-full rounded-2xl border border-border bg-card/40 px-4 py-3.5 pr-12 text-sm text-muted-foreground outline-none"
						/>
						<Lock className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/50" />
					</div>
				)}
			</div>

			{/* ── Prioridad ── */}
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

			{/* ── Notas ── */}
			<div className="space-y-2">
				<label
					htmlFor="budget-notes"
					className="text-sm font-semibold text-foreground"
				>
					Notas{' '}
					<span className="font-normal text-muted-foreground">(Opcional)</span>
				</label>
				<textarea
					id="budget-notes"
					value={notes}
					onChange={(e) => setNotes(e.target.value)}
					placeholder="Detalles del presupuesto..."
					rows={2}
					className="w-full resize-none rounded-2xl border border-border bg-card px-4 py-3.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/60 transition-colors"
				/>
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
				disabled={isPending}
				className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 text-base font-bold text-primary-foreground transition-opacity disabled:opacity-60"
			>
				<CheckCircle2 className="h-5 w-5" />
				{isPending
					? 'Guardando...'
					: props.mode === 'create'
						? 'Crear presupuesto'
						: 'Actualizar'}
			</button>
		</div>
	)
}
