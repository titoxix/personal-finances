'use client'

import {
	ArrowLeftRight,
	LayoutDashboard,
	Receipt,
	RefreshCw,
	Settings,
	Tag,
	Target,
	TrendingUp,
	Wallet,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
	{ href: '/', icon: LayoutDashboard, label: 'Dashboard' },
	{ href: '/transactions', icon: Receipt, label: 'Transacciones' },
	{ href: '/incomes', icon: Wallet, label: 'Ingresos' },
	{ href: '/budgets', icon: Target, label: 'Presupuestos' },
	{ href: '/categories', icon: Tag, label: 'Categorías' },
	{ href: '/recurring-items', icon: RefreshCw, label: 'Recurrentes' },
	{ href: '/exchange-rates', icon: ArrowLeftRight, label: 'Tipos de Cambio' },
	{ href: '/analytics', icon: TrendingUp, label: 'Analytics' },
	{ href: '/settings', icon: Settings, label: 'Settings' },
]

type Props = {
	balance: number | null
}

export function Sidebar({ balance }: Props) {
	const pathname = usePathname()

	return (
		<aside className="fixed left-0 top-0 h-full w-[240px] hidden lg:flex flex-col bg-[#0d1527] border-r border-[#1e2a3a]">
			{/* Logo */}
			<div className="px-6 py-5">
				<span className="text-xl font-bold tracking-tight text-foreground">
					Finanz
				</span>
			</div>

			{/* User */}
			<div className="mx-4 mb-2 flex items-center gap-3 rounded-xl bg-secondary p-3">
				<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/20">
					<span className="text-sm font-bold text-primary">N</span>
				</div>
				<div className="min-w-0">
					<p className="truncate text-sm font-semibold text-foreground">
						Nisrina Saidah
					</p>
					<p className="text-xs text-muted-foreground">Premium Member</p>
				</div>
			</div>

			{/* Nav */}
			<nav className="flex-1 space-y-0.5 px-3 py-2">
				{NAV_ITEMS.map(({ href, icon: Icon, label }) => {
					const active = pathname === href
					return (
						<Link
							key={href}
							href={href}
							className={cn(
								'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
								active
									? 'bg-primary/10 text-primary'
									: 'text-muted-foreground hover:bg-accent hover:text-foreground',
							)}
						>
							<Icon className="h-4 w-4 shrink-0" />
							{label}
						</Link>
					)
				})}
			</nav>

			{/* Balance card */}
			{balance != null && (
				<div className="m-4 overflow-hidden rounded-2xl bg-gradient-to-br from-[#10b981] to-[#065f46] p-4">
					<p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#003824]/70">
						Balance
					</p>
					<p className="font-mono text-xl font-bold text-[#003824]">
						{new Intl.NumberFormat('en-US', {
							style: 'currency',
							currency: 'USD',
						}).format(balance)}
					</p>
				</div>
			)}
		</aside>
	)
}
