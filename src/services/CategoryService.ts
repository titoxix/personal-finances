import type { Category } from '@/domain/entities/category'
import type {
	CreateCategoryInput,
	ICategoryRepository,
	UpdateCategoryInput,
} from '@/domain/repositories/ICategoryRepository'

export function createCategoryService(repo: ICategoryRepository) {
	return {
		findAll: (userId: string): Promise<Category[]> => repo.findAll(userId),

		findById: async (userId: string, id: number): Promise<Category> => {
			const category = await repo.findById(userId, id)
			if (!category) throw new Error('Category not found')
			return category
		},

		findByCode: (userId: string, code: string): Promise<Category | null> =>
			repo.findByCode(userId, code),

		create: async (
			userId: string,
			input: CreateCategoryInput,
		): Promise<Category> => {
			const existing = await repo.findByCode(userId, input.code)
			if (existing) throw new Error('Category code already exists')
			return repo.create(userId, input)
		},

		update: async (
			userId: string,
			id: number,
			input: UpdateCategoryInput,
		): Promise<Category> => {
			const existing = await repo.findById(userId, id)
			if (!existing) throw new Error('Category not found')
			return repo.update(userId, id, input)
		},

		deactivate: async (userId: string, id: number): Promise<Category> => {
			const existing = await repo.findById(userId, id)
			if (!existing) throw new Error('Category not found')
			return repo.deactivate(userId, id)
		},
	}
}
