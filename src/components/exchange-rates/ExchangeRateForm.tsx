'use client'

import { Check, Trash2 } from 'lucide-react'
import { useState, useTransition } from 'react'
import type {
	CreateExchangeRatesPayload,
	UpdateExchangeRatePayload,
} from '@/app/(app)/exchange-rates/actions'
import type { ExchangeRate } from '@/domain/entities/exchange-rate'
import { formatAmountDisplay, parseAmountInput } from '@/lib/utils'

type CreateProps = {
	mode?: 'create'
	onSubmit: (
		payload: CreateExchangeRatesPayload,
	) => Promise<{ error: string } | undefined>
}

type EditProps = {
	mode: 'edit'
	initialValues: ExchangeRate
	onSubmit: (
		payload: UpdateExchangeRatePayload,
	) => Promise<{ error: string } | undefined>
	onDelete: () => Promise<{ error: string } | undefined>
}

type Props = CreateProps | EditProps

function nowDatetimeLocal(): string {
	return new Date().toISOString().slice(0, 16)
}

function toDatetimeLocal(d: Date): string {
	return d.toISOString().slice(0, 16)
}

function parseRate(value: string): number | null {
	const n = Number.parseFloat(value.replace(/\./g, ''))
	return Number.isFinite(n) && n > 0 ? n : null
}

const SOURCE_LABEL: Record<string, string> = {
	itau: 'Itaú',
	ueno: 'Ueno',
	bcp: 'BCP',
}

