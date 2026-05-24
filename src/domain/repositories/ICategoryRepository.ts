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
	findAll(): Promise<Category[]>
	findById(id: number): Promise<Category | null>
	findByCode(code: string): Promise<Category | null>
	create(input: CreateCategoryInput): Promise<Category>
	update(id: number, input: UpdateCategoryInput): Promise<Category>
	deactivate(id: number): Promise<Category>
}
