import type { LucideIcon } from 'lucide-react'
import {
	ArrowLeftRight,
	BarChart2,
	CreditCard,
	Download,
	Receipt,
	RefreshCw,
	Target,
	Wallet,
} from 'lucide-react'
import type { ExportEntityType } from '@/services/ExportService'

export type ExportOption = {
	type: ExportEntityType
	label: string
	icon: LucideIcon
	hasDateFilter: boolean
}

export const EXPORT_OPTIONS: ExportOption[] = [
	{
		type: 'transactions',
		label: 'Transacciones',
		icon: Receipt,
		hasDateFilter: true,
	},
	{
		type: 'incomes',
		label: 'Ingresos',
		icon: Wallet,
		hasDateFilter: true,
	},
	{
		type: 'budgets',
		label: 'Presupuestos',
		icon: Target,
		hasDateFilter: true,
	},
	{
		type: 'recurring-items',
		label: 'Recurrentes',
		icon: RefreshCw,
		hasDateFilter: false,
	},
	{
		type: 'installment-plans',
		label: 'Cuotas',
		icon: CreditCard,
		hasDateFilter: false,
	},
	{
		type: 'snapshots',
		label: 'Snapshots',
		icon: BarChart2,
		hasDateFilter: true,
	},
	{
		type: 'exchange-rates',
		label: 'Tipos de Cambio',
		icon: ArrowLeftRight,
		hasDateFilter: true,
	},
	{
		type: 'all',
		label: 'Exportar Todo',
		icon: Download,
		hasDateFilter: true,
	},
]
