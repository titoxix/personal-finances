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

export const CreateInstallmentPlanSchema = z.object({
	description: z.string().min(1),
	installmentsTotal: z.number().int().min(1),
	startDate: z.coerce.date(),
	paymentMethod: PaymentMethodSchema,
	categoryId: z.number().int().positive(),
	essentialityId: z.number().int().positive(),
	totalAmountGs: z.number().positive().optional(),
	totalAmountUsd: z.number().positive().optional(),
	installmentAmountGs: z.number().positive().optional(),
	endDate: z.coerce.date().optional(),
	notes: z.string().optional(),
})

export const UpdateInstallmentPlanSchema = z.object({
	description: z.string().min(1).optional(),
	installmentsPaid: z.number().int().min(0).optional(),
	totalAmountGs: z.number().positive().nullable().optional(),
	totalAmountUsd: z.number().positive().nullable().optional(),
	installmentAmountGs: z.number().positive().nullable().optional(),
	endDate: z.coerce.date().nullable().optional(),
	paymentMethod: PaymentMethodSchema.optional(),
	categoryId: z.number().int().positive().optional(),
	essentialityId: z.number().int().positive().optional(),
	notes: z.string().nullable().optional(),
})
