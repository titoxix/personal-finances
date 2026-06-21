'use client'

import { Check } from 'lucide-react'
import { useState, useTransition } from 'react'
import type {
	CreateSnapshotPayload,
	UpdateSnapshotPayload,
} from '@/app/(app)/snapshots/actions'
import type { MonthlySnapshot } from '@/domain/entities/monthly-snapshot'
import { calculateDerivedMetrics } from '@/domain/entities/monthly-snapshot'
import type { CreateSnapshotInvestmentInput } from '@/domain/entities/snapshot-investment'
import { formatAmountDisplay, parseAmountInput } from '@/lib/utils'
import { InvestmentList } from './InvestmentList'

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

function toMonthInputValue(date: Date): string {
	const y = date.getUTCFullYear()
	const m = String(date.getUTCMonth() + 1).padStart(2, '0')
	return `${y}-${m}`
}

function formatMonthLabel(date: Date): string {
	return `${MONTHS_ES[date.getUTCMonth()]} ${date.getUTCFullYear()}`
}

function numOpt(raw: string): number | undefined {
	return raw ? Number(raw) : undefined
}

function numOrNull(raw: string): number | null {
	return raw ? Number(raw) : null
}

function fmtUsd(v: number): string {
	return new Intl.NumberFormat('en-US', {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	}).format(v)
}

type NewProps = {
	mode: 'create'
	onSubmit: (
		payload: CreateSnapshotPayload,
	) => Promise<{ error: string } | undefined>
	previousTotalInvestedUsd?: number | null
	initialValues?: MonthlySnapshot
}

type EditProps = {
	mode: 'edit'
	onSubmit: (
		payload: UpdateSnapshotPayload,
	) => Promise<{ error: string } | undefined>
	initialValues: MonthlySnapshot
	previousTotalInvestedUsd?: number | null
}

type Props = NewProps | EditProps

function FormSection({
	title,
	children,
}: {
	title: string
	children: React.ReactNode
}) {
	return (
		<div className="rounded-2xl border border-border bg-card overflow-hidden">
			<div className="px-4 pt-3.5 pb-3 border-b border-border/50">
				<p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
					{title}
				</p>
			</div>
			<div className="px-4 py-4 space-y-4">{children}</div>
		</div>
	)
}

function FieldRow({
	id,
	label,
	value,
	onChange,
	placeholder,
	decimal,
	pct,
	hint,
}: {
	id: string
	label: string
	value: string
	onChange: (v: string) => void
	placeholder: string
	decimal?: boolean
	pct?: boolean
	hint?: string
}) {
	return (
		<div className="space-y-1.5">
			<label htmlFor={id} className="text-sm font-semibold text-foreground">
				{label}{' '}
				<span className="font-normal text-muted-foreground">(Opcional)</span>
			</label>
			<input
				id={id}
				type="text"
				inputMode={pct || decimal ? 'decimal' : 'numeric'}
				value={pct ? value : formatAmountDisplay(value, decimal)}
				onChange={(e) =>
					onChange(
						pct ? e.target.value : parseAmountInput(e.target.value, decimal),
					)
				}
				placeholder={placeholder}
				className="w-full rounded-2xl border border-border bg-input px-4 py-3.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/60 transition-colors"
			/>
			{hint && <p className="text-xs text-primary/80">{hint}</p>}
		</div>
	)
}

function MetricRow({
	label,
	value,
	isUsd,
	isPct,
}: {
	label: string
	value: number | null
	isUsd?: boolean
	isPct?: boolean
}) {
	let display = '—'
	if (value !== null) {
		if (isUsd) display = `$${fmtUsd(value)}`
		else if (isPct) display = `${value.toFixed(2)}%`
	}
	return (
		<div className="flex items-center justify-between text-sm">
			<span className="text-muted-foreground">{label}</span>
			<span className="font-semibold tabular-nums text-foreground">
				{display}
			</span>
		</div>
	)
}

