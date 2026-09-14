import type {
	CreateEssentialityLevelInput,
	IEssentialityLevelRepository,
	UpdateEssentialityLevelInput,
} from '@/domain/repositories/IEssentialityLevelRepository'
import type { PrismaClient } from '@/generated/prisma/client'

export function createPrismaEssentialityLevelRepository(
	prisma: PrismaClient,
): IEssentialityLevelRepository {
	return {
		findAll: (userId) =>
			prisma.essentialityLevel.findMany({
				where: { userId },
				orderBy: { sortOrder: 'asc' },
			}),
		findById: (userId, id) =>
			prisma.essentialityLevel.findUnique({ where: { id, userId } }),
		findByCode: (userId, code) =>
			prisma.essentialityLevel.findUnique({
				where: { userId_code: { userId, code } },
			}),
		create: (userId, input: CreateEssentialityLevelInput) =>
			prisma.essentialityLevel.create({ data: { ...input, userId } }),
		update: (userId, id: number, input: UpdateEssentialityLevelInput) =>
			prisma.essentialityLevel.update({ where: { id, userId }, data: input }),
		deactivate: (userId, id: number) =>
			prisma.essentialityLevel.update({
				where: { id, userId },
				data: { active: false },
			}),
	}
}
