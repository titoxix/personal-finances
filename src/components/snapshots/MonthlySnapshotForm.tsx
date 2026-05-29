'use client'

import { Check } from 'lucide-react'
import { useState, useTransition } from 'react'
import type {
	CreateSnapshotPayload,
	UpdateSnapshotPayload,
} from '@/app/(app)/snapshots/actions'
import type { MonthlySnapshot } from '@/domain/entities/monthly-snapshot'
import { formatAmountDisplay, parseAmountInput } from '@/lib/utils'

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

type NewProps = {
	mode: 'create'
	onSubmit: (
		payload: CreateSnapshotPayload,
	) => Promise<{ error: string } | undefined>
}

type EditProps = {
	mode: 'edit'
	onSubmit: (
		payload: UpdateSnapshotPayload,
	) => Promise<{ error: string } | undefined>
	initialValues: MonthlySnapshot
}

type Props = NewProps | EditProps

function SectionHeader({ label }: { label: string }) {
	return (
		<p className="pt-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
			{label}
		</p>
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
}: {
	id: string
	label: string
	value: string
	onChange: (v: string) => void
	placeholder: string
	decimal?: boolean
	pct?: boolean
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
				className="w-full rounded-2xl border border-border bg-card px-4 py-3.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/60 transition-colors"
			/>
		</div>
	)
}

export function MonthlySnapshotForm(props: Props) {
	const { mode } = props
	const iv = mode === 'edit' ? props.initialValues : undefined

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
	const [investorFundUsd, setInvestorFundUsd] = useState(
		iv?.investorFundUsd?.toString() ?? '',
	)
	const [investorFundGs, setInvestorFundGs] = useState(
		iv?.investorFundGs?.toString() ?? '',
	)
	const [investorReturnPct, setInvestorReturnPct] = useState(
		iv?.investorReturnPct?.toString() ?? '',
	)
	const [etfPortfolioUsd, setEtfPortfolioUsd] = useState(
		iv?.etfPortfolioUsd?.toString() ?? '',
	)
	const [etfReturnPct, setEtfReturnPct] = useState(
		iv?.etfReturnPct?.toString() ?? '',
	)

	// Métricas
	const [netWorthUsd, setNetWorthUsd] = useState(
		iv?.netWorthUsd?.toString() ?? '',
	)
	const [totalInvestedUsd, setTotalInvestedUsd] = useState(
		iv?.totalInvestedUsd?.toString() ?? '',
	)
	const [totalDebtUsd, setTotalDebtUsd] = useState(
		iv?.totalDebtUsd?.toString() ?? '',
	)
	const [savingsRatePct, setSavingsRatePct] = useState(
		iv?.savingsRatePct?.toString() ?? '',
	)

	// Notas
	const [notes, setNotes] = useState(iv?.notes ?? '')

	const [error, setError] = useState<string | null>(null)
	const [isPending, startTransition] = useTransition()

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
					investorFundUsd: numOpt(investorFundUsd),
					investorFundGs: numOpt(investorFundGs),
					investorReturnPct: numOpt(investorReturnPct),
					etfPortfolioUsd: numOpt(etfPortfolioUsd),
					etfReturnPct: numOpt(etfReturnPct),
					netWorthUsd: numOpt(netWorthUsd),
					totalInvestedUsd: numOpt(totalInvestedUsd),
					totalDebtUsd: numOpt(totalDebtUsd),
					savingsRatePct: numOpt(savingsRatePct),
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
					investorFundUsd: numOrNull(investorFundUsd),
					investorFundGs: numOrNull(investorFundGs),
					investorReturnPct: numOrNull(investorReturnPct),
					etfPortfolioUsd: numOrNull(etfPortfolioUsd),
					etfReturnPct: numOrNull(etfReturnPct),
					netWorthUsd: numOrNull(netWorthUsd),
					totalInvestedUsd: numOrNull(totalInvestedUsd),
					totalDebtUsd: numOrNull(totalDebtUsd),
					savingsRatePct: numOrNull(savingsRatePct),
					notes: notes.trim() || null,
				})
			}

			if (result?.error) setError(result.error)
		})
	}

	return (
		<div className="space-y-4 pb-6">
			{/* Mes */}
			<SectionHeader label="Mes" />
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
						className="w-full rounded-2xl border border-border bg-card px-4 py-3.5 text-sm text-foreground outline-none focus:border-primary/60 transition-colors"
					/>
				</div>
			) : (
				<div className="rounded-2xl border border-border bg-card px-4 py-3.5 text-sm font-semibold text-foreground">
					{iv?.month ? formatMonthLabel(iv.month) : '—'}
				</div>
			)}

			{/* Ingresos y tipo de cambio */}
			<SectionHeader label="Ingresos y tipo de cambio" />
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
			/>

			{/* Saldos bancarios */}
			<SectionHeader label="Saldos bancarios" />
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

			{/* Deudas de tarjetas */}
			<SectionHeader label="Deudas de tarjetas" />
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

			{/* Inversiones */}
			<SectionHeader label="Inversiones" />
			<FieldRow
				id="snap-investor-fund-usd"
				label="Fondo de inversión (USD)"
				value={investorFundUsd}
				onChange={setInvestorFundUsd}
				placeholder="0.00"
				decimal
			/>
			<FieldRow
				id="snap-investor-fund-gs"
				label="Fondo de inversión (Gs)"
				value={investorFundGs}
				onChange={setInvestorFundGs}
				placeholder="0"
			/>
			<FieldRow
				id="snap-investor-return-pct"
				label="Rendimiento fondo (%)"
				value={investorReturnPct}
				onChange={setInvestorReturnPct}
				placeholder="0.00"
				pct
			/>
			<FieldRow
				id="snap-etf-usd"
				label="Portafolio ETF (USD)"
				value={etfPortfolioUsd}
				onChange={setEtfPortfolioUsd}
				placeholder="0.00"
				decimal
			/>
			<FieldRow
				id="snap-etf-return-pct"
				label="Rendimiento ETF (%)"
				value={etfReturnPct}
				onChange={setEtfReturnPct}
				placeholder="0.00"
				pct
			/>

			{/* Métricas */}
			<SectionHeader label="Métricas" />
			<FieldRow
				id="snap-net-worth-usd"
				label="Net worth (USD)"
				value={netWorthUsd}
				onChange={setNetWorthUsd}
				placeholder="0.00"
				decimal
			/>
			<FieldRow
				id="snap-total-invested-usd"
				label="Total invertido (USD)"
				value={totalInvestedUsd}
				onChange={setTotalInvestedUsd}
				placeholder="0.00"
				decimal
			/>
			<FieldRow
				id="snap-total-debt-usd"
				label="Deuda total (USD)"
				value={totalDebtUsd}
				onChange={setTotalDebtUsd}
				placeholder="0.00"
				decimal
			/>
			<FieldRow
				id="snap-savings-rate-pct"
				label="Tasa de ahorro (%)"
				value={savingsRatePct}
				onChange={setSavingsRatePct}
				placeholder="0.00"
				pct
			/>

			{/* Notas */}
			<SectionHeader label="Notas" />
			<div className="space-y-1.5">
				<label
					htmlFor="snap-notes"
					className="text-sm font-semibold text-foreground"
				>
					Notas{' '}
					<span className="font-normal text-muted-foreground">(Opcional)</span>
				</label>
				<textarea
					id="snap-notes"
					value={notes}
					onChange={(e) => setNotes(e.target.value)}
					placeholder="Contexto del mes, eventos relevantes..."
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
		</div>
	)
}
