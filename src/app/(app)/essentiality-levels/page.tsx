import { Plus } from 'lucide-react'
import Link from 'next/link'
import { EssentialityLevelList } from '@/components/essentiality-levels/EssentialityLevelList'
import { essentialityService } from '@/lib/container'

export default async function EssentialityLevelsPage() {
	const levels = await essentialityService.findAll()

	return (
		<div>
			<div className="mb-5 flex items-end justify-between">
				<div>
					<p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
						Configuración
					</p>
					<h1 className="text-2xl font-bold text-foreground">Esencialidad</h1>
				</div>
				<Link
					href="/essentiality-levels/new"
					className="flex shrink-0 items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90"
				>
					<Plus className="h-4 w-4" strokeWidth={2.5} />
					Nuevo
				</Link>
			</div>

			<EssentialityLevelList levels={levels} />
		</div>
	)
}
