import type {
	CreateCategoryInput,
	ICategoryRepository,
	UpdateCategoryInput,
} from '@/domain/repositories/ICategoryRepository'
import type { PrismaClient } from '@/generated/prisma/client'

export function createPrismaCategoryRepository(
	prisma: PrismaClient,
): ICategoryRepository {
	return {
		findAll: (userId) => prisma.category.findMany({ where: { userId } }),
		findById: (userId, id) =>
			prisma.category.findUnique({ where: { id, userId } }),
		findByCode: (userId, code) =>
			prisma.category.findUnique({ where: { userId_code: { userId, code } } }),
		create: (userId, input: CreateCategoryInput) =>
			prisma.category.create({ data: { ...input, userId } }),
		update: (userId, id: number, input: UpdateCategoryInput) =>
			prisma.category.update({ where: { id, userId }, data: input }),
		deactivate: (userId, id: number) =>
			prisma.category.update({
				where: { id, userId },
				data: { active: false },
			}),
	}
}
