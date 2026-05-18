import { z } from 'zod'

export const BudgetSchema = z.object({
	id: z.number(),
	month: z.date(),
	categoryId: z.number(),
	essentialityId: z.number(),
	budgetedUsd: z.number().nullable(),
	budgetedGs: z.number().nullable(),
	notes: z.string().nullable(),
	createdAt: z.date(),
})
export type Budget = z.infer<typeof BudgetSchema>
