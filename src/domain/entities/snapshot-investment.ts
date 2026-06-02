import { z } from 'zod'

export const CurrencySchema = z.enum(['USD', 'GS'])
export type Currency = z.infer<typeof CurrencySchema>

export const SnapshotInvestmentSchema = z.object({
	id: z.number(),
	snapshotId: z.number(),
	name: z.string(),
	currency: CurrencySchema,
	value: z.number(),
	returnPct: z.number().nullable(),
	createdAt: z.date(),
})
export type SnapshotInvestment = z.infer<typeof SnapshotInvestmentSchema>

export const CreateSnapshotInvestmentSchema = z.object({
	name: z.string().min(1).max(100),
	currency: CurrencySchema,
	value: z.number().nonnegative(),
	returnPct: z.number().optional(),
})
export type CreateSnapshotInvestmentInput = z.infer<
	typeof CreateSnapshotInvestmentSchema
>

export const UpdateSnapshotInvestmentSchema =
	CreateSnapshotInvestmentSchema.partial().extend({
		returnPct: z.number().nullable().optional(),
	})
export type UpdateSnapshotInvestmentInput = z.infer<
	typeof UpdateSnapshotInvestmentSchema
>
