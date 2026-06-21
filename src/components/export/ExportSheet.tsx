'use client'

import { Check, Download, Loader2 } from 'lucide-react'
import { useState } from 'react'
import {
	countExportItems,
	type ExportFilter,
	getExportData,
} from '@/app/(app)/export/actions'
import { Button } from '@/components/ui/button'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from '@/components/ui/sheet'
import type { ExportOption } from './export-options'

type Status = 'idle' | 'counting' | 'counted' | 'downloading' | 'success'

type Props = {
	option: ExportOption
	open: boolean
	onClose: () => void
}

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

function generateMonthOptions(): { value: string; label: string }[] {
	const now = new Date()
	const options: { value: string; label: string }[] = []
	for (let i = 0; i < 24; i++) {
		const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1))
		const y = d.getUTCFullYear()
		const m = d.getUTCMonth()
		options.push({
			value: d.toISOString(),
			label: `${MONTHS_ES[m]} ${y}`,
		})
	}
	return options
}

function generateYearOptions(): { value: number; label: string }[] {
	const currentYear = new Date().getUTCFullYear()
	const options: { value: number; label: string }[] = []
	for (let y = currentYear; y >= 2024; y--) {
		options.push({ value: y, label: String(y) })
	}
	return options
}

function downloadJson(jsonString: string, filename: string) {
	const blob = new Blob([jsonString], { type: 'application/json' })
	const url = URL.createObjectURL(blob)
	const a = document.createElement('a')
	a.href = url
	a.download = filename
	a.click()
	URL.revokeObjectURL(url)
}

const ENTITY_LABELS: Record<string, string> = {
	transactions: 'transacciones',
	incomes: 'ingresos',
	budgets: 'presupuestos',
	'recurring-items': 'ítems recurrentes',
	'installment-plans': 'planes de cuotas',
	snapshots: 'snapshots',
	'exchange-rates': 'tipos de cambio',
	all: 'elementos',
}

