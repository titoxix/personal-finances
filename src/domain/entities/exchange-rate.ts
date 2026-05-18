import { z } from 'zod'

export const ExchangeRateSourceSchema = z.enum(['itau', 'ueno', 'bcp'])
export type ExchangeRateSource = z.infer<typeof ExchangeRateSourceSchema>

export const ExchangeRateSchema = z.object({
	id: z.number(),
	recordedAt: z.date(),
	source: ExchangeRateSourceSchema,
	rateBuy: z.number().nullable(),
	rateSell: z.number().nullable(),
	rateMid: z.number().nullable(),
	notes: z.string().nullable(),
	createdAt: z.date(),
})
export type ExchangeRate = z.infer<typeof ExchangeRateSchema>
