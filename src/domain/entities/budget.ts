import { z } from 'zod'

export const BudgetSchema = z.object({
	id: z.number(),
	month: z.date(),
	categoryId: z.number(),
	essentialityId: z.number().nullable(),
	budgetedUsd: z.number().nullable(),
	budgetedGs: z.number().nullable(),
	marginUsd: z.number().nullable(),
	marginGs: z.number().nullable(),
	isRecurring: z.boolean(),
	notes: z.string().nullable(),
	deletedAt: z.date().nullable(),
	deleteReason: z.string().nullable(),
	createdAt: z.date(),
})
export type Budget = z.infer<typeof BudgetSchema>

export const BudgetCurrencySchema = z.enum(['USD', 'GS'])
export type BudgetCurrency = z.infer<typeof BudgetCurrencySchema>

export const BudgetInputSchema = z.object({
	month: z.coerce.date(),
	categoryId: z.number().int().positive(),
	currency: BudgetCurrencySchema,
	margin: z.number().nonnegative(),
	isRecurring: z.boolean().optional(),
	notes: z.string().optional(),
})
export type BudgetInput = z.infer<typeof BudgetInputSchema>

export const CreateBudgetSchema = z.object({
	month: z.coerce.date(),
	categoryId: z.number().int().positive(),
	essentialityId: z.number().int().positive().nullable(),
	budgetedUsd: z.number().positive().optional(),
	budgetedGs: z.number().positive().optional(),
	currency: BudgetCurrencySchema.optional(),
	margin: z.number().nonnegative().optional(),
	isRecurring: z.boolean().optional(),
	notes: z.string().optional(),
})

export const UpdateBudgetSchema = z.object({
	budgetedUsd: z.number().positive().nullable().optional(),
	budgetedGs: z.number().positive().nullable().optional(),
	essentialityId: z.number().int().positive().nullable().optional(),
	currency: BudgetCurrencySchema.optional(),
	margin: z.number().nonnegative().optional(),
	isRecurring: z.boolean().optional(),
	notes: z.string().nullable().optional(),
})
