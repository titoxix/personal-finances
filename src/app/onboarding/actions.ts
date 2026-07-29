'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { CompleteOnboardingSchema } from '@/domain/entities/user'
import { requireUser } from '@/lib/auth-helpers'
import {
	categoryService,
	essentialityService,
	userService,
} from '@/lib/container'
import {
	DEFAULT_CATEGORIES,
	DEFAULT_ESSENTIALITY_LEVELS,
} from '@/lib/default-catalog'

async function seedDefaultsIfEmpty(userId: string): Promise<void> {
	const [categories, essentialityLevels] = await Promise.all([
		categoryService.findAll(userId),
		essentialityService.findAll(userId),
	])

	if (categories.length === 0) {
		for (const category of DEFAULT_CATEGORIES) {
			await categoryService.create(userId, category)
		}
	}

	if (essentialityLevels.length === 0) {
		for (const level of DEFAULT_ESSENTIALITY_LEVELS) {
			await essentialityService.create(userId, level)
		}
	}
}

export async function completeOnboarding(
	_prevState: { error: string } | null,
	formData: FormData,
): Promise<{ error: string }> {
	const user = await requireUser()

	const parsed = CompleteOnboardingSchema.safeParse({
		firstName: formData.get('firstName'),
		lastName: formData.get('lastName'),
		country: formData.get('country'),
	})
	if (!parsed.success) {
		return { error: 'Completá todos los campos' }
	}

	const { firstName, lastName, country } = parsed.data
	await userService.update(user.id, {
		firstName,
		lastName,
		name: `${firstName} ${lastName}`,
		country,
	})
	await seedDefaultsIfEmpty(user.id)

	revalidatePath('/')
	redirect('/')
}
