import { notFound } from 'next/navigation'
import { EssentialityLevelForm } from '@/components/essentiality-levels/EssentialityLevelForm'
import { essentialityService } from '@/lib/container'
import type { UpdateEssentialityLevelPayload } from '../../actions'
import {
	deactivateEssentialityLevel,
	updateEssentialityLevel,
} from '../../actions'

export default async function EditEssentialityLevelPage({
	params,
}: {
	params: Promise<{ id: string }>
}) {
	const { id: idStr } = await params
	const id = Number(idStr)
	if (Number.isNaN(id)) notFound()

	const level = await essentialityService.findById(id).catch(() => null)
	if (!level) notFound()

	async function handleUpdate(payload: UpdateEssentialityLevelPayload) {
		'use server'
		return updateEssentialityLevel(id, payload)
	}

	async function handleDeactivate() {
		'use server'
		return deactivateEssentialityLevel(id)
	}

	return (
		<EssentialityLevelForm
			mode="edit"
			onSubmit={handleUpdate}
			onDeactivate={handleDeactivate}
			initialValues={level}
		/>
	)
}
