'use client'

import { Search } from 'lucide-react'
import { useState } from 'react'
import type { Category } from '@/domain/entities/category'
import type { EssentialityLevel } from '@/domain/entities/essentiality-level'
import type { RecurringItem } from '@/domain/entities/recurring-item'
import { RecurringItemCard } from './RecurringItemCard'

type Props = {
	items: RecurringItem[]
	categories: Category[]
	essentialityLevels: EssentialityLevel[]
}

export function RecurringItemList({
	items,
	categories,
	essentialityLevels,
}: Props) {
	const [query, setQuery] = useState('')
	const [showInactive, setShowInactive] = useState(false)

	const categoryMap = Object.fromEntries(categories.map((c) => [c.id, c]))
	const essentialityMap = Object.fromEntries(
		essentialityLevels.map((e) => [e.id, e]),
	)

	const filtered = items.filter((item) => {
		if (!showInactive && !item.active) return false
		if (!query) return true
		const cat = categoryMap[item.categoryId]?.label ?? ''
		return (
			item.description.toLowerCase().includes(query.toLowerCase()) ||
			cat.toLowerCase().includes(query.toLowerCase())
		)
	})

	const sorted = [...filtered].sort((a, b) => {
		if (a.active !== b.active) return a.active ? -1 : 1
		if (a.frequency !== b.frequency) return a.frequency === 'monthly' ? -1 : 1
		return (a.billingDay ?? 0) - (b.billingDay ?? 0)
	})

	const activeCount = items.filter((i) => i.active).length

	return (
		<div className="space-y-3">
			{/* Search */}
			<div className="relative">
				<Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
				<input
					type="text"
					value={query}
					onChange={(e) => setQuery(e.target.value)}
					placeholder="Buscar recurrente..."
					className="w-full rounded-2xl border border-border bg-card py-3 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/60 transition-colors"
				/>
			</div>

			{/* Show inactive toggle */}
			{items.some((i) => !i.active) && (
				<button
					type="button"
					onClick={() => setShowInactive((v) => !v)}
					className="text-xs font-semibold text-muted-foreground underline underline-offset-2"
				>
					{showInactive ? 'Ocultar inactivos' : 'Mostrar inactivos'}
				</button>
			)}

			{/* List */}
			<div className="space-y-2">
				{sorted.map((item) => (
					<RecurringItemCard
						key={item.id}
						item={item}
						category={categoryMap[item.categoryId]}
						essentiality={essentialityMap[item.essentialityId]}
					/>
				))}
				{sorted.length === 0 && (
					<p className="py-10 text-center text-sm text-muted-foreground">
						No se encontraron gastos recurrentes.
					</p>
				)}
			</div>

			{/* Summary */}
			<div className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
				<p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-primary">
					Compromisos fijos
				</p>
				<p className="text-sm text-foreground">
					{activeCount} gasto{activeCount !== 1 ? 's' : ''} recurrente
					{activeCount !== 1 ? 's' : ''} activo{activeCount !== 1 ? 's' : ''}.
					Usados para proyectar el flujo del mes antes de que ocurran.
				</p>
			</div>
		</div>
	)
}
