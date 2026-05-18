import { z } from 'zod'
import { PaymentMethodSchema } from '@/domain/entities/recurring-item'

export const InstallmentPlanSchema = z.object({
	id: z.number(),
	description: z.string(),
	totalAmountGs: z.number().nullable(),
	totalAmountUsd: z.number().nullable(),
	installmentsTotal: z.number(),
	installmentsPaid: z.number(),
	installmentAmountGs: z.number().nullable(),
	startDate: z.date(),
	endDate: z.date().nullable(),
	paymentMethod: PaymentMethodSchema,
	categoryId: z.number(),
	essentialityId: z.number(),
	active: z.boolean(),
	notes: z.string().nullable(),
	createdAt: z.date(),
})
export type InstallmentPlan = z.infer<typeof InstallmentPlanSchema>
