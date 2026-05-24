'use client'

import { useState, useTransition } from 'react'
import { CalendarDays, CheckCircle2, PlusCircle } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import type { Category } from '@/domain/entities/category'
import type { EssentialityLevel } from '@/domain/entities/essentiality-level'
import type { PaymentMethod } from '@/domain/entities/recurring-item'
import type { CreateTransactionPayload } from '@/app/(app)/transactions/actions'

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
	onSubmit: (payload: CreateTransactionPayload) => Promise<{ error: string } | void>
	initialValues?: CreateTransactionPayload
	onDelete?: () => Promise<{ error: string } | void>
}

function todayISO() {
	return new Date().toISOString().split('T')[0] as string
}

export function TransactionForm({
	categories,
	essentialityLevels,
	onSubmit,
	initialValues,
	onDelete,
}: Props) {
	const [currency, setCurrency] = useState<'gs' | 'usd'>(initialValues?.currency ?? 'gs')
	const [amount, setAmount] = useState(initialValues?.amount?.toString() ?? '')
	const [description, setDescription] = useState(initialValues?.description ?? '')
	const [categoryId, setCategoryId] = useState<number | ''>(initialValues?.categoryId ?? '')
	const [essentialityId, setEssentialityId] = useState<number | null>(
		initialValues?.essentialityId ?? null,
	)
	const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(
		initialValues?.paymentMethod ?? null,
	)
	const [date, setDate] = useState(initialValues?.date ?? todayISO())
	const [error, setError] = useState<string | null>(null)
	const [isPending, startTransition] = useTransition()
	const [isDeleting, startDeleteTransition] = useTransition()

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
						step={currency === 'gs' ? '1' : '0.01'}
						className="w-full bg-transparent text-4xl font-bold text-foreground outline-none placeholder:text-muted-foreground/40 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
					/>
				</div>
			</div>

			{/* ── Description ── */}
			<div className="space-y-2">
				<label className="text-sm font-semibold text-foreground">Descripción</label>
				<input
					type="text"
					value={description}
					onChange={(e) => setDescription(e.target.value)}
					placeholder="¿En qué gastaste?"
					className="w-full rounded-2xl border border-border bg-card px-4 py-3.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/60 transition-colors"
				/>
			</div>

			{/* ── Category ── */}
			<div className="space-y-2">
				<label className="text-sm font-semibold text-foreground">Categoría</label>
				<div className="relative">
					<select
						value={categoryId}
						onChange={(e) => setCategoryId(e.target.value === '' ? '' : Number(e.target.value))}
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
						<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
				<label className="text-sm font-semibold text-foreground">Prioridad</label>
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
				<label className="text-sm font-semibold text-foreground">Método de Pago</label>
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
				<label className="text-sm font-semibold text-foreground">Fecha</label>
				<div className="relative">
					<input
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
