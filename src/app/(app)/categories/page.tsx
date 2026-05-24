import { Plus } from 'lucide-react'
import Link from 'next/link'
import { CategoryList } from '@/components/categories/CategoryList'
import { categoryService } from '@/lib/container'

export default async function CategoriesPage() {
	const categories = await categoryService.findAll()

	return (
		<div>
			<div className="mb-5 flex items-end justify-between">
				<div>
					<p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
						Configuración
					</p>
					<h1 className="text-2xl font-bold text-foreground">Categorías</h1>
				</div>
				<Link
					href="/categories/new"
					className="flex shrink-0 items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90"
				>
					<Plus className="h-4 w-4" strokeWidth={2.5} />
					Nueva
				</Link>
			</div>

			<CategoryList categories={categories} />
		</div>
	)
}
