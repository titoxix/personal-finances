import type { Category } from '@/domain/entities/category'
import type {
	CreateCategoryInput,
	ICategoryRepository,
	UpdateCategoryInput,
} from '@/domain/repositories/ICategoryRepository'

export function createCategoryService(repo: ICategoryRepository) {
	return {
		findAll: (): Promise<Category[]> => repo.findAll(),

		findById: async (id: number): Promise<Category> => {
			const category = await repo.findById(id)
			if (!category) throw new Error('Category not found')
			return category
		},

		findByCode: (code: string): Promise<Category | null> =>
			repo.findByCode(code),

		create: async (input: CreateCategoryInput): Promise<Category> => {
			const existing = await repo.findByCode(input.code)
			if (existing) throw new Error('Category code already exists')
			return repo.create(input)
		},

		update: async (
			id: number,
			input: UpdateCategoryInput,
		): Promise<Category> => {
			const existing = await repo.findById(id)
			if (!existing) throw new Error('Category not found')
			return repo.update(id, input)
		},

		deactivate: async (id: number): Promise<Category> => {
			const existing = await repo.findById(id)
			if (!existing) throw new Error('Category not found')
			return repo.deactivate(id)
		},
	}
}
