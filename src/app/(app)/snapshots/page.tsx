import { Plus } from 'lucide-react'
import Link from 'next/link'
import { MonthlySnapshotList } from '@/components/snapshots/MonthlySnapshotList'
import { monthlySnapshotService } from '@/lib/container'

export default async function SnapshotsPage() {
	const snapshots = await monthlySnapshotService.findAll()

	return (
		<div>
			<div className="mb-5 flex items-end justify-between">
				<div>
					<p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
						Historial
					</p>
					<h1 className="text-2xl font-bold text-foreground">Snapshots</h1>
				</div>
				<Link
					href="/snapshots/new"
					className="flex shrink-0 items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90"
				>
					<Plus className="h-4 w-4" strokeWidth={2.5} />
					Nuevo
				</Link>
			</div>

			{snapshots.length === 0 ? (
				<div className="flex flex-col items-center gap-3 py-16 text-center">
					<p className="text-base font-semibold text-foreground">
						Sin snapshots registrados
					</p>
					<p className="max-w-[240px] text-sm text-muted-foreground">
						Registrá el estado de tus finanzas al cierre de cada mes.
					</p>
					<Link
						href="/snapshots/new"
						className="mt-2 rounded-full bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground"
					>
						Registrar mes
					</Link>
				</div>
			) : (
				<MonthlySnapshotList snapshots={snapshots} />
			)}
		</div>
	)
}
