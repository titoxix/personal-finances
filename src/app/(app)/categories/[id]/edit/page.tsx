import { notFound } from 'next/navigation'
import { CategoryForm } from '@/components/categories/CategoryForm'
import { categoryService } from '@/lib/container'
import type { UpdateCategoryPayload } from '../../actions'
import { updateCategory } from '../../actions'

export default async function EditCategoryPage({
	params,
}: {
	params: Promise<{ id: string }>
}) {
	const { id: idStr } = await params
	const id = Number(idStr)
	if (Number.isNaN(id)) notFound()

	const category = await categoryService.findById(id).catch(() => null)
	if (!category) notFound()

	async function handleUpdate(payload: UpdateCategoryPayload) {
		'use server'
		return updateCategory(id, payload)
	}

	return (
		<CategoryForm
			mode="edit"
			onSubmit={handleUpdate}
			initialValues={category}
		/>
	)
}
