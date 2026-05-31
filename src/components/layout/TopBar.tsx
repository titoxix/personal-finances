'use client'

import { ArrowLeft, Bell, Menu, MoreVertical } from 'lucide-react'
import dynamic from 'next/dynamic'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'

const MobileDrawer = dynamic(
	() => import('./MobileDrawer').then((m) => ({ default: m.MobileDrawer })),
	{ ssr: false },
)

const STATIC_INNER_PAGES: Record<string, { title: string }> = {
	'/transactions/new': { title: 'Nueva Transacción' },
	'/categories/new': { title: 'Nueva Categoría' },
	'/exchange-rates/new': { title: 'Nueva Tasa' },
	'/budgets/new': { title: 'Nuevo Presupuesto' },
	'/essentiality-levels/new': { title: 'Nuevo Nivel' },
	'/recurring-items/new': { title: 'Nuevo Recurrente' },
	'/incomes/new': { title: 'Nuevo Ingreso' },
	'/installment-plans/new': { title: 'Nuevo Plan' },
	'/snapshots/new': { title: 'Nuevo Snapshot' },
}

function getInnerPage(pathname: string): { title: string } | undefined {
	const staticPage = STATIC_INNER_PAGES[pathname]
	if (staticPage) return staticPage
	if (/^\/transactions\/\d+\/edit$/.test(pathname))
		return { title: 'Editar Transacción' }
	if (/^\/categories\/\d+\/edit$/.test(pathname))
		return { title: 'Editar Categoría' }
	if (/^\/essentiality-levels\/\d+\/edit$/.test(pathname))
		return { title: 'Editar Nivel' }
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
	if (/^\/snapshots\/\d+\/edit$/.test(pathname))
		return { title: 'Editar Snapshot' }
	return undefined
}

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

			{open && (
				<MobileDrawer
					open={open}
					onClose={() => setOpen(false)}
					balance={balance}
				/>
			)}
		</>
	)
}
