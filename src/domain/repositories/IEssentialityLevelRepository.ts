import type { EssentialityLevel } from '@/domain/entities/essentiality-level'

export type CreateEssentialityLevelInput = {
	code: string
	label: string
	sortOrder: number
	description?: string
}

export type UpdateEssentialityLevelInput = {
	label?: string
	description?: string
	sortOrder?: number
}

export interface IEssentialityLevelRepository {
	findAll(userId: string): Promise<EssentialityLevel[]>
	findById(userId: string, id: number): Promise<EssentialityLevel | null>
	findByCode(userId: string, code: string): Promise<EssentialityLevel | null>
	create(
		userId: string,
		input: CreateEssentialityLevelInput,
	): Promise<EssentialityLevel>
	update(
		userId: string,
		id: number,
		input: UpdateEssentialityLevelInput,
	): Promise<EssentialityLevel>
	deactivate(userId: string, id: number): Promise<EssentialityLevel>
}
