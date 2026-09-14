'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { requireUser } from '@/lib/auth-helpers'
import { categoryService } from '@/lib/container'

export type CreateCategoryPayload = {
	code: string
	label: string
	description?: string
}

export type UpdateCategoryPayload = {
	label: string
	description?: string
	active: boolean
}

export async function createCategory(
	payload: CreateCategoryPayload,
): Promise<{ error: string } | undefined> {
	const user = await requireUser()
	try {
		await categoryService.create(user.id, {
			code: payload.code.trim(),
			label: payload.label.trim(),
			description: payload.description?.trim() || undefined,
		})
	} catch (e) {
		return {
			error: e instanceof Error ? e.message : 'Error al crear la categoría',
		}
	}
	revalidatePath('/categories')
	redirect('/categories')
}

export async function updateCategory(
	id: number,
	payload: UpdateCategoryPayload,
): Promise<{ error: string } | undefined> {
	const user = await requireUser()
	try {
		await categoryService.update(user.id, id, {
			label: payload.label.trim(),
			description: payload.description?.trim() || undefined,
			active: payload.active,
		})
	} catch (e) {
		return {
			error:
				e instanceof Error ? e.message : 'Error al actualizar la categoría',
		}
	}
	revalidatePath('/categories')
	redirect('/categories')
}
