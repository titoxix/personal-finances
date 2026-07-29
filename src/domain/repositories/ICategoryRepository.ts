import type { Category } from '@/domain/entities/category'

export type CreateCategoryInput = {
	code: string
	label: string
	description?: string
}

export type UpdateCategoryInput = {
	label?: string
	description?: string
	active?: boolean
}

export interface ICategoryRepository {
	findAll(userId: string): Promise<Category[]>
	findById(userId: string, id: number): Promise<Category | null>
	findByCode(userId: string, code: string): Promise<Category | null>
	create(userId: string, input: CreateCategoryInput): Promise<Category>
	update(
		userId: string,
		id: number,
		input: UpdateCategoryInput,
	): Promise<Category>
	deactivate(userId: string, id: number): Promise<Category>
}
