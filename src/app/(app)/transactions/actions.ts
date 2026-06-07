'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import type { PaymentMethod } from '@/domain/entities/recurring-item'
import { transactionService } from '@/lib/container'

export type CreateTransactionPayload = {
	amount: number
	currency: 'gs' | 'usd'
	description: string
	categoryId: number
	essentialityId: number
	paymentMethod: PaymentMethod
	date: string
	recurringItemId?: number
}

export async function createTransaction(
	payload: CreateTransactionPayload,
): Promise<{ error: string } | undefined> {
	try {
		await transactionService.create({
			date: new Date(payload.date),
			description: payload.description,
			categoryId: payload.categoryId,
			essentialityId: payload.essentialityId,
			paymentMethod: payload.paymentMethod,
			amountGs: payload.currency === 'gs' ? payload.amount : undefined,
			amountUsd: payload.currency === 'usd' ? payload.amount : undefined,
			recurringItemId: payload.recurringItemId,
		})
	} catch (e) {
		return {
			error: e instanceof Error ? e.message : 'Error al guardar la transacción',
		}
	}

	revalidatePath('/')
	revalidatePath('/transactions')
	redirect('/transactions')
}

export async function updateTransaction(
	id: number,
	payload: CreateTransactionPayload,
): Promise<{ error: string } | undefined> {
	try {
		await transactionService.update(id, {
			date: new Date(payload.date),
			description: payload.description,
			categoryId: payload.categoryId,
			essentialityId: payload.essentialityId,
			paymentMethod: payload.paymentMethod,
			amountGs: payload.currency === 'gs' ? payload.amount : null,
			amountUsd: payload.currency === 'usd' ? payload.amount : null,
			recurringItemId: payload.recurringItemId ?? null,
		})
	} catch (e) {
		return {
			error:
				e instanceof Error ? e.message : 'Error al actualizar la transacción',
		}
	}

	revalidatePath('/')
	revalidatePath('/transactions')
	redirect('/transactions')
}

export async function deleteTransaction(
	id: number,
): Promise<{ error: string } | undefined> {
	try {
		await transactionService.delete(id)
	} catch (e) {
		return {
			error:
				e instanceof Error ? e.message : 'Error al eliminar la transacción',
		}
	}

	revalidatePath('/')
	revalidatePath('/transactions')
	redirect('/transactions')
}
