import { Plus } from 'lucide-react'
import Link from 'next/link'
import { RecurringItemList } from '@/components/recurring-items/RecurringItemList'
import {
	categoryService,
	essentialityService,
	recurringItemService,
} from '@/lib/container'

export default async function RecurringItemsPage() {
	const [items, categories, essentialityLevels] = await Promise.all([
		recurringItemService.findAll(),
		categoryService.findAll(),
		essentialityService.findAll(),
	])

	return (
		<div>
			<div className="mb-5 flex items-end justify-between">
				<div>
					<p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
						Planificación
					</p>
					<h1 className="text-2xl font-bold text-foreground">Recurrentes</h1>
				</div>
				<Link
					href="/recurring-items/new"
					className="flex shrink-0 items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90"
				>
					<Plus className="h-4 w-4" strokeWidth={2.5} />
					Nuevo
				</Link>
			</div>

			{items.length === 0 ? (
				<div className="flex flex-col items-center gap-3 py-16 text-center">
					<p className="text-base font-semibold text-foreground">
						Sin gastos recurrentes
					</p>
					<p className="max-w-[240px] text-sm text-muted-foreground">
						Registrá tus compromisos fijos para proyectar el flujo de cada mes.
					</p>
					<Link
						href="/recurring-items/new"
						className="mt-2 rounded-full bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground"
					>
						Agregar recurrente
					</Link>
				</div>
			) : (
				<RecurringItemList
					items={items}
					categories={categories}
					essentialityLevels={essentialityLevels}
				/>
			)}
		</div>
	)
}
