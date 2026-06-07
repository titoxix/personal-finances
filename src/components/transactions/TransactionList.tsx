'use client'

import { Search } from 'lucide-react'
import { useState } from 'react'
import { TransactionItem } from '@/components/home/TransactionItem'

export type TransactionListRow = {
	id: number
	description: string
	date: Date
	createdAt: Date
	categoryId: number
	categoryLabel: string
	amountGs: number | null
	amountUsd: number | null
}

type Section = { key: string; label: string; rows: TransactionListRow[] }

function groupByDate(rows: TransactionListRow[]): Section[] {
	const now = new Date()
	const today = new Date(
		Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
	)
	const yesterday = new Date(today)
	yesterday.setUTCDate(yesterday.getUTCDate() - 1)

	const buckets = new Map<string, Section>()

	for (const row of rows) {
		const d = row.date
		const dayUTC = new Date(
			Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()),
		)
		let key: string
		let label: string
		if (dayUTC.getTime() === today.getTime()) {
			key = '__today'
			label = 'Recientes'
		} else if (dayUTC.getTime() === yesterday.getTime()) {
			key = '__yesterday'
			label = 'Ayer'
		} else {
			key = dayUTC.toISOString()
			label = dayUTC.toLocaleDateString('es-PY', {
				day: 'numeric',
				month: 'long',
				timeZone: 'UTC',
			})
		}
		if (!buckets.has(key)) buckets.set(key, { key, label, rows: [] })
		buckets.get(key)?.rows.push(row)
	}

	return Array.from(buckets.values())
}

type Props = { rows: TransactionListRow[]; belowSearch?: React.ReactNode }

export function TransactionList({ rows, belowSearch }: Props) {
	const [query, setQuery] = useState('')

	const filtered = query.trim()
		? rows.filter(
				(r) =>
					r.description.toLowerCase().includes(query.toLowerCase()) ||
					r.categoryLabel.toLowerCase().includes(query.toLowerCase()),
			)
		: rows

	const sections = groupByDate(filtered)

	return (
		<div className="space-y-5">
			{/* Search */}
			<div className="relative">
				<Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
				<input
					type="text"
					value={query}
					onChange={(e) => setQuery(e.target.value)}
					placeholder="Buscar transacción..."
					className="w-full rounded-2xl border border-border bg-card py-3.5 pl-11 pr-4 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/60 transition-colors"
				/>
			</div>

			{belowSearch}

			{/* Empty state */}
			{sections.length === 0 && (
				<p className="py-16 text-center text-sm text-muted-foreground">
					{query ? 'Sin resultados' : 'No hay transacciones registradas'}
				</p>
			)}

			{/* Grouped sections */}
			{sections.map((section) => (
				<div key={section.key} className="space-y-2">
					<p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
						{section.label}
					</p>
					<div className="flex flex-col gap-2">
						{section.rows.map((tx) => (
							<TransactionItem
								key={tx.id}
								id={tx.id}
								description={tx.description}
								date={tx.date}
								createdAt={tx.createdAt}
								categoryLabel={tx.categoryLabel}
								amountUsd={tx.amountUsd}
								amountGs={tx.amountGs}
							/>
						))}
					</div>
				</div>
			))}
		</div>
	)
}