export function ExchangeRateForm(props: Props) {
	const isEdit = props.mode === 'edit'
	const iv = isEdit ? props.initialValues : undefined

	// Create-only state
	const [itauBuy, setItauBuy] = useState('')
	const [itauSell, setItauSell] = useState('')
	const [uenoBuy, setUenoBuy] = useState('')
	const [uenoBell, setUenoBell] = useState('')
	const [bcpMid, setBcpMid] = useState('')

	// Edit-only state (single rate fields)
	const [buyValue, setBuyValue] = useState(iv?.rateBuy?.toString() ?? '')
	const [sellValue, setSellValue] = useState(iv?.rateSell?.toString() ?? '')
	const [midValue, setMidValue] = useState(iv?.rateMid?.toString() ?? '')

	// Shared state
	const [notes, setNotes] = useState(iv?.notes ?? '')
	const [recordedAt, setRecordedAt] = useState(
		iv ? toDatetimeLocal(iv.recordedAt) : nowDatetimeLocal(),
	)
	const [error, setError] = useState<string | null>(null)
	const [isPending, startTransition] = useTransition()
	const [isDeleting, startDeleteTransition] = useTransition()

	function handleSubmit() {
		setError(null)

		if (isEdit) {
			const source = props.initialValues.source
			if (
				source !== 'bcp' &&
				parseRate(buyValue) == null &&
				parseRate(sellValue) == null
			) {
				setError(`${SOURCE_LABEL[source]} requiere al menos Compra o Venta.`)
				return
			}
			if (source === 'bcp' && parseRate(midValue) == null) {
				setError('BCP requiere la tasa media.')
				return
			}
			startTransition(async () => {
				const result = await props.onSubmit({
					rateBuy: source !== 'bcp' ? parseRate(buyValue) : null,
					rateSell: source !== 'bcp' ? parseRate(sellValue) : null,
					rateMid: source === 'bcp' ? parseRate(midValue) : null,
					notes,
					recordedAt,
				})
				if (result?.error) setError(result.error)
			})
			return
		}

		// Create mode
		const itauValid = parseRate(itauBuy) != null || parseRate(itauSell) != null
		const uenoValid = parseRate(uenoBuy) != null || parseRate(uenoBell) != null
		if (!itauValid) {
			setError('Itaú requiere al menos Compra o Venta.')
			return
		}
		if (!uenoValid) {
			setError('Ueno requiere al menos Compra o Venta.')
			return
		}

		startTransition(async () => {
			const result = await props.onSubmit({
				itau: { rateBuy: parseRate(itauBuy), rateSell: parseRate(itauSell) },
				ueno: { rateBuy: parseRate(uenoBuy), rateSell: parseRate(uenoBell) },
				bcp: { rateMid: parseRate(bcpMid) },
				notes,
				recordedAt,
			})
			if (result?.error) setError(result.error)
		})
	}

	function handleDelete() {
		if (!isEdit) return
		startDeleteTransition(async () => {
			const result = await props.onDelete()
			if (result?.error) setError(result.error)
		})
	}

	return (
		<div className="space-y-5 pb-6">
			{/* ── Rate fields ── */}
			{isEdit ? (
				<EditRateFields
					source={props.initialValues.source}
					buyValue={buyValue}
					sellValue={sellValue}
					midValue={midValue}
					onBuyChange={setBuyValue}
					onSellChange={setSellValue}
					onMidChange={setMidValue}
				/>
			) : (
				<>
					<BankSection
						name="Itaú"
						idPrefix="itau"
						required
						buyValue={formatAmountDisplay(itauBuy)}
						sellValue={formatAmountDisplay(itauSell)}
						onBuyChange={(v) => setItauBuy(parseAmountInput(v))}
						onSellChange={(v) => setItauSell(parseAmountInput(v))}
					/>
					<BankSection
						name="Ueno"
						idPrefix="ueno"
						required
						buyValue={formatAmountDisplay(uenoBuy)}
						sellValue={formatAmountDisplay(uenoBell)}
						onBuyChange={(v) => setUenoBuy(parseAmountInput(v))}
						onSellChange={(v) => setUenoBell(parseAmountInput(v))}
					/>
					<div className="space-y-2">
						<p className="text-sm font-semibold text-foreground">
							BCP{' '}
							<span className="font-normal text-muted-foreground">
								(Opcional)
							</span>
						</p>
						<div className="rounded-2xl border border-border bg-card p-4">
							<label
								htmlFor="bcp-mid"
								className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground"
							>
								Tasa media
							</label>
							<input
								id="bcp-mid"
								type="text"
								inputMode="numeric"
								value={formatAmountDisplay(bcpMid)}
								onChange={(e) => setBcpMid(parseAmountInput(e.target.value))}
								placeholder="5.985"
								className="w-full bg-transparent font-mono text-xl font-bold text-foreground outline-none placeholder:text-muted-foreground/40"
							/>
						</div>
					</div>
				</>
			)}

			{/* ── Fecha y hora ── */}
			<div className="space-y-2">
				<label
					htmlFor="recorded-at"
					className="text-sm font-semibold text-foreground"
				>
					Fecha y hora
				</label>
				<input
					id="recorded-at"
					type="datetime-local"
					value={recordedAt}
					onChange={(e) => setRecordedAt(e.target.value)}
					className="w-full rounded-2xl border border-border bg-card px-4 py-3.5 text-sm text-foreground outline-none transition-colors focus:border-primary/60 [color-scheme:dark]"
				/>
			</div>

			{/* ── Notas ── */}
			<div className="space-y-2">
				<label
					htmlFor="rate-notes"
					className="text-sm font-semibold text-foreground"
				>
					Notas{' '}
					<span className="font-normal text-muted-foreground">(Opcional)</span>
				</label>
				<input
					id="rate-notes"
					type="text"
					value={notes}
					onChange={(e) => setNotes(e.target.value)}
					placeholder="ej. Tasas del cierre de mes"
					className="w-full rounded-2xl border border-border bg-card px-4 py-3.5 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-colors focus:border-primary/60"
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
				disabled={isPending || isDeleting}
				className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 text-base font-bold text-primary-foreground transition-opacity disabled:opacity-60"
			>
				<Check className="h-5 w-5" />
				{isPending ? 'Guardando...' : isEdit ? 'Actualizar' : 'Guardar'}
			</button>

			{/* ── Delete (edit only) ── */}
			{isEdit && (
				<button
					type="button"
					onClick={handleDelete}
					disabled={isPending || isDeleting}
					className="flex w-full items-center justify-center gap-2 rounded-2xl border border-destructive/40 py-3.5 text-sm font-semibold text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-60"
				>
					<Trash2 className="h-4 w-4" />
					{isDeleting ? 'Eliminando...' : 'Eliminar tasa'}
				</button>
			)}
		</div>
	)
}

