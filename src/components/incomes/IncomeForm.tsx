'use client'

import { CheckCircle2, Lock, PlusCircle } from 'lucide-react'
import { parseAmountInput, formatAmountDisplay } from '@/lib/utils'
import Link from 'next/link'
import { useState, useTransition } from 'react'
import type {
	CreateIncomePayload,
	UpdateIncomePayload,
} from '@/app/(app)/incomes/actions'
import type { ExchangeRate } from '@/domain/entities/exchange-rate'

function currentMonthISO(): string {
	const now = new Date()
	return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

type CreateProps = {
	mode: 'create'
	latestRates?: ExchangeRate[]
	onSubmit: (
		payload: CreateIncomePayload,
	) => Promise<{ error: string } | undefined>
}

type EditProps = {
	mode: 'edit'
	monthLabel: string
	latestRates?: ExchangeRate[]
	initialValues: {
		grossIncomeUsd: number
		budgetCapUsd: number
		automaticInvestmentUsd: number
		automaticDest: string
		exchangeRate: number
		notes: string
	}
	onSubmit: (
		payload: UpdateIncomePayload,
	) => Promise<{ error: string } | undefined>
}

type Props = CreateProps | EditProps

const SOURCE_LABEL: Record<string, string> = {
	itau: 'Itaú',
	ueno: 'Ueno',
	bcp: 'BCP',
}

function fmtDate(date: Date | string): string {
	return new Date(date).toLocaleDateString('es-PY', {
		day: '2-digit',
		month: 'short',
		hour: '2-digit',
		minute: '2-digit',
	})
}

export function IncomeForm(props: Props) {
	const latestRates = props.latestRates ?? []

	// El mejor tipo de cambio es el que tiene mayor rateBuy (más Gs por USD al vender al banco)
	const bestRateId = latestRates.reduce<number | null>((bestId, rate) => {
		if (rate.rateBuy == null) return bestId
		if (bestId === null) return rate.id
		const best = latestRates.find((r) => r.id === bestId)
		return (rate.rateBuy ?? 0) > (best?.rateBuy ?? 0) ? rate.id : bestId
	}, null)

	const [month, setMonth] = useState(currentMonthISO())
	const [grossIncomeUsd, setGrossIncomeUsd] = useState(
		props.mode === 'edit' ? props.initialValues.grossIncomeUsd.toString() : '',
	)
	const [budgetCapUsd, setBudgetCapUsd] = useState(
		props.mode === 'edit' ? props.initialValues.budgetCapUsd.toString() : '',
	)
	const [automaticInvestmentUsd, setAutomaticInvestmentUsd] = useState(
		props.mode === 'edit'
			? props.initialValues.automaticInvestmentUsd.toString()
			: '',
	)
	const [automaticDest, setAutomaticDest] = useState(
		props.mode === 'edit' ? props.initialValues.automaticDest : '',
	)
	const [exchangeRate, setExchangeRate] = useState(
		props.mode === 'edit' ? props.initialValues.exchangeRate.toString() : '',
	)
	const [notes, setNotes] = useState(
		props.mode === 'edit' ? props.initialValues.notes : '',
	)
	const [error, setError] = useState<string | null>(null)
	const [isPending, startTransition] = useTransition()

	const isValid =
		Number(grossIncomeUsd) > 0 &&
		Number(budgetCapUsd) > 0 &&
		Number(automaticInvestmentUsd) >= 0 &&
		automaticDest.trim().length > 0 &&
		Number(exchangeRate) > 0

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
					grossIncomeUsd: Number(grossIncomeUsd),
					budgetCapUsd: Number(budgetCapUsd),
					automaticInvestmentUsd: Number(automaticInvestmentUsd),
					automaticDest: automaticDest.trim(),
					exchangeRate: Number(exchangeRate),
					notes: notes.trim() || undefined,
				})
			} else {
				result = await props.onSubmit({
					grossIncomeUsd: Number(grossIncomeUsd),
					budgetCapUsd: Number(budgetCapUsd),
					automaticInvestmentUsd: Number(automaticInvestmentUsd),
					automaticDest: automaticDest.trim(),
					exchangeRate: Number(exchangeRate),
					notes: notes.trim() || undefined,
				})
			}
			if (result?.error) setError(result.error)
		})
	}

	return (
		<div className="space-y-5 pb-6">
			{/* ── Mes ── */}
			<div className="space-y-2">
				<label
					htmlFor="income-month"
					className="text-sm font-semibold text-foreground"
				>
					Mes
				</label>
				{props.mode === 'create' ? (
					<input
						id="income-month"
						type="month"
						value={month}
						onChange={(e) => setMonth(e.target.value)}
						className="w-full rounded-2xl border border-border bg-card px-4 py-3.5 text-sm text-foreground outline-none focus:border-primary/60 transition-colors [color-scheme:dark]"
					/>
				) : (
					<div className="relative">
						<input
							id="income-month"
							type="text"
							value={props.monthLabel}
							disabled
							className="w-full rounded-2xl border border-border bg-card/40 px-4 py-3.5 pr-12 text-sm text-muted-foreground outline-none"
						/>
						<Lock className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/50" />
					</div>
				)}
			</div>

			{/* ── Ingreso bruto ── */}
			<div className="rounded-2xl border border-border bg-card p-4">
				<span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
					Ingreso bruto (USD)
				</span>
				<div className="mt-3 flex items-baseline gap-2">
					<span className="text-2xl font-bold text-muted-foreground">$</span>
					<input
						type="text"
						inputMode="decimal"
						value={formatAmountDisplay(grossIncomeUsd, true)}
						onChange={(e) => setGrossIncomeUsd(parseAmountInput(e.target.value, true))}
						placeholder="0"
						className="w-full bg-transparent text-4xl font-bold text-foreground outline-none placeholder:text-muted-foreground/40"
					/>
				</div>
			</div>

			{/* ── Cap de presupuesto ── */}
			<div className="space-y-2">
				<label
					htmlFor="income-budget-cap"
					className="text-sm font-semibold text-foreground"
				>
					Cap de presupuesto (USD)
				</label>
				<div className="flex items-center gap-2 rounded-2xl border border-border bg-card px-4 py-3.5">
					<span className="text-sm font-bold text-muted-foreground">$</span>
					<input
						id="income-budget-cap"
						type="text"
						inputMode="decimal"
						value={formatAmountDisplay(budgetCapUsd, true)}
						onChange={(e) => setBudgetCapUsd(parseAmountInput(e.target.value, true))}
						placeholder="0"
						className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/40"
					/>
				</div>
			</div>

			{/* ── Inversión automática ── */}
			<div className="space-y-2">
				<label
					htmlFor="income-auto-invest"
					className="text-sm font-semibold text-foreground"
				>
					Inversión automática (USD)
				</label>
				<div className="flex items-center gap-2 rounded-2xl border border-border bg-card px-4 py-3.5">
					<span className="text-sm font-bold text-muted-foreground">$</span>
					<input
						id="income-auto-invest"
						type="text"
						inputMode="decimal"
						value={formatAmountDisplay(automaticInvestmentUsd, true)}
						onChange={(e) => setAutomaticInvestmentUsd(parseAmountInput(e.target.value, true))}
						placeholder="0"
						className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/40"
					/>
				</div>
			</div>

			{/* ── Destino de inversión ── */}
			<div className="space-y-2">
				<label
					htmlFor="income-auto-dest"
					className="text-sm font-semibold text-foreground"
				>
					Destino de inversión automática
				</label>
				<input
					id="income-auto-dest"
					type="text"
					value={automaticDest}
					onChange={(e) => setAutomaticDest(e.target.value)}
					placeholder="ej. ETF, Fondo inversor..."
					className="w-full rounded-2xl border border-border bg-card px-4 py-3.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/60 transition-colors"
				/>
			</div>

			{/* ── Tipo de cambio ── */}
			<div className="space-y-2">
				<label
					htmlFor="income-exchange-rate"
					className="text-sm font-semibold text-foreground"
				>
					Tipo de cambio (₲ / USD)
				</label>
				<div className="flex items-center gap-2 rounded-2xl border border-border bg-card px-4 py-3.5">
					<span className="text-sm font-bold text-muted-foreground">₲</span>
					<input
						id="income-exchange-rate"
						type="text"
						inputMode="numeric"
						value={formatAmountDisplay(exchangeRate)}
						onChange={(e) => setExchangeRate(parseAmountInput(e.target.value))}
						placeholder="0"
						className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/40"
					/>
				</div>

				<Link
					href="/exchange-rates/new"
					className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
				>
					<PlusCircle className="h-3.5 w-3.5" />
					Cargar nuevo tipo de cambio
				</Link>

				{latestRates.length > 0 && (
					<div className="flex gap-2 pt-1">
						{latestRates.map((rate) => {
							const isBest = rate.id === bestRateId
							const displayRate = rate.rateBuy ?? rate.rateMid
							if (displayRate == null) return null
							const isSelected = exchangeRate === displayRate.toString()

							return (
								<button
									key={rate.id}
									type="button"
									onClick={() => setExchangeRate(displayRate.toString())}
									className={`flex flex-1 flex-col gap-0.5 rounded-xl border px-3 py-2 text-left transition-colors ${
										isSelected
											? 'border-primary/60 bg-primary/10'
											: 'border-border bg-card hover:bg-card/80'
									}`}
								>
									<div className="flex items-center gap-1.5">
										<span className="text-xs font-semibold text-foreground">
											{SOURCE_LABEL[rate.source] ?? rate.source}
										</span>
										{isBest && (
											<span className="rounded-full bg-primary/20 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-primary">
												Mejor
											</span>
										)}
									</div>
									<p className="font-mono text-sm font-bold text-foreground">
										₲ {displayRate.toLocaleString('es-PY')}
									</p>
									<p className="text-[10px] text-muted-foreground">
										{fmtDate(rate.recordedAt)}
									</p>
								</button>
							)
						})}
					</div>
				)}
			</div>

			{/* ── Notas ── */}
			<div className="space-y-2">
				<label
					htmlFor="income-notes"
					className="text-sm font-semibold text-foreground"
				>
					Notas{' '}
					<span className="font-normal text-muted-foreground">(Opcional)</span>
				</label>
				<textarea
					id="income-notes"
					value={notes}
					onChange={(e) => setNotes(e.target.value)}
					placeholder="Detalles del ingreso..."
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
						? 'Registrar ingreso'
						: 'Actualizar'}
			</button>
		</div>
	)
}
