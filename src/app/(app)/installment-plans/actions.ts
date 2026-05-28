'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import type { PaymentMethod } from '@/domain/entities/recurring-item'
import { installmentPlanService } from '@/lib/container'

export type CreateInstallmentPlanPayload = {
	description: string
	installmentsTotal: number
	startDate: Date
	paymentMethod: PaymentMethod
	categoryId: number
	essentialityId: number
	totalAmountGs?: number
	totalAmountUsd?: number
	installmentAmountGs?: number
	notes?: string
}

export type UpdateInstallmentPlanPayload = {
	description?: string
	installmentsPaid?: number
	totalAmountGs?: number | null
	totalAmountUsd?: number | null
	installmentAmountGs?: number | null
	paymentMethod?: PaymentMethod
	categoryId?: number
	essentialityId?: number
	notes?: string | null
}

export async function createInstallmentPlan(
	payload: CreateInstallmentPlanPayload,
): Promise<{ error: string } | undefined> {
	try {
		await installmentPlanService.create(payload)
	} catch (e) {
		return {
			error:
				e instanceof Error ? e.message : 'Error al crear el plan de cuotas',
		}
	}
	revalidatePath('/installment-plans')
	redirect('/installment-plans')
}

export async function updateInstallmentPlan(
	id: number,
	payload: UpdateInstallmentPlanPayload,
): Promise<{ error: string } | undefined> {
	try {
		await installmentPlanService.update(id, payload)
	} catch (e) {
		return {
			error:
				e instanceof Error
					? e.message
					: 'Error al actualizar el plan de cuotas',
		}
	}
	revalidatePath('/installment-plans')
	redirect('/installment-plans')
}

export async function deactivateInstallmentPlan(
	id: number,
): Promise<{ error: string } | undefined> {
	try {
		await installmentPlanService.deactivate(id)
	} catch (e) {
		return {
			error:
				e instanceof Error
					? e.message
					: 'Error al desactivar el plan de cuotas',
		}
	}
	revalidatePath('/installment-plans')
	redirect('/installment-plans')
}
