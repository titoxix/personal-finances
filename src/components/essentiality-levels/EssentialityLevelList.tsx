'use client'

import { Search } from 'lucide-react'
import { useState } from 'react'
import type { EssentialityLevel } from '@/domain/entities/essentiality-level'
import { EssentialityLevelItem } from './EssentialityLevelItem'

export function EssentialityLevelList({
	levels,
}: {
	levels: EssentialityLevel[]
}) {
	const [query, setQuery] = useState('')

	const filtered = levels.filter(
		(l) =>
			l.label.toLowerCase().includes(query.toLowerCase()) ||
			l.code.toLowerCase().includes(query.toLowerCase()),
	)

	return (
		<div className="space-y-3">
			<div className="relative">
				<Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
				<input
					type="text"
					value={query}
					onChange={(e) => setQuery(e.target.value)}
					placeholder="Buscar nivel..."
					className="w-full rounded-2xl border border-border bg-card py-3 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/60 transition-colors"
				/>
			</div>

			<div className="space-y-2">
				{filtered.map((level) => (
					<EssentialityLevelItem key={level.id} level={level} />
				))}
				{filtered.length === 0 && (
					<p className="py-10 text-center text-sm text-muted-foreground">
						No se encontraron niveles.
					</p>
				)}
			</div>

			<div className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
				<p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-primary">
					Clasificación de gastos
				</p>
				<p className="text-sm text-foreground">
					Los niveles de esencialidad te permiten priorizar y analizar tus
					gastos según su importancia.
				</p>
			</div>
		</div>
	)
}
