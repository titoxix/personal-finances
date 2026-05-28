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

	const snapshot = await monthlySnapshotService.findById(id).catch(() => null)
	if (!snapshot) notFound()

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
			/>
		</div>
	)
}
