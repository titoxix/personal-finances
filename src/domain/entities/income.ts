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

export const CreateIncomeSchema = z.object({
	month: z.coerce.date(),
	grossIncomeUsd: z.number().positive(),
	budgetCapUsd: z.number().positive(),
	automaticInvestmentUsd: z.number().min(0),
	automaticDest: z.string().min(1),
	exchangeRate: z.number().positive(),
	notes: z.string().optional(),
})

export const UpdateIncomeSchema = z.object({
	grossIncomeUsd: z.number().positive().optional(),
	budgetCapUsd: z.number().positive().optional(),
	automaticInvestmentUsd: z.number().min(0).optional(),
	automaticDest: z.string().min(1).optional(),
	exchangeRate: z.number().positive().optional(),
	notes: z.string().optional(),
})
