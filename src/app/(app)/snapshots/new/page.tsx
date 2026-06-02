import { MonthlySnapshotForm } from '@/components/snapshots/MonthlySnapshotForm'
import { monthlySnapshotService } from '@/lib/container'
import { createSnapshot } from '../actions'

export default async function NewSnapshotPage() {
	const latest = await monthlySnapshotService.findLatest()

	return (
		<div>
			<div className="mb-6">
				<p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
					Historial
				</p>
				<h1 className="text-2xl font-bold text-foreground">Nuevo Snapshot</h1>
			</div>
			<MonthlySnapshotForm
				mode="create"
				onSubmit={createSnapshot}
				previousTotalInvestedUsd={latest?.totalInvestedUsd ?? null}
			/>
		</div>
	)
}
