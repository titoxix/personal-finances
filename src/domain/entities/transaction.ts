import { z } from 'zod'
import { PaymentMethodSchema } from '@/domain/entities/recurring-item'

export const TransactionSchema = z.object({
	id: z.number(),
	date: z.date(),
	description: z.string(),
	amountGs: z.number().nullable(),
	amountUsd: z.number().nullable(),
	exchangeRateValue: z.number().nullable(),
	exchangeRateId: z.number().nullable(),
	categoryId: z.number(),
	essentialityId: z.number(),
	paymentMethod: PaymentMethodSchema,
	weekOfMonth: z.number().nullable(),
	isInstallment: z.boolean(),
	installmentCurrent: z.number().nullable(),
	installmentTotal: z.number().nullable(),
	installmentPlanId: z.number().nullable(),
	isRecurring: z.boolean(),
	notes: z.string().nullable(),
	createdAt: z.date(),
})
export type Transaction = z.infer<typeof TransactionSchema>
