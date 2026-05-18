import type { PrismaClient } from '@/generated/prisma/client'
import type { Category } from '@/domain/entities/category'
import type {
	CreateCategoryInput,
	ICategoryRepository,
	UpdateCategoryInput,
} from '@/domain/repositories/ICategoryRepository'

export function createPrismaCategoryRepository(prisma: PrismaClient): ICategoryRepository {
	return {
		findAll: () => prisma.category.findMany(),
		findById: (id) => prisma.category.findUnique({ where: { id } }),
		findByCode: (code) => prisma.category.findUnique({ where: { code } }),
		create: (input: CreateCategoryInput) => prisma.category.create({ data: input }),
		update: (id: number, input: UpdateCategoryInput) =>
			prisma.category.update({ where: { id }, data: input }),
		deactivate: (id: number) =>
			prisma.category.update({ where: { id }, data: { active: false } }),
	}
}
