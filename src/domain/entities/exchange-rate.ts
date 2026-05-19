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

export const CreateExchangeRateSchema = z.object({
	source: ExchangeRateSourceSchema,
	rateBuy: z.number().positive().optional(),
	rateSell: z.number().positive().optional(),
	rateMid: z.number().positive().optional(),
	notes: z.string().optional(),
	recordedAt: z.coerce.date().optional(),
})
