import type { LucideIcon } from 'lucide-react'
import {
	ArrowLeftRight,
	BarChart2,
	CreditCard,
	Download,
	Layers,
	LayoutDashboard,
	Receipt,
	RefreshCw,
	Settings,
	Tag,
	Target,
	TrendingUp,
	Wallet,
} from 'lucide-react'

export type NavItem = {
	href: string
	icon: LucideIcon
	label: string
	comingSoon?: boolean
}

export const NAV_ITEMS: NavItem[] = [
	{ href: '/', icon: LayoutDashboard, label: 'Dashboard' },
	{ href: '/transactions', icon: Receipt, label: 'Transacciones' },
	{ href: '/incomes', icon: Wallet, label: 'Ingresos' },
	{ href: '/budgets', icon: Target, label: 'Presupuestos' },
	{ href: '/categories', icon: Tag, label: 'Categorías' },
	{ href: '/essentiality-levels', icon: Layers, label: 'Esencialidad' },
	{ href: '/recurring-items', icon: RefreshCw, label: 'Recurrentes' },
	{ href: '/installment-plans', icon: CreditCard, label: 'Cuotas' },
	{ href: '/snapshots', icon: BarChart2, label: 'Snapshots' },
	{ href: '/exchange-rates', icon: ArrowLeftRight, label: 'Tipos de Cambio' },
	{ href: '/export', icon: Download, label: 'Exportar' },
	{
		href: '/analytics',
		icon: TrendingUp,
		label: 'Analytics',
		comingSoon: true,
	},
	{ href: '/settings', icon: Settings, label: 'Settings', comingSoon: true },
]
