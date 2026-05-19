import { z } from 'zod'

export const EssentialityLevelSchema = z.object({
	id: z.number(),
	code: z.string(),
	label: z.string(),
	description: z.string().nullable(),
	sortOrder: z.number(),
	active: z.boolean(),
	createdAt: z.date(),
})
export type EssentialityLevel = z.infer<typeof EssentialityLevelSchema>

export const CreateEssentialityLevelSchema = z.object({
	code: z.string().min(1),
	label: z.string().min(1),
	sortOrder: z.number().int().min(0),
	description: z.string().optional(),
})

export const UpdateEssentialityLevelSchema = z.object({
	label: z.string().min(1).optional(),
	description: z.string().optional(),
	sortOrder: z.number().int().min(0).optional(),
})
