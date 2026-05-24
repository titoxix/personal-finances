'use client'

import { Check } from 'lucide-react'
import { useState, useTransition } from 'react'
import type { CreateExchangeRatesPayload } from '@/app/(app)/exchange-rates/actions'

type Props = {
	onSubmit: (
		payload: CreateExchangeRatesPayload,
	) => Promise<{ error: string } | undefined>
}

function nowDatetimeLocal(): string {
	const now = new Date()
	return now.toISOString().slice(0, 16)
}

function parseRate(value: string): number | null {
	const n = Number.parseFloat(value)
	return Number.isFinite(n) && n > 0 ? n : null
}

export function ExchangeRateForm({ onSubmit }: Props) {
	const [itauBuy, setItauBuy] = useState('')
	const [itauSell, setItauSell] = useState('')
	const [uenoBuy, setUenoBuy] = useState('')
	const [uenoBell, setUenoBell] = useState('')
	const [bcpMid, setBcpMid] = useState('')
	const [notes, setNotes] = useState('')
	const [recordedAt, setRecordedAt] = useState(nowDatetimeLocal)
	const [error, setError] = useState<string | null>(null)
	const [isPending, startTransition] = useTransition()

	const itauValid = parseRate(itauBuy) != null || parseRate(itauSell) != null
	const uenoValid = parseRate(uenoBuy) != null || parseRate(uenoBell) != null

	function handleSubmit() {
		if (!itauValid) {
			setError('Itaú requiere al menos Compra o Venta.')
			return
		}
		if (!uenoValid) {
			setError('Ueno requiere al menos Compra o Venta.')
			return
		}
		setError(null)
		startTransition(async () => {
			const result = await onSubmit({
				itau: { rateBuy: parseRate(itauBuy), rateSell: parseRate(itauSell) },
				ueno: { rateBuy: parseRate(uenoBuy), rateSell: parseRate(uenoBell) },
				bcp: { rateMid: parseRate(bcpMid) },
				notes,
				recordedAt,
			})
			if (result?.error) setError(result.error)
		})
	}

	return (
		<div className="space-y-5 pb-6">
			<BankSection
				name="Itaú"
				idPrefix="itau"
				required
				buyValue={itauBuy}
				sellValue={itauSell}
				onBuyChange={setItauBuy}
				onSellChange={setItauSell}
			/>

			<BankSection
				name="Ueno"
				idPrefix="ueno"
				required
				buyValue={uenoBuy}
				sellValue={uenoBell}
				onBuyChange={setUenoBuy}
				onSellChange={setUenoBell}
			/>

			{/* BCP */}
			<div className="space-y-2">
				<p className="text-sm font-semibold text-foreground">
					BCP{' '}
					<span className="font-normal text-muted-foreground">(Opcional)</span>
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
						type="number"
						value={bcpMid}
						onChange={(e) => setBcpMid(e.target.value)}
						placeholder="5985"
						min="0"
						step="1"
						className="w-full bg-transparent font-mono text-xl font-bold text-foreground outline-none placeholder:text-muted-foreground/40 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
					/>
				</div>
			</div>

			{/* Fecha y hora */}
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

			{/* Notas */}
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

// ─── internal sub-component ───────────────────────────────────────────────────

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
	const spread = Number.parseFloat(sellValue) - Number.parseFloat(buyValue)
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
							type="number"
							value={buyValue}
							onChange={(e) => onBuyChange(e.target.value)}
							placeholder="5900"
							min="0"
							step="1"
							className="w-full bg-transparent font-mono text-xl font-bold text-foreground outline-none placeholder:text-muted-foreground/40 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
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
							type="number"
							value={sellValue}
							onChange={(e) => onSellChange(e.target.value)}
							placeholder="6100"
							min="0"
							step="1"
							className="w-full bg-transparent font-mono text-xl font-bold text-foreground outline-none placeholder:text-muted-foreground/40 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
						/>
					</div>
				</div>
				{showSpread && (
					<p className="mt-3 text-xs text-muted-foreground">
						Spread:{' '}
						<span className="font-mono font-semibold text-foreground">
							{Math.round(spread).toLocaleString('en-US')}
						</span>{' '}
						Gs/USD
					</p>
				)}
			</div>
		</div>
	)
}
