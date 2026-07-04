import { Plus } from 'lucide-react'
import Link from 'next/link'
import { RecurringByCategory } from '@/components/recurring-items/RecurringByCategory'
import { RecurringItemList } from '@/components/recurring-items/RecurringItemList'
import { RecurringTotalsSummary } from '@/components/recurring-items/RecurringTotalsSummary'
import { TopRecurringItems } from '@/components/recurring-items/TopRecurringItems'
import {
	categoryService,
	essentialityService,
	exchangeRateService,
	recurringItemService,
} from '@/lib/container'

export default async function RecurringItemsPage() {
	const [items, categories, essentialityLevels, latestRate] = await Promise.all(
		[
			recurringItemService.findAll(),
			categoryService.findAll(),
			essentialityService.findAll(),
			exchangeRateService.findLatestBySource('itau'),
		],
	)

	const refRate = latestRate?.rateSell ?? latestRate?.rateMid ?? 6000
	const toGs = (amountGs: number | null, amountUsd: number | null) =>
		amountGs ?? (amountUsd ? amountUsd * refRate : 0)

	const activeItems = items.filter((item) => item.active)
	const monthlyTotalGs = activeItems
		.filter((item) => item.frequency === 'monthly')
		.reduce((sum, item) => sum + toGs(item.amountGs, item.amountUsd), 0)
	const annualTotalGs = activeItems
		.filter((item) => item.frequency === 'annual')
		.reduce((sum, item) => sum + toGs(item.amountGs, item.amountUsd), 0)

	const topExpensive = [...activeItems]
		.map((item) => ({
			id: item.id,
			description: item.description,
			amountGs: toGs(item.amountGs, item.amountUsd),
			frequency: item.frequency,
			isVariable: item.isVariable,
		}))
		.sort((a, b) => b.amountGs - a.amountGs)
		.slice(0, 3)

	const categoryLabels = new Map(categories.map((c) => [c.id, c.label]))
	const byCategoryMap = new Map<
		string,
		{
			categoryId: number
			label: string
			frequency: 'monthly' | 'annual'
			totalGs: number
			count: number
		}
	>()
	for (const item of activeItems) {
		const key = `${item.categoryId}-${item.frequency}`
		const existing = byCategoryMap.get(key)
		const amountGs = toGs(item.amountGs, item.amountUsd)
		if (existing) {
			existing.totalGs += amountGs
			existing.count += 1
		} else {
			byCategoryMap.set(key, {
				categoryId: item.categoryId,
				label: categoryLabels.get(item.categoryId) ?? 'Sin categoría',
				frequency: item.frequency,
				totalGs: amountGs,
				count: 1,
			})
		}
	}
	const frequencyOrder = { monthly: 0, annual: 1 } as const
	const byCategory = [...byCategoryMap.values()].sort(
		(a, b) =>
			a.label.localeCompare(b.label) ||
			frequencyOrder[a.frequency] - frequencyOrder[b.frequency],
	)

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

			{items.length > 0 && (
				<>
					<RecurringTotalsSummary
						monthlyTotalGs={monthlyTotalGs}
						combinedTotalGs={monthlyTotalGs + annualTotalGs}
					/>
					<TopRecurringItems items={topExpensive} />
					<RecurringByCategory items={byCategory} />
				</>
			)}

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