export function ExportSheet({ option, open, onClose }: Props) {
	const [mode, setMode] = useState<'month' | 'year'>('month')
	const [selectedMonth, setSelectedMonth] = useState<string>('')
	const [selectedYear, setSelectedYear] = useState<string>('')
	const [status, setStatus] = useState<Status>('idle')
	const [count, setCount] = useState<number>(0)
	const [breakdown, setBreakdown] = useState<Record<string, number> | null>(
		null,
	)

	const monthOptions = generateMonthOptions()
	const yearOptions = generateYearOptions()

	function reset() {
		setStatus('idle')
		setCount(0)
		setBreakdown(null)
		setSelectedMonth('')
		setSelectedYear('')
		setMode('month')
	}

	function handleClose() {
		reset()
		onClose()
	}

	function buildFilter(): ExportFilter {
		if (!option.hasDateFilter) {
			return { entityType: option.type, mode: 'active' }
		}
		if (mode === 'month') {
			return { entityType: option.type, mode: 'month', month: selectedMonth }
		}
		return {
			entityType: option.type,
			mode: 'year',
			year: Number(selectedYear),
		}
	}

	const canCount = !option.hasDateFilter || selectedMonth || selectedYear

	async function handleCount() {
		setStatus('counting')
		const filter = buildFilter()
		const result = await countExportItems(filter)
		setCount(result.count)
		setBreakdown(result.breakdown ?? null)
		setStatus('counted')
	}

	async function handleDownload() {
		setStatus('downloading')
		const filter = buildFilter()
		const result = await getExportData(filter)
		downloadJson(result.data, result.filename)
		setStatus('success')
		setTimeout(() => {
			handleClose()
		}, 2000)
	}

	return (
		<Sheet open={open} onOpenChange={(o) => !o && handleClose()}>
			<SheetContent side="bottom" className="rounded-t-2xl">
				<SheetHeader>
					<SheetTitle>{option.label}</SheetTitle>
					<SheetDescription>
						Exportar {ENTITY_LABELS[option.type]} a JSON
					</SheetDescription>
				</SheetHeader>

				<div className="space-y-4 px-4 pb-4">
					{option.hasDateFilter && (
						<>
							<div className="flex gap-2">
								<Button
									variant={mode === 'month' ? 'default' : 'outline'}
									size="sm"
									onClick={() => {
										setMode('month')
										setSelectedYear('')
										setStatus('idle')
									}}
								>
									Por Mes
								</Button>
								<Button
									variant={mode === 'year' ? 'default' : 'outline'}
									size="sm"
									onClick={() => {
										setMode('year')
										setSelectedMonth('')
										setStatus('idle')
									}}
								>
									Por Año
								</Button>
							</div>

							{mode === 'month' && (
								<Select
									value={selectedMonth}
									onValueChange={(v) => {
										setSelectedMonth(v)
										setStatus('idle')
									}}
								>
									<SelectTrigger className="w-full">
										<SelectValue placeholder="Seleccionar mes" />
									</SelectTrigger>
									<SelectContent>
										{monthOptions.map((m) => (
											<SelectItem key={m.value} value={m.value}>
												{m.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							)}

							{mode === 'year' && (
								<Select
									value={selectedYear}
									onValueChange={(v) => {
										setSelectedYear(v)
										setStatus('idle')
									}}
								>
									<SelectTrigger className="w-full">
										<SelectValue placeholder="Seleccionar año" />
									</SelectTrigger>
									<SelectContent>
										{yearOptions.map((y) => (
											<SelectItem key={y.value} value={String(y.value)}>
												{y.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							)}
						</>
					)}

					{status === 'idle' && (
						<Button
							className="w-full"
							onClick={handleCount}
							disabled={!canCount}
						>
							Consultar
						</Button>
					)}

					{status === 'counting' && (
						<div className="flex items-center justify-center gap-2 py-4">
							<Loader2 className="h-5 w-5 animate-spin text-primary" />
							<span className="text-sm text-muted-foreground">
								Consultando...
							</span>
						</div>
					)}

					{status === 'counted' && (
						<div className="space-y-3">
							<div className="rounded-xl bg-secondary p-3">
								<p className="text-sm font-medium text-foreground">
									Se encontraron <span className="text-primary">{count}</span>{' '}
									{ENTITY_LABELS[option.type]}
								</p>
								{breakdown && (
									<ul className="mt-2 space-y-1">
										{Object.entries(breakdown).map(([key, val]) => (
											<li
												key={key}
												className="flex justify-between text-xs text-muted-foreground"
											>
												<span>{ENTITY_LABELS[key] ?? key}</span>
												<span>{val}</span>
											</li>
										))}
									</ul>
								)}
							</div>

							{count > 0 && (
								<div className="flex gap-2">
									<Button
										variant="outline"
										className="flex-1"
										onClick={handleClose}
									>
										Cancelar
									</Button>
									<Button className="flex-1 gap-2" onClick={handleDownload}>
										<Download className="h-4 w-4" />
										Descargar
									</Button>
								</div>
							)}

							{count === 0 && (
								<Button
									variant="outline"
									className="w-full"
									onClick={handleClose}
								>
									Cerrar
								</Button>
							)}
						</div>
					)}

					{status === 'downloading' && (
						<div className="flex items-center justify-center gap-2 py-4">
							<Loader2 className="h-5 w-5 animate-spin text-primary" />
							<span className="text-sm text-muted-foreground">
								Generando archivo...
							</span>
						</div>
					)}

					{status === 'success' && (
						<div className="flex items-center justify-center gap-2 py-4">
							<div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20">
								<Check className="h-4 w-4 text-primary" />
							</div>
							<span className="text-sm font-medium text-foreground">
								Archivo descargado
							</span>
						</div>
					)}
				</div>
			</SheetContent>
		</Sheet>
	)
}
