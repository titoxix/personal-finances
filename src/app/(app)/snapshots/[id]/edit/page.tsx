import { notFound } from 'next/navigation'
import { MonthlySnapshotForm } from '@/components/snapshots/MonthlySnapshotForm'
import { monthlySnapshotService } from '@/lib/container'
import type { UpdateSnapshotPayload } from '../../actions'
import { updateSnapshot } from '../../actions'

export default async function EditSnapshotPage({
	params,
}: {
	params: Promise<{ id: string }>
}) {
	const { id: idStr } = await params
	const id = Number(idStr)
	if (Number.isNaN(id)) notFound()

	const [snapshot, latest] = await Promise.all([
		monthlySnapshotService.findById(id).catch(() => null),
		monthlySnapshotService.findLatest(),
	])
	if (!snapshot) notFound()

	// mirror the same logic the service uses: if editing the latest, no previous
	const previous = latest?.id === id ? null : latest

	async function handleUpdate(payload: UpdateSnapshotPayload) {
		'use server'
		return updateSnapshot(id, payload)
	}

	return (
		<div>
			<div className="mb-6">
				<p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
					Historial
				</p>
				<h1 className="text-2xl font-bold text-foreground">Editar Snapshot</h1>
			</div>
			<MonthlySnapshotForm
				mode="edit"
				onSubmit={handleUpdate}
				initialValues={snapshot}
				previousTotalInvestedUsd={previous?.totalInvestedUsd ?? null}
			/>
		</div>
	)
}
