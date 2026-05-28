'use client'

import {
	ArrowLeft,
	ArrowLeftRight,
	Bell,
	CreditCard,
	LayoutDashboard,
	Menu,
	MoreVertical,
	Receipt,
	RefreshCw,
	Settings,
	Tag,
	Target,
	TrendingUp,
	Wallet,
	X,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { cn } from '@/lib/utils'

const STATIC_INNER_PAGES: Record<string, { title: string }> = {
	'/transactions/new': { title: 'Nueva Transacción' },
	'/categories/new': { title: 'Nueva Categoría' },
	'/exchange-rates/new': { title: 'Nueva Tasa' },
	'/budgets/new': { title: 'Nuevo Presupuesto' },
	'/recurring-items/new': { title: 'Nuevo Recurrente' },
	'/incomes/new': { title: 'Nuevo Ingreso' },
	'/installment-plans/new': { title: 'Nuevo Plan' },
}

function getInnerPage(pathname: string): { title: string } | undefined {
	const staticPage = STATIC_INNER_PAGES[pathname]
	if (staticPage) return staticPage
	if (/^\/transactions\/\d+\/edit$/.test(pathname))
		return { title: 'Editar Transacción' }
	if (/^\/categories\/\d+\/edit$/.test(pathname))
		return { title: 'Editar Categoría' }
	if (/^\/budgets\/\d+\/edit$/.test(pathname))
		return { title: 'Editar Presupuesto' }
	if (/^\/recurring-items\/\d+\/edit$/.test(pathname))
		return { title: 'Editar Recurrente' }
	if (/^\/incomes\/\d+\/edit$/.test(pathname))
		return { title: 'Editar Ingreso' }
	if (/^\/exchange-rates\/\d+\/edit$/.test(pathname))
		return { title: 'Editar Tasa' }
	if (/^\/installment-plans\/\d+\/edit$/.test(pathname))
		return { title: 'Editar Plan' }
	return undefined
}

const NAV_ITEMS = [
	{ href: '/', icon: LayoutDashboard, label: 'Dashboard' },
	{ href: '/transactions', icon: Receipt, label: 'Transacciones' },
	{ href: '/incomes', icon: Wallet, label: 'Ingresos' },
	{ href: '/budgets', icon: Target, label: 'Presupuestos' },
	{ href: '/categories', icon: Tag, label: 'Categorías' },
	{ href: '/recurring-items', icon: RefreshCw, label: 'Recurrentes' },
	{ href: '/installment-plans', icon: CreditCard, label: 'Cuotas' },
	{ href: '/exchange-rates', icon: ArrowLeftRight, label: 'Tipos de Cambio' },
	{ href: '/analytics', icon: TrendingUp, label: 'Analytics', comingSoon: true },
	{ href: '/settings', icon: Settings, label: 'Settings', comingSoon: true },
]

type Props = {
	balance: number | null
}

export function TopBar({ balance }: Props) {
	const [open, setOpen] = useState(false)
	const pathname = usePathname()
	const router = useRouter()
	const innerPage = getInnerPage(pathname)

	if (innerPage) {
		return (
			<header className="sticky top-0 z-40 flex items-center justify-between bg-background px-5 py-4 lg:hidden">
				<button
					type="button"
					onClick={() => router.back()}
					className="rounded-lg p-1.5 text-foreground hover:bg-accent"
					aria-label="Volver"
				>
					<ArrowLeft className="h-5 w-5" />
				</button>
				<span className="text-base font-semibold text-foreground">
					{innerPage.title}
				</span>
				<button
					type="button"
					className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
					aria-label="Opciones"
				>
					<MoreVertical className="h-5 w-5" />
				</button>
			</header>
		)
	}

	return (
		<>
			<header className="sticky top-0 z-40 flex items-center justify-between bg-[#0b1326]/95 backdrop-blur-sm px-5 py-3 lg:hidden">
				<button
					type="button"
					onClick={() => setOpen(true)}
					className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
					aria-label="Abrir menú"
				>
					<Menu className="h-5 w-5" />
				</button>

				<div className="flex items-center gap-2.5">
					<div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#10b981] to-[#065f46]">
						<span className="text-xs font-bold text-[#003824]">N</span>
					</div>
					<div>
						<p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-muted-foreground leading-none">
							Hello!
						</p>
						<p className="text-sm font-semibold text-foreground leading-tight">
							Nisrina Saidah
						</p>
					</div>
				</div>

				<button
					type="button"
					className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
					aria-label="Notificaciones"
				>
					<Bell className="h-5 w-5" />
				</button>
			</header>

			{/* Mobile drawer — always in DOM so CSS transitions work */}
			{/* Backdrop — decorative overlay, keyboard dismiss handled by drawer buttons */}
			{/* biome-ignore lint/a11y/noStaticElementInteractions: overlay backdrop pattern */}
			{/* biome-ignore lint/a11y/useKeyWithClickEvents: overlay backdrop pattern */}
			<div
				className={cn(
					'fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ease-in-out lg:hidden',
					open ? 'opacity-100' : 'pointer-events-none opacity-0',
				)}
				onClick={() => setOpen(false)}
			/>

			{/* Drawer panel */}
			<aside
				className={cn(
					'fixed left-0 top-0 z-50 flex h-full w-[260px] flex-col bg-[#0d1527] border-r border-[#1e2a3a]',
					'transition-transform duration-300 ease-in-out lg:hidden',
					open ? 'translate-x-0' : '-translate-x-full',
				)}
			>
				{/* Header */}
				<div className="flex items-center justify-between px-6 py-5">
					<span className="text-xl font-bold tracking-tight text-foreground">
						Finanz
					</span>
					<button
						type="button"
						onClick={() => setOpen(false)}
						className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
						aria-label="Cerrar menú"
					>
						<X className="h-5 w-5" />
					</button>
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
					{NAV_ITEMS.map(({ href, icon: Icon, label, comingSoon }) => {
						if (comingSoon) {
							return (
								<div
									key={href}
									className="flex cursor-not-allowed items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground/40"
								>
									<Icon className="h-4 w-4 shrink-0" />
									{label}
									<span className="ml-auto rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground/60">
										Pronto
									</span>
								</div>
							)
						}
						const active = pathname === href
						return (
							<Link
								key={href}
								href={href}
								onClick={() => setOpen(false)}
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
		</>
	)
}
