import { z } from 'zod'

export const CategorySchema = z.object({
	id: z.number(),
	code: z.string(),
	label: z.string(),
	description: z.string().nullable(),
	active: z.boolean(),
	createdAt: z.date(),
})
export type Category = z.infer<typeof CategorySchema>

export const CreateCategorySchema = z.object({
	code: z.string().min(1),
	label: z.string().min(1),
	description: z.string().optional(),
})

export const UpdateCategorySchema = z.object({
	label: z.string().min(1).optional(),
	description: z.string().optional(),
	active: z.boolean().optional(),
})
