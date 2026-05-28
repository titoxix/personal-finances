'use client'

import { Search } from 'lucide-react'
import { useState } from 'react'
import type { Category } from '@/domain/entities/category'
import type { EssentialityLevel } from '@/domain/entities/essentiality-level'
import type { InstallmentPlan } from '@/domain/entities/installment-plan'
import { InstallmentPlanCard } from './InstallmentPlanCard'

type Props = {
	plans: InstallmentPlan[]
	categories: Category[]
	essentialityLevels: EssentialityLevel[]
}

export function InstallmentPlanList({
	plans,
	categories,
	essentialityLevels,
}: Props) {
	const [query, setQuery] = useState('')
	const [showInactive, setShowInactive] = useState(false)

	const categoryMap = Object.fromEntries(categories.map((c) => [c.id, c]))
	const essentialityMap = Object.fromEntries(
		essentialityLevels.map((e) => [e.id, e]),
	)

	const filtered = plans.filter((plan) => {
		if (!showInactive && !plan.active) return false
		if (!query) return true
		const cat = categoryMap[plan.categoryId]?.label ?? ''
		return (
			plan.description.toLowerCase().includes(query.toLowerCase()) ||
			cat.toLowerCase().includes(query.toLowerCase())
		)
	})

	const sorted = [...filtered].sort((a, b) => {
		if (a.active !== b.active) return a.active ? -1 : 1
		const aComplete = a.installmentsPaid >= a.installmentsTotal
		const bComplete = b.installmentsPaid >= b.installmentsTotal
		if (aComplete !== bComplete) return aComplete ? 1 : -1
		if (a.endDate && b.endDate) return a.endDate.getTime() - b.endDate.getTime()
		return 0
	})

	const activeCount = plans.filter((p) => p.active).length
	const completedCount = plans.filter(
		(p) => p.active && p.installmentsPaid >= p.installmentsTotal,
	).length

	return (
		<div className="space-y-3">
			{/* Search */}
			<div className="relative">
				<Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
				<input
					type="text"
					value={query}
					onChange={(e) => setQuery(e.target.value)}
					placeholder="Buscar plan..."
					className="w-full rounded-2xl border border-border bg-card py-3 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/60 transition-colors"
				/>
			</div>

			{/* Show inactive toggle */}
			{plans.some((p) => !p.active) && (
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
				{sorted.map((plan) => (
					<InstallmentPlanCard
						key={plan.id}
						plan={plan}
						category={categoryMap[plan.categoryId]}
						essentiality={essentialityMap[plan.essentialityId]}
					/>
				))}
				{sorted.length === 0 && (
					<p className="py-10 text-center text-sm text-muted-foreground">
						No se encontraron planes.
					</p>
				)}
			</div>

			{/* Summary */}
			<div className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
				<p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-primary">
					Planes en cuotas
				</p>
				<p className="text-sm text-foreground">
					{activeCount} plan{activeCount !== 1 ? 'es' : ''} activo
					{activeCount !== 1 ? 's' : ''}.
					{completedCount > 0 &&
						` ${completedCount} completado${completedCount !== 1 ? 's' : ''}.`}
				</p>
			</div>
		</div>
	)
}
