import { ChevronRight } from 'lucide-react'
import Link from 'next/link'
import type { Category } from '@/domain/entities/category'

export function CategoryItem({ category }: { category: Category }) {
	return (
		<Link
			href={`/categories/${category.id}/edit`}
			className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3.5 transition-colors hover:bg-card/80"
		>
			<div
				className={`h-2.5 w-2.5 shrink-0 rounded-full ${
					category.active ? 'bg-primary' : 'bg-muted-foreground/40'
				}`}
			/>
			<div className="min-w-0 flex-1">
				<p className="truncate text-sm font-semibold text-foreground">
					{category.label}
				</p>
				<p className="font-mono text-xs text-muted-foreground">
					{category.code}
				</p>
			</div>
			{!category.active && (
				<span className="shrink-0 text-xs text-muted-foreground">Inactiva</span>
			)}
			<ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
		</Link>
	)
}
