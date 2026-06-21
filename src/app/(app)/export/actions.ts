'use server'

import { exportService } from '@/lib/container'
import type { ExportEntityType } from '@/services/ExportService'

export type ExportFilter = {
	entityType: ExportEntityType
	mode: 'month' | 'year' | 'active'
	month?: string
	year?: number
}

function computeRange(filter: ExportFilter): { start: Date; end: Date } {
	if (filter.mode === 'month' && filter.month) {
		const date = new Date(filter.month)
		const start = new Date(
			Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1),
		)
		const end = new Date(
			Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 1),
		)
		return { start, end }
	}

	if (filter.mode === 'year' && filter.year) {
		return {
			start: new Date(Date.UTC(filter.year, 0, 1)),
			end: new Date(Date.UTC(filter.year + 1, 0, 1)),
		}
	}

	return {
		start: new Date(Date.UTC(2020, 0, 1)),
		end: new Date(Date.UTC(2100, 0, 1)),
	}
}

const ENTITY_LABELS: Record<ExportEntityType, string> = {
	transactions: 'transacciones',
	incomes: 'ingresos',
	budgets: 'presupuestos',
	'recurring-items': 'recurrentes-activos',
	'installment-plans': 'cuotas-activas',
	snapshots: 'snapshots',
	'exchange-rates': 'tipos-de-cambio',
	all: 'todo',
}

function buildFilename(filter: ExportFilter): string {
	const label = ENTITY_LABELS[filter.entityType as ExportEntityType]

	if (filter.mode === 'active') {
		return `${label}.json`
	}

	if (filter.mode === 'month' && filter.month) {
		const date = new Date(filter.month)
		const y = date.getUTCFullYear()
		const m = String(date.getUTCMonth() + 1).padStart(2, '0')
		return `${label}-${y}-${m}.json`
	}

	if (filter.mode === 'year' && filter.year) {
		return `${label}-${filter.year}.json`
	}

	return `${label}.json`
}

export async function countExportItems(
	filter: ExportFilter,
): Promise<{ count: number; breakdown?: Record<string, number> }> {
	const range = computeRange(filter)
	const result = await exportService.count(
		filter.entityType as ExportEntityType,
		range,
	)
	return { count: result.count, breakdown: result.breakdown }
}

export async function getExportData(
	filter: ExportFilter,
): Promise<{ data: string; filename: string }> {
	const range = computeRange(filter)
	const result = await exportService.exportData(
		filter.entityType as ExportEntityType,
		range,
	)
	return {
		data: JSON.stringify(result, null, 2),
		filename: buildFilename(filter),
	}
}
