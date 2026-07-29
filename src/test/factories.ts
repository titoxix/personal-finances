import type { PrismaClient } from '@/generated/prisma/client'

let counter = 0

export async function createTestUser(
	prisma: PrismaClient,
	overrides: { email?: string; role?: 'USER' | 'ADMIN' } = {},
) {
	counter += 1
	return prisma.user.create({
		data: {
			email: overrides.email ?? `test-user-${counter}@example.com`,
			role: overrides.role ?? 'USER',
		},
	})
}
