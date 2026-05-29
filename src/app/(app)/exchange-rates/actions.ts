'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
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
	const recordedAt = new Date(payload.recordedAt)
	const notes = payload.notes.trim() || undefined

	try {
		await exchangeRateService.create({
			source: 'itau',
			rateBuy: payload.itau.rateBuy ?? undefined,
			rateSell: payload.itau.rateSell ?? undefined,
			notes,
			recordedAt,
		})

		await exchangeRateService.create({
			source: 'ueno',
			rateBuy: payload.ueno.rateBuy ?? undefined,
			rateSell: payload.ueno.rateSell ?? undefined,
			notes,
			recordedAt,
		})

		if (payload.bcp.rateMid != null) {
			await exchangeRateService.create({
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
	try {
		await exchangeRateService.update(id, {
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
	try {
		await exchangeRateService.delete(id)
	} catch (e) {
		return {
			error: e instanceof Error ? e.message : 'Error al eliminar la tasa',
		}
	}
	revalidatePath('/exchange-rates')
	redirect('/exchange-rates')
}
