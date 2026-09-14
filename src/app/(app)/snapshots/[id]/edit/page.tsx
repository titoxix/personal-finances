import { notFound } from 'next/navigation'
import { SnapshotForm } from '@/components/snapshots/SnapshotForm'
import { requireUser } from '@/lib/auth-helpers'
import { snapshotService } from '@/lib/container'
import type { UpdateSnapshotPayload } from '../../actions'
import { updateSnapshot } from '../../actions'

export default async function EditSnapshotPage({
	params,
}: {
	params: Promise<{ id: string }>
}) {
	const user = await requireUser()
	const { id: idStr } = await params
	const id = Number(idStr)
	if (Number.isNaN(id)) notFound()

	const [snapshot, latest] = await Promise.all([
		snapshotService.findById(user.id, id).catch(() => null),
		snapshotService.findLatest(user.id),
	])
	if (!snapshot) notFound()

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
			<SnapshotForm
				mode="edit"
				onSubmit={handleUpdate}
				initialValues={snapshot}
				previousTotalInvestedUsd={previous?.totalInvestedUsd ?? null}
			/>
		</div>
	)
}
