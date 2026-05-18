import type { PrismaClient } from '@/generated/prisma/client'
import type { Category } from '@/domain/entities/category'
import type {
	CreateCategoryInput,
	ICategoryRepository,
	UpdateCategoryInput,
} from '@/domain/repositories/ICategoryRepository'

export class PrismaCategoryRepository implements ICategoryRepository {
	constructor(private readonly prisma: PrismaClient) {}

	async findAll(): Promise<Category[]> {
		return this.prisma.category.findMany()
	}

	async findById(id: number): Promise<Category | null> {
		return this.prisma.category.findUnique({ where: { id } })
	}

	async findByCode(code: string): Promise<Category | null> {
		return this.prisma.category.findUnique({ where: { code } })
	}

	async create(input: CreateCategoryInput): Promise<Category> {
		return this.prisma.category.create({ data: input })
	}

	async update(id: number, input: UpdateCategoryInput): Promise<Category> {
		return this.prisma.category.update({ where: { id }, data: input })
	}

	async deactivate(id: number): Promise<Category> {
		return this.prisma.category.update({ where: { id }, data: { active: false } })
	}
}
