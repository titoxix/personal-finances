import { z } from 'zod'

export const PaymentMethodSchema = z.enum([
	'itau_visa',
	'ueno_mastercard',
	'itau_debito',
	'ueno_debito',
	'transferencia',
	'mango',
	'gnb_mastercard',
])
export type PaymentMethod = z.infer<typeof PaymentMethodSchema>

export const RecurringFrequencySchema = z.enum(['monthly', 'annual'])
export type RecurringFrequency = z.infer<typeof RecurringFrequencySchema>

export const RecurringItemSchema = z.object({
	id: z.number(),
	description: z.string(),
	amountGs: z.number().nullable(),
	amountUsd: z.number().nullable(),
	categoryId: z.number(),
	essentialityId: z.number(),
	paymentMethod: PaymentMethodSchema,
	frequency: RecurringFrequencySchema,
	billingDay: z.number().nullable(),
	billingMonth: z.number().nullable(),
	isVariable: z.boolean(),
	active: z.boolean(),
	notes: z.string().nullable(),
	createdAt: z.date(),
})
export type RecurringItem = z.infer<typeof RecurringItemSchema>

export const CreateRecurringItemSchema = z.object({
	description: z.string().min(1),
	categoryId: z.number().int().positive(),
	essentialityId: z.number().int().positive(),
	paymentMethod: PaymentMethodSchema,
	frequency: RecurringFrequencySchema,
	amountGs: z.number().positive().optional(),
	amountUsd: z.number().positive().optional(),
	billingDay: z.number().int().min(1).max(31).optional(),
	billingMonth: z.number().int().min(1).max(12).optional(),
	isVariable: z.boolean().optional(),
	notes: z.string().optional(),
})

export const UpdateRecurringItemSchema = z.object({
	description: z.string().min(1).optional(),
	amountGs: z.number().positive().nullable().optional(),
	amountUsd: z.number().positive().nullable().optional(),
	categoryId: z.number().int().positive().optional(),
	essentialityId: z.number().int().positive().optional(),
	paymentMethod: PaymentMethodSchema.optional(),
	frequency: RecurringFrequencySchema.optional(),
	billingDay: z.number().int().min(1).max(31).nullable().optional(),
	billingMonth: z.number().int().min(1).max(12).nullable().optional(),
	isVariable: z.boolean().optional(),
	notes: z.string().nullable().optional(),
})
