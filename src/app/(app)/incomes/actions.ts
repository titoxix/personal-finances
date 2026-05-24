'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { incomeService } from '@/lib/container'

export type CreateIncomePayload = {
	month: string // 'YYYY-MM'
	grossIncomeUsd: number
	budgetCapUsd: number
	automaticInvestmentUsd: number
	automaticDest: string
	exchangeRate: number
	notes?: string
}

export type UpdateIncomePayload = {
	grossIncomeUsd: number
	budgetCapUsd: number
	automaticInvestmentUsd: number
	automaticDest: string
	exchangeRate: number
	notes?: string
}

function parseMonthDate(s: string): Date {
	const [y, m] = s.split('-')
	return new Date(Date.UTC(Number(y), Number(m) - 1, 1))
}

export async function createIncome(
	payload: CreateIncomePayload,
): Promise<{ error: string } | undefined> {
	try {
		await incomeService.create({
			month: parseMonthDate(payload.month),
			grossIncomeUsd: payload.grossIncomeUsd,
			budgetCapUsd: payload.budgetCapUsd,
			automaticInvestmentUsd: payload.automaticInvestmentUsd,
			automaticDest: payload.automaticDest,
			exchangeRate: payload.exchangeRate,
			notes: payload.notes,
		})
	} catch (e) {
		return {
			error: e instanceof Error ? e.message : 'Error al registrar el ingreso',
		}
	}
	revalidatePath('/incomes')
	revalidatePath('/')
	redirect('/incomes')
}

export async function updateIncome(
	id: number,
	payload: UpdateIncomePayload,
): Promise<{ error: string } | undefined> {
	try {
		await incomeService.update(id, {
			grossIncomeUsd: payload.grossIncomeUsd,
			budgetCapUsd: payload.budgetCapUsd,
			automaticInvestmentUsd: payload.automaticInvestmentUsd,
			automaticDest: payload.automaticDest,
			exchangeRate: payload.exchangeRate,
			notes: payload.notes,
		})
	} catch (e) {
		return {
			error: e instanceof Error ? e.message : 'Error al actualizar el ingreso',
		}
	}
	revalidatePath('/incomes')
	revalidatePath('/')
	redirect('/incomes')
}
