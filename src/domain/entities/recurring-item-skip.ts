import { z } from 'zod'

export const RecurringItemSkipSchema = z.object({
	id: z.number(),
	recurringItemId: z.number(),
	month: z.date(),
	reason: z.string(),
	createdAt: z.date(),
})
export type RecurringItemSkip = z.infer<typeof RecurringItemSkipSchema>

export const CreateRecurringItemSkipSchema = z.object({
	recurringItemId: z.number().int().positive(),
	month: z.coerce.date(),
	reason: z.string().min(1).max(255),
})
