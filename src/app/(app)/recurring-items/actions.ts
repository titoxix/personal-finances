'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import type {
	PaymentMethod,
	RecurringFrequency,
} from '@/domain/entities/recurring-item'
import { recurringItemService } from '@/lib/container'

export type CreateRecurringItemPayload = {
	description: string
	categoryId: number
	essentialityId: number
	paymentMethod: PaymentMethod
	frequency: RecurringFrequency
	billingDay: number
	billingMonth?: number
	isVariable: boolean
	amountGs?: number
	amountUsd?: number
	notes?: string
}

export type UpdateRecurringItemPayload = {
	description?: string
	categoryId?: number
	essentialityId?: number
	paymentMethod?: PaymentMethod
	frequency?: RecurringFrequency
	billingDay?: number | null
	billingMonth?: number | null
	isVariable?: boolean
	amountGs?: number | null
	amountUsd?: number | null
	notes?: string | null
}

export async function createRecurringItem(
	payload: CreateRecurringItemPayload,
): Promise<{ error: string } | undefined> {
	try {
		await recurringItemService.create(payload)
	} catch (e) {
		return {
			error:
				e instanceof Error ? e.message : 'Error al crear el gasto recurrente',
		}
	}
	revalidatePath('/recurring-items')
	redirect('/recurring-items')
}

export async function updateRecurringItem(
	id: number,
	payload: UpdateRecurringItemPayload,
): Promise<{ error: string } | undefined> {
	try {
		await recurringItemService.update(id, payload)
	} catch (e) {
		return {
			error:
				e instanceof Error
					? e.message
					: 'Error al actualizar el gasto recurrente',
		}
	}
	revalidatePath('/recurring-items')
	redirect('/recurring-items')
}

export async function deactivateRecurringItem(
	id: number,
): Promise<{ error: string } | undefined> {
	try {
		await recurringItemService.deactivate(id)
	} catch (e) {
		return {
			error:
				e instanceof Error
					? e.message
					: 'Error al desactivar el gasto recurrente',
		}
	}
	revalidatePath('/recurring-items')
	redirect('/recurring-items')
}

export async function skipRecurringItem(
	recurringItemId: number,
	month: string,
	reason: string,
): Promise<{ error: string } | undefined> {
	try {
		await recurringItemService.skipForMonth(
			recurringItemId,
			new Date(month),
			reason,
		)
	} catch (e) {
		return {
			error:
				e instanceof Error ? e.message : 'Error al saltar el gasto recurrente',
		}
	}
	revalidatePath('/')
	revalidatePath('/recurring-items')
	return undefined
}

export async function unskipRecurringItem(
	recurringItemId: number,
	month: string,
): Promise<{ error: string } | undefined> {
	try {
		await recurringItemService.unskipForMonth(recurringItemId, new Date(month))
	} catch (e) {
		return {
			error:
				e instanceof Error
					? e.message
					: 'Error al revertir el salto del gasto recurrente',
		}
	}
	revalidatePath('/')
	revalidatePath('/recurring-items')
	return undefined
}
