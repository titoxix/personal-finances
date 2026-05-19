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

export const CreateBudgetSchema = z.object({
	month: z.coerce.date(),
	categoryId: z.number().int().positive(),
	essentialityId: z.number().int().positive(),
	budgetedUsd: z.number().positive().optional(),
	budgetedGs: z.number().positive().optional(),
	notes: z.string().optional(),
})

export const UpdateBudgetSchema = z.object({
	budgetedUsd: z.number().positive().nullable().optional(),
	budgetedGs: z.number().positive().nullable().optional(),
	essentialityId: z.number().int().positive().optional(),
	notes: z.string().nullable().optional(),
})
