'use client'

import { Plus, X } from 'lucide-react'
import { useState } from 'react'
import type { CreateSnapshotInvestmentInput } from '@/domain/entities/snapshot-investment'
import { formatAmountDisplay, parseAmountInput } from '@/lib/utils'

type Props = {
	value: CreateSnapshotInvestmentInput[]
	onChange: (investments: CreateSnapshotInvestmentInput[]) => void
}

export function InvestmentList({ value, onChange }: Props) {
	const [rawValues, setRawValues] = useState<string[]>(() =>
		value.map((inv) => (inv.value > 0 ? inv.value.toString() : '')),
	)
	const [rawReturns, setRawReturns] = useState<string[]>(() =>
		value.map((inv) => (inv.returnPct != null ? inv.returnPct.toString() : '')),
	)

	function updateRow(
		index: number,
		patch: Partial<CreateSnapshotInvestmentInput>,
	) {
		const next = value.map((row, i) =>
			i === index ? { ...row, ...patch } : row,
		)
		onChange(next)
	}

	function removeRow(index: number) {
		onChange(value.filter((_, i) => i !== index))
		setRawValues((prev) => prev.filter((_, i) => i !== index))
		setRawReturns((prev) => prev.filter((_, i) => i !== index))
	}

	function addRow() {
		onChange([...value, { name: '', currency: 'USD', value: 0 }])
		setRawValues((prev) => [...prev, ''])
		setRawReturns((prev) => [...prev, ''])
	}

	return (
		<div className="space-y-3">
			{value.length === 0 && (
				<p className="text-sm text-muted-foreground">
					Agregá tus fondos, ETFs y ahorros programados
				</p>
			)}
			{value.map((row, index) => {
				const isDecimal = row.currency === 'USD'
				const nameId = `inv-${index}-name`
				const currencyId = `inv-${index}-currency`
				const valueId = `inv-${index}-value`
				const returnPctId = `inv-${index}-return-pct`
				return (
					<div
						key={nameId}
						className="rounded-2xl border border-border bg-card p-4 space-y-3"
					>
						<div className="flex items-center justify-between">
							<span className="text-sm font-semibold text-foreground">
								Inversión {index + 1}
							</span>
							<button
								type="button"
								onClick={() => removeRow(index)}
								aria-label="Eliminar inversión"
								className="rounded-lg p-1 text-muted-foreground hover:text-destructive transition-colors"
							>
								<X className="h-4 w-4" />
							</button>
						</div>
						<div className="space-y-1.5">
							<label
								htmlFor={nameId}
								className="text-sm font-semibold text-foreground"
							>
								Nombre{' '}
								<span className="font-normal text-muted-foreground">
									(Opcional)
								</span>
							</label>
							<input
								id={nameId}
								type="text"
								value={row.name}
								onChange={(e) => updateRow(index, { name: e.target.value })}
								placeholder="Ej: Investor, ETF, Ahorro programado"
								className="w-full rounded-2xl border border-border bg-card px-4 py-3.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/60 transition-colors"
							/>
						</div>
						<div className="grid grid-cols-2 gap-3">
							<div className="space-y-1.5">
								<label
									htmlFor={currencyId}
									className="text-sm font-semibold text-foreground"
								>
									Moneda
								</label>
								<select
									id={currencyId}
									value={row.currency}
									onChange={(e) =>
										updateRow(index, {
											currency: e.target.value as 'USD' | 'GS',
										})
									}
									className="w-full rounded-2xl border border-border bg-card px-4 py-3.5 text-sm text-foreground outline-none focus:border-primary/60 transition-colors"
								>
									<option value="USD">USD</option>
									<option value="GS">Gs</option>
								</select>
							</div>
							<div className="space-y-1.5">
								<label
									htmlFor={valueId}
									className="text-sm font-semibold text-foreground"
								>
									Valor
								</label>
								<input
									id={valueId}
									type="text"
									inputMode="decimal"
									value={formatAmountDisplay(rawValues[index] ?? '', isDecimal)}
									onChange={(e) => {
										const raw = parseAmountInput(e.target.value, isDecimal)
										setRawValues((prev) => {
											const next = [...prev]
											next[index] = raw
											return next
										})
										updateRow(index, { value: Number(raw) || 0 })
									}}
									placeholder={isDecimal ? '0.00' : '0'}
									className="w-full rounded-2xl border border-border bg-card px-4 py-3.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/60 transition-colors"
								/>
							</div>
						</div>
						<div className="space-y-1.5">
							<label
								htmlFor={returnPctId}
								className="text-sm font-semibold text-foreground"
							>
								Rendimiento (%){' '}
								<span className="font-normal text-muted-foreground">
									(Opcional)
								</span>
							</label>
							<input
								id={returnPctId}
								type="text"
								inputMode="decimal"
								value={rawReturns[index] ?? ''}
								onChange={(e) => {
									const raw = parseAmountInput(
										e.target.value.replace(',', '.'),
										true,
									)
									setRawReturns((prev) => {
										const next = [...prev]
										next[index] = raw
										return next
									})
									updateRow(index, {
										returnPct: raw && raw !== '.' ? Number(raw) : undefined,
									})
								}}
								placeholder="0.00"
								className="w-full rounded-2xl border border-border bg-card px-4 py-3.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/60 transition-colors"
							/>
						</div>
					</div>
				)
			})}
			<button
				type="button"
				onClick={addRow}
				className="flex w-full items-center justify-center gap-2 rounded-2xl border border-border bg-card py-3.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
			>
				<Plus className="h-4 w-4" />
				Agregar inversión
			</button>
		</div>
	)
}
