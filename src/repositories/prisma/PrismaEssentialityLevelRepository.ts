import type { PrismaClient } from '@/generated/prisma/client'
import type { EssentialityLevel } from '@/domain/entities/essentiality-level'
import type {
	CreateEssentialityLevelInput,
	IEssentialityLevelRepository,
	UpdateEssentialityLevelInput,
} from '@/domain/repositories/IEssentialityLevelRepository'

export function createPrismaEssentialityLevelRepository(
	prisma: PrismaClient,
): IEssentialityLevelRepository {
	return {
		findAll: () => prisma.essentialityLevel.findMany({ orderBy: { sortOrder: 'asc' } }),
		findById: (id) => prisma.essentialityLevel.findUnique({ where: { id } }),
		findByCode: (code) => prisma.essentialityLevel.findUnique({ where: { code } }),
		create: (input: CreateEssentialityLevelInput) =>
			prisma.essentialityLevel.create({ data: input }),
		update: (id: number, input: UpdateEssentialityLevelInput) =>
			prisma.essentialityLevel.update({ where: { id }, data: input }),
		deactivate: (id: number) =>
			prisma.essentialityLevel.update({ where: { id }, data: { active: false } }),
	}
}
