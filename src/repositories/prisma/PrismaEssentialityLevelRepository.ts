import type { PrismaClient } from '@/generated/prisma/client'
import type { EssentialityLevel } from '@/domain/entities/essentiality-level'
import type {
	CreateEssentialityLevelInput,
	IEssentialityLevelRepository,
	UpdateEssentialityLevelInput,
} from '@/domain/repositories/IEssentialityLevelRepository'

export class PrismaEssentialityLevelRepository implements IEssentialityLevelRepository {
	constructor(private readonly prisma: PrismaClient) {}

	async findAll(): Promise<EssentialityLevel[]> {
		return this.prisma.essentialityLevel.findMany({
			orderBy: { sortOrder: 'asc' },
		})
	}

	async findById(id: number): Promise<EssentialityLevel | null> {
		return this.prisma.essentialityLevel.findUnique({ where: { id } })
	}

	async findByCode(code: string): Promise<EssentialityLevel | null> {
		return this.prisma.essentialityLevel.findUnique({ where: { code } })
	}

	async create(input: CreateEssentialityLevelInput): Promise<EssentialityLevel> {
		return this.prisma.essentialityLevel.create({ data: input })
	}

	async update(id: number, input: UpdateEssentialityLevelInput): Promise<EssentialityLevel> {
		return this.prisma.essentialityLevel.update({ where: { id }, data: input })
	}

	async deactivate(id: number): Promise<EssentialityLevel> {
		return this.prisma.essentialityLevel.update({ where: { id }, data: { active: false } })
	}
}