// ─── Edit mode: single-source fields ─────────────────────────────────────────

function EditRateFields({
	source,
	buyValue,
	sellValue,
	midValue,
	onBuyChange,
	onSellChange,
	onMidChange,
}: {
	source: string
	buyValue: string
	sellValue: string
	midValue: string
	onBuyChange: (v: string) => void
	onSellChange: (v: string) => void
	onMidChange: (v: string) => void
}) {
	if (source === 'bcp') {
		return (
			<div className="space-y-2">
				<p className="text-sm font-semibold text-foreground">BCP</p>
				<div className="rounded-2xl border border-border bg-card p-4">
					<label
						htmlFor="edit-mid"
						className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground"
					>
						Tasa media
					</label>
					<input
						id="edit-mid"
						type="text"
						inputMode="numeric"
						value={formatAmountDisplay(midValue)}
						onChange={(e) => onMidChange(parseAmountInput(e.target.value))}
						placeholder="5.985"
						className="w-full bg-transparent font-mono text-xl font-bold text-foreground outline-none placeholder:text-muted-foreground/40"
					/>
				</div>
			</div>
		)
	}

	return (
		<BankSection
			name={SOURCE_LABEL[source] ?? source}
			idPrefix="edit"
			required
			buyValue={formatAmountDisplay(buyValue)}
			sellValue={formatAmountDisplay(sellValue)}
			onBuyChange={(v) => onBuyChange(parseAmountInput(v))}
			onSellChange={(v) => onSellChange(parseAmountInput(v))}
		/>
	)
}

// ─── Create mode: bank section ────────────────────────────────────────────────

function BankSection({
	name,
	idPrefix,
	required,
	buyValue,
	sellValue,
	onBuyChange,
	onSellChange,
}: {
	name: string
	idPrefix: string
	required?: boolean
	buyValue: string
	sellValue: string
	onBuyChange: (v: string) => void
	onSellChange: (v: string) => void
}) {
	const rawBuy = buyValue.replace(/\./g, '')
	const rawSell = sellValue.replace(/\./g, '')
	const spread = Number.parseFloat(rawSell) - Number.parseFloat(rawBuy)
	const showSpread = Number.isFinite(spread) && spread > 0

	return (
		<div className="space-y-2">
			<p className="text-sm font-semibold text-foreground">
				{name}
				{required && <span className="ml-1 text-primary">*</span>}
			</p>
			<div className="rounded-2xl border border-border bg-card p-4">
				<div className="grid grid-cols-2 gap-4">
					<div>
						<label
							htmlFor={`${idPrefix}-buy`}
							className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground"
						>
							Compra
						</label>
						<input
							id={`${idPrefix}-buy`}
							type="text"
							inputMode="numeric"
							value={buyValue}
							onChange={(e) => onBuyChange(e.target.value)}
							placeholder="5.900"
							className="w-full bg-transparent font-mono text-xl font-bold text-foreground outline-none placeholder:text-muted-foreground/40"
						/>
					</div>
					<div>
						<label
							htmlFor={`${idPrefix}-sell`}
							className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground"
						>
							Venta
						</label>
						<input
							id={`${idPrefix}-sell`}
							type="text"
							inputMode="numeric"
							value={sellValue}
							onChange={(e) => onSellChange(e.target.value)}
							placeholder="6.100"
							className="w-full bg-transparent font-mono text-xl font-bold text-foreground outline-none placeholder:text-muted-foreground/40"
						/>
					</div>
				</div>
				{showSpread && (
					<p className="mt-3 text-xs text-muted-foreground">
						Spread:{' '}
						<span className="font-mono font-semibold text-foreground">
							{Math.round(spread).toLocaleString('es-PY')}
						</span>{' '}
						Gs/USD
					</p>
				)}
			</div>
		</div>
	)
}
