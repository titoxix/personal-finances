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
