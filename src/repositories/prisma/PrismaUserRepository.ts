import type {
	IUserRepository,
	UpdateUserInput,
} from '@/domain/repositories/IUserRepository'
import type { PrismaClient } from '@/generated/prisma/client'

export function createPrismaUserRepository(
	prisma: PrismaClient,
): IUserRepository {
	return {
		findById: (id) => prisma.user.findUnique({ where: { id } }),
		findAllPaginated: async (page, pageSize) => {
			const [users, total] = await Promise.all([
				prisma.user.findMany({
					orderBy: { createdAt: 'desc' },
					skip: (page - 1) * pageSize,
					take: pageSize,
				}),
				prisma.user.count(),
			])
			return { users, total }
		},
		update: (id, input: UpdateUserInput) =>
			prisma.user.update({ where: { id }, data: input }),
	}
}
