'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { budgetService } from '@/lib/container'

export type CreateBudgetPayload = {
	month: string // 'YYYY-MM'
	categoryId: number
	essentialityId: number
	currency: 'usd' | 'gs'
	amount: number
	isRecurring: boolean
	notes?: string
}

export type UpdateBudgetPayload = {
	essentialityId: number
	currency: 'usd' | 'gs'
	amount: number
	isRecurring: boolean
	notes?: string
}

export type UpdateBudgetPayloadWithMonth = UpdateBudgetPayload & {
	targetMonth: string // 'YYYY-MM'
}

function parseMonthDate(monthStr: string): Date {
	const parts = monthStr.split('-').map(Number)
	const year = parts[0] ?? new Date().getUTCFullYear()
	const month = parts[1] ?? 1
	return new Date(Date.UTC(year, month - 1, 1))
}

export async function createBudget(
	payload: CreateBudgetPayload,
): Promise<{ error: string } | undefined> {
	try {
		await budgetService.create({
			month: parseMonthDate(payload.month),
			categoryId: payload.categoryId,
			essentialityId: payload.essentialityId,
			budgetedUsd: payload.currency === 'usd' ? payload.amount : undefined,
			budgetedGs: payload.currency === 'gs' ? payload.amount : undefined,
			isRecurring: payload.isRecurring,
			notes: payload.notes,
		})
	} catch (e) {
		return {
			error: e instanceof Error ? e.message : 'Error al crear el presupuesto',
		}
	}
	revalidatePath('/budgets')
	revalidatePath('/')
	redirect('/budgets')
}

export async function updateBudget(
	id: number,
	payload: UpdateBudgetPayloadWithMonth,
): Promise<{ error: string } | undefined> {
	try {
		await budgetService.adjustForMonth(
			id,
			parseMonthDate(payload.targetMonth),
			{
				essentialityId: payload.essentialityId,
				budgetedUsd: payload.currency === 'usd' ? payload.amount : null,
				budgetedGs: payload.currency === 'gs' ? payload.amount : null,
				isRecurring: payload.isRecurring,
				notes: payload.notes ?? null,
			},
		)
	} catch (e) {
		return {
			error:
				e instanceof Error ? e.message : 'Error al actualizar el presupuesto',
		}
	}
	revalidatePath('/budgets')
	revalidatePath('/')
	redirect('/budgets')
}

export async function deleteBudget(
	id: number,
	reason?: string,
): Promise<{ error: string } | undefined> {
	try {
		await budgetService.delete(id, reason?.trim() || undefined)
	} catch (e) {
		return {
			error:
				e instanceof Error ? e.message : 'Error al eliminar el presupuesto',
		}
	}
	revalidatePath('/budgets')
	revalidatePath('/')
	redirect('/budgets')
}
