'use client'

import { FileText, Home, Plus, Target, Wallet } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const LEFT_NAV = [
	{ href: '/', icon: Home },
	{ href: '/transactions', icon: FileText },
]

const RIGHT_NAV = [
	{ href: '/budgets', icon: Target },
	{ href: '/incomes', icon: Wallet },
]

function isFormPage(pathname: string): boolean {
	if (pathname === '/transactions/new') return true
	if (/^\/transactions\/\d+\/edit$/.test(pathname)) return true
	if (pathname === '/categories/new') return true
	if (/^\/categories\/\d+\/edit$/.test(pathname)) return true
	if (pathname === '/exchange-rates/new') return true
	if (pathname === '/budgets/new') return true
	if (/^\/budgets\/\d+\/edit$/.test(pathname)) return true
	if (pathname === '/incomes/new') return true
	if (/^\/incomes\/\d+\/edit$/.test(pathname)) return true
	if (pathname === '/installment-plans/new') return true
	if (/^\/installment-plans\/\d+\/edit$/.test(pathname)) return true
	if (pathname === '/snapshots/new') return true
	if (/^\/snapshots\/\d+\/edit$/.test(pathname)) return true
	return false
}

export function BottomNav() {
	const pathname = usePathname()

	if (isFormPage(pathname)) return null

	return (
		<nav className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center justify-around bg-[#0d1527] border-t border-[#1e2a3a] lg:hidden">
			{LEFT_NAV.map(({ href, icon: Icon }) => (
				<Link
					key={href}
					href={href}
					className={cn(
						'flex flex-1 items-center justify-center py-3',
						pathname === href ? 'text-primary' : 'text-muted-foreground',
					)}
				>
					<Icon className="h-5 w-5" />
				</Link>
			))}

			{/* FAB */}
			<Link
				href="/transactions/new"
				className="flex h-14 w-14 shrink-0 -mt-6 items-center justify-center rounded-full bg-primary shadow-[0_4px_24px_rgba(78,222,163,0.35)]"
			>
				<Plus className="h-6 w-6 text-primary-foreground" strokeWidth={2.5} />
			</Link>

			{RIGHT_NAV.map(({ href, icon: Icon }) => (
				<Link
					key={href}
					href={href}
					className={cn(
						'flex flex-1 items-center justify-center py-3',
						pathname === href ? 'text-primary' : 'text-muted-foreground',
					)}
				>
					<Icon className="h-5 w-5" />
				</Link>
			))}
		</nav>
	)
}
