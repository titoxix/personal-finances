import { ChevronRight } from 'lucide-react'
import Link from 'next/link'
import type { EssentialityLevel } from '@/domain/entities/essentiality-level'

export function EssentialityLevelItem({ level }: { level: EssentialityLevel }) {
	return (
		<Link
			href={`/essentiality-levels/${level.id}/edit`}
			className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3.5 transition-colors hover:bg-card/80"
		>
			<div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary/10">
				<span className="text-xs font-bold text-primary">
					{level.sortOrder}
				</span>
			</div>
			<div className="min-w-0 flex-1">
				<p className="truncate text-sm font-semibold text-foreground">
					{level.label}
				</p>
				<p className="font-mono text-xs text-muted-foreground">{level.code}</p>
			</div>
			{!level.active && (
				<span className="shrink-0 text-xs text-muted-foreground">Inactivo</span>
			)}
			<ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
		</Link>
	)
}
