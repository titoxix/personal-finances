import { SnapshotForm } from '@/components/snapshots/SnapshotForm'
import { requireUser } from '@/lib/auth-helpers'
import { snapshotService } from '@/lib/container'
import { createSnapshot } from '../actions'

export default async function NewSnapshotPage({
	searchParams,
}: {
	searchParams: Promise<{ copyFrom?: string }>
}) {
	const user = await requireUser()
	const { copyFrom } = await searchParams
	const [latest, source] = await Promise.all([
		snapshotService.findLatest(user.id),
		copyFrom ? snapshotService.findById(user.id, Number(copyFrom)) : null,
	])

	return (
		<div>
			<div className="mb-6">
				<p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
					Historial
				</p>
				<h1 className="text-2xl font-bold text-foreground">Nuevo Snapshot</h1>
			</div>
			<SnapshotForm
				mode="create"
				onSubmit={createSnapshot}
				previousTotalInvestedUsd={latest?.totalInvestedUsd ?? null}
				initialValues={source ?? undefined}
			/>
		</div>
	)
}
