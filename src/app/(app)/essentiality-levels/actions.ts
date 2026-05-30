'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { essentialityService } from '@/lib/container'

export type CreateEssentialityLevelPayload = {
	code: string
	label: string
	sortOrder: number
	description?: string
}

export type UpdateEssentialityLevelPayload = {
	label: string
	sortOrder: number
	description?: string
}

export async function createEssentialityLevel(
	payload: CreateEssentialityLevelPayload,
): Promise<{ error: string } | undefined> {
	try {
		await essentialityService.create({
			code: payload.code.trim(),
			label: payload.label.trim(),
			sortOrder: payload.sortOrder,
			description: payload.description?.trim() || undefined,
		})
	} catch (e) {
		return {
			error: e instanceof Error ? e.message : 'Error al crear el nivel',
		}
	}
	revalidatePath('/essentiality-levels')
	redirect('/essentiality-levels')
}

export async function updateEssentialityLevel(
	id: number,
	payload: UpdateEssentialityLevelPayload,
): Promise<{ error: string } | undefined> {
	try {
		await essentialityService.update(id, {
			label: payload.label.trim(),
			sortOrder: payload.sortOrder,
			description: payload.description?.trim() || undefined,
		})
	} catch (e) {
		return {
			error: e instanceof Error ? e.message : 'Error al actualizar el nivel',
		}
	}
	revalidatePath('/essentiality-levels')
	redirect('/essentiality-levels')
}

export async function deactivateEssentialityLevel(
	id: number,
): Promise<{ error: string } | undefined> {
	try {
		await essentialityService.deactivate(id)
	} catch (e) {
		return {
			error: e instanceof Error ? e.message : 'Error al desactivar el nivel',
		}
	}
	revalidatePath('/essentiality-levels')
	redirect('/essentiality-levels')
}
