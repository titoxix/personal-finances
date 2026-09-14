import { z } from 'zod'

export const UserRoleSchema = z.enum(['USER', 'ADMIN'])
export type UserRole = z.infer<typeof UserRoleSchema>

export const UserSchema = z.object({
	id: z.string(),
	email: z.string(),
	name: z.string().nullable(),
	firstName: z.string().nullable(),
	lastName: z.string().nullable(),
	country: z.string().nullable(),
	role: UserRoleSchema,
	createdAt: z.date(),
})
export type User = z.infer<typeof UserSchema>

export const CompleteOnboardingSchema = z.object({
	firstName: z.string().min(1),
	lastName: z.string().min(1),
	country: z.string().min(1),
})
export type CompleteOnboardingInput = z.infer<typeof CompleteOnboardingSchema>
