'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { requireUser } from '@/lib/auth-helpers'
import { exchangeRateService } from '@/lib/container'

export type CreateExchangeRatesPayload = {
	itau: { rateBuy: number | null; rateSell: number | null }
	ueno: { rateBuy: number | null; rateSell: number | null }
	bcp: { rateMid: number | null }
	notes: string
	recordedAt: string
}

export async function createExchangeRates(
	payload: CreateExchangeRatesPayload,
): Promise<{ error: string } | undefined> {
	const user = await requireUser()
	const recordedAt = new Date(payload.recordedAt)
	const notes = payload.notes.trim() || undefined

	try {
		await exchangeRateService.create(user.id, {
			source: 'itau',
			rateBuy: payload.itau.rateBuy ?? undefined,
			rateSell: payload.itau.rateSell ?? undefined,
			notes,
			recordedAt,
		})

		await exchangeRateService.create(user.id, {
			source: 'ueno',
			rateBuy: payload.ueno.rateBuy ?? undefined,
			rateSell: payload.ueno.rateSell ?? undefined,
			notes,
			recordedAt,
		})

		if (payload.bcp.rateMid != null) {
			await exchangeRateService.create(user.id, {
				source: 'bcp',
				rateMid: payload.bcp.rateMid,
				notes,
				recordedAt,
			})
		}
	} catch (e) {
		return {
			error: e instanceof Error ? e.message : 'Error al guardar las tasas',
		}
	}

	revalidatePath('/exchange-rates')
	redirect('/exchange-rates')
}

export type UpdateExchangeRatePayload = {
	rateBuy: number | null
	rateSell: number | null
	rateMid: number | null
	notes: string
	recordedAt: string
}

export async function updateExchangeRate(
	id: number,
	payload: UpdateExchangeRatePayload,
): Promise<{ error: string } | undefined> {
	const user = await requireUser()
	try {
		await exchangeRateService.update(user.id, id, {
			rateBuy: payload.rateBuy ?? undefined,
			rateSell: payload.rateSell ?? undefined,
			rateMid: payload.rateMid ?? undefined,
			notes: payload.notes.trim() || undefined,
			recordedAt: new Date(payload.recordedAt),
		})
	} catch (e) {
		return {
			error: e instanceof Error ? e.message : 'Error al actualizar la tasa',
		}
	}
	revalidatePath('/exchange-rates')
	redirect('/exchange-rates')
}

export async function deleteExchangeRate(
	id: number,
): Promise<{ error: string } | undefined> {
	const user = await requireUser()
	try {
		await exchangeRateService.delete(user.id, id)
	} catch (e) {
		return {
			error: e instanceof Error ? e.message : 'Error al eliminar la tasa',
		}
	}
	revalidatePath('/exchange-rates')
	redirect('/exchange-rates')
}
