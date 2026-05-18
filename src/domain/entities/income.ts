import { z } from 'zod'

export const IncomeSchema = z.object({
	id: z.number(),
	month: z.date(),
	grossIncomeUsd: z.number(),
	budgetCapUsd: z.number(),
	automaticInvestmentUsd: z.number(),
	automaticDest: z.string(),
	exchangeRate: z.number(),
	notes: z.string().nullable(),
	createdAt: z.date(),
})
export type Income = z.infer<typeof IncomeSchema>
