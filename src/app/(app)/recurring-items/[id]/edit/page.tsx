import { notFound } from 'next/navigation'
import { RecurringItemForm } from '@/components/recurring-items/RecurringItemForm'
import {
	categoryService,
	essentialityService,
	recurringItemService,
} from '@/lib/container'
import type { UpdateRecurringItemPayload } from '../../actions'
import { deactivateRecurringItem, updateRecurringItem } from '../../actions'

export default async function EditRecurringItemPage({
	params,
}: {
	params: Promise<{ id: string }>
}) {
	const { id: idStr } = await params
	const id = Number(idStr)
	if (Number.isNaN(id)) notFound()

	const [item, categories, essentialityLevels] = await Promise.all([
		recurringItemService.findById(id).catch(() => null),
		categoryService.findAll(),
		essentialityService.findAll(),
	])

	if (!item) notFound()

	async function handleUpdate(payload: UpdateRecurringItemPayload) {
		'use server'
		return updateRecurringItem(id, payload)
	}

	async function handleDeactivate() {
		'use server'
		return deactivateRecurringItem(id)
	}

	return (
		<RecurringItemForm
			mode="edit"
			categories={categories}
			essentialityLevels={essentialityLevels}
			onSubmit={handleUpdate}
			onDeactivate={handleDeactivate}
			initialValues={item}
		/>
	)
}