export function MonthlySnapshotForm(props: Props) {
	const { mode } = props
	const iv =
		mode === 'edit' ? props.initialValues : (props.initialValues ?? undefined)
	const previousTotalInvestedUsd = props.previousTotalInvestedUsd ?? null

	const [month, setMonth] = useState(iv ? toMonthInputValue(iv.month) : '')

	// Ingresos y cambio
	const [incomeUsd, setIncomeUsd] = useState(iv?.incomeUsd?.toString() ?? '')
	const [exchangeRateValue, setExchangeRateValue] = useState(
		iv?.exchangeRateValue?.toString() ?? '',
	)

	// Saldos bancarios
	const [balanceItauUsd, setBalanceItauUsd] = useState(
		iv?.balanceItauUsd?.toString() ?? '',
	)
	const [balanceItauGs, setBalanceItauGs] = useState(
		iv?.balanceItauGs?.toString() ?? '',
	)
	const [balanceUenoUsd, setBalanceUenoUsd] = useState(
		iv?.balanceUenoUsd?.toString() ?? '',
	)
	const [balanceUenoGs, setBalanceUenoGs] = useState(
		iv?.balanceUenoGs?.toString() ?? '',
	)
	const [balanceMangoGs, setBalanceMangoGs] = useState(
		iv?.balanceMangoGs?.toString() ?? '',
	)
	const [balanceGnbGs, setBalanceGnbGs] = useState(
		iv?.balanceGnbGs?.toString() ?? '',
	)

	// Deudas de tarjetas
	const [itauCardGs, setItauCardGs] = useState(iv?.itauCardGs?.toString() ?? '')
	const [uenoCardGs, setUenoCardGs] = useState(iv?.uenoCardGs?.toString() ?? '')
	const [gnbCardGs, setGnbCardGs] = useState(iv?.gnbCardGs?.toString() ?? '')
	const [pendingInstallmentsGs, setPendingInstallmentsGs] = useState(
		iv?.pendingInstallmentsGs?.toString() ?? '',
	)

	// Inversiones
	const [investments, setInvestments] = useState<
		CreateSnapshotInvestmentInput[]
	>(
		iv?.investments.map(({ name, currency, value, returnPct }) => ({
			name,
			currency,
			value,
			...(returnPct != null && { returnPct }),
		})) ?? [],
	)

	// Notas
	const [notes, setNotes] = useState(iv?.notes ?? '')

	const [error, setError] = useState<string | null>(null)
	const [isPending, startTransition] = useTransition()

	// Métricas calculadas en tiempo real
	const rate = numOpt(exchangeRateValue) ?? 0
	const currentTotalInvestedUsd = investments.reduce((sum, inv) => {
		if (inv.currency === 'USD') return sum + inv.value
		return rate > 0 ? sum + inv.value / rate : sum
	}, 0)

	const derived = calculateDerivedMetrics(
		{
			incomeUsd: numOpt(incomeUsd),
			exchangeRateValue: numOpt(exchangeRateValue),
			balanceItauUsd: numOpt(balanceItauUsd),
			balanceItauGs: numOpt(balanceItauGs),
			balanceUenoUsd: numOpt(balanceUenoUsd),
			balanceUenoGs: numOpt(balanceUenoGs),
			balanceMangoGs: numOpt(balanceMangoGs),
			balanceGnbGs: numOpt(balanceGnbGs),
			gnbCardGs: numOpt(gnbCardGs),
			itauCardGs: numOpt(itauCardGs),
			uenoCardGs: numOpt(uenoCardGs),
			pendingInstallmentsGs: numOpt(pendingInstallmentsGs),
		},
		previousTotalInvestedUsd,
		currentTotalInvestedUsd,
	)

	const isValid = mode === 'create' ? month !== '' : true

	function handleSubmit() {
		if (!isValid) {
			setError('Seleccioná el mes del snapshot.')
			return
		}
		setError(null)
		startTransition(async () => {
			let result: { error: string } | undefined

			if (mode === 'create') {
				result = await props.onSubmit({
					month: new Date(`${month}-01T00:00:00Z`),
					incomeUsd: numOpt(incomeUsd),
					exchangeRateValue: numOpt(exchangeRateValue),
					balanceItauUsd: numOpt(balanceItauUsd),
					balanceItauGs: numOpt(balanceItauGs),
					balanceUenoUsd: numOpt(balanceUenoUsd),
					balanceUenoGs: numOpt(balanceUenoGs),
					balanceMangoGs: numOpt(balanceMangoGs),
					balanceGnbGs: numOpt(balanceGnbGs),
					itauCardGs: numOpt(itauCardGs),
					uenoCardGs: numOpt(uenoCardGs),
					gnbCardGs: numOpt(gnbCardGs),
					pendingInstallmentsGs: numOpt(pendingInstallmentsGs),
					investments: investments.length > 0 ? investments : undefined,
					notes: notes.trim() || undefined,
				})
			} else {
				result = await props.onSubmit({
					incomeUsd: numOrNull(incomeUsd),
					exchangeRateValue: numOrNull(exchangeRateValue),
					balanceItauUsd: numOrNull(balanceItauUsd),
					balanceItauGs: numOrNull(balanceItauGs),
					balanceUenoUsd: numOrNull(balanceUenoUsd),
					balanceUenoGs: numOrNull(balanceUenoGs),
					balanceMangoGs: numOrNull(balanceMangoGs),
					balanceGnbGs: numOrNull(balanceGnbGs),
					itauCardGs: numOrNull(itauCardGs),
					uenoCardGs: numOrNull(uenoCardGs),
					gnbCardGs: numOrNull(gnbCardGs),
					pendingInstallmentsGs: numOrNull(pendingInstallmentsGs),
					investments: investments,
					notes: notes.trim() || null,
				})
			}

			if (result?.error) setError(result.error)
		})
	}

	return (
		<div className="space-y-4 pb-6">
			{/* Mes */}
			<FormSection title="Mes">
				{mode === 'create' ? (
					<div className="space-y-1.5">
						<label
							htmlFor="snap-month"
							className="text-sm font-semibold text-foreground"
						>
							Mes <span className="text-primary">*</span>
						</label>
						<input
							id="snap-month"
							type="month"
							value={month}
							onChange={(e) => setMonth(e.target.value)}
							className="w-full rounded-2xl border border-border bg-input px-4 py-3.5 text-sm text-foreground outline-none focus:border-primary/60 transition-colors"
						/>
					</div>
				) : (
					<p className="text-sm font-semibold text-foreground">
						{iv?.month ? formatMonthLabel(iv.month) : '—'}
					</p>
				)}
			</FormSection>

			{/* Ingresos y tipo de cambio */}
			<FormSection title="Ingresos y tipo de cambio">
				<FieldRow
					id="snap-income-usd"
					label="Ingreso del mes (USD)"
					value={incomeUsd}
					onChange={setIncomeUsd}
					placeholder="0.00"
					decimal
				/>
				<FieldRow
					id="snap-exchange-rate"
					label="Tipo de cambio (Gs/USD)"
					value={exchangeRateValue}
					onChange={setExchangeRateValue}
					placeholder="0"
					hint="Usá el tipo de cambio de referencia oficial del Banco Central (BCP)"
				/>
			</FormSection>

			{/* Saldos bancarios */}
			<FormSection title="Saldos bancarios">
				<FieldRow
					id="snap-itau-usd"
					label="Itaú (USD)"
					value={balanceItauUsd}
					onChange={setBalanceItauUsd}
					placeholder="0.00"
					decimal
				/>
				<FieldRow
					id="snap-itau-gs"
					label="Itaú (Gs)"
					value={balanceItauGs}
					onChange={setBalanceItauGs}
					placeholder="0"
				/>
				<FieldRow
					id="snap-ueno-usd"
					label="Ueno (USD)"
					value={balanceUenoUsd}
					onChange={setBalanceUenoUsd}
					placeholder="0.00"
					decimal
				/>
				<FieldRow
					id="snap-ueno-gs"
					label="Ueno (Gs)"
					value={balanceUenoGs}
					onChange={setBalanceUenoGs}
					placeholder="0"
				/>
				<FieldRow
					id="snap-mango-gs"
					label="Mango (Gs)"
					value={balanceMangoGs}
					onChange={setBalanceMangoGs}
					placeholder="0"
				/>
				<FieldRow
					id="snap-gnb-gs"
					label="GNB (Gs)"
					value={balanceGnbGs}
					onChange={setBalanceGnbGs}
					placeholder="0"
				/>
			</FormSection>

			{/* Deudas de tarjetas */}
			<FormSection title="Deudas de tarjetas">
				<FieldRow
					id="snap-itau-card-gs"
					label="Tarjeta Itaú (Gs)"
					value={itauCardGs}
					onChange={setItauCardGs}
					placeholder="0"
				/>
				<FieldRow
					id="snap-ueno-card-gs"
					label="Tarjeta Ueno (Gs)"
					value={uenoCardGs}
					onChange={setUenoCardGs}
					placeholder="0"
				/>
				<FieldRow
					id="snap-gnb-card-gs"
					label="Tarjeta GNB (Gs)"
					value={gnbCardGs}
					onChange={setGnbCardGs}
					placeholder="0"
				/>
				<FieldRow
					id="snap-pending-installments-gs"
					label="Cuotas pendientes (Gs)"
					value={pendingInstallmentsGs}
					onChange={setPendingInstallmentsGs}
					placeholder="0"
				/>
			</FormSection>

			{/* Inversiones */}
			<FormSection title="Inversiones">
				<InvestmentList value={investments} onChange={setInvestments} />
			</FormSection>

			{/* Métricas calculadas */}
			<FormSection title="Métricas">
				<div className="space-y-3">
					<p className="text-xs text-muted-foreground">
						Calculadas automáticamente a partir de los datos ingresados
					</p>
					{!exchangeRateValue && (
						<p className="text-xs text-muted-foreground/60 italic">
							Ingresá el tipo de cambio para ver los valores
						</p>
					)}
					<MetricRow
						label="Net worth (USD)"
						value={derived.netWorthUsd}
						isUsd
					/>
					<MetricRow
						label="Total invertido (USD)"
						value={derived.totalInvestedUsd}
						isUsd
					/>
					<MetricRow
						label="Deuda total (USD)"
						value={derived.totalDebtUsd}
						isUsd
					/>
					<MetricRow
						label="Tasa de ahorro"
						value={derived.savingsRatePct}
						isPct
					/>
				</div>
			</FormSection>

			{/* Notas */}
			<FormSection title="Notas">
				<div className="space-y-1.5">
					<label
						htmlFor="snap-notes"
						className="text-sm font-semibold text-foreground"
					>
						Notas{' '}
						<span className="font-normal text-muted-foreground">
							(Opcional)
						</span>
					</label>
					<textarea
						id="snap-notes"
						value={notes}
						onChange={(e) => setNotes(e.target.value)}
						placeholder="Contexto del mes, eventos relevantes..."
						rows={3}
						className="w-full resize-none rounded-2xl border border-border bg-input px-4 py-3.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/60 transition-colors"
					/>
				</div>
			</FormSection>

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
		</div>
	)
}
