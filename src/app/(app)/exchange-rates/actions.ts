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
