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
	findAll(): Promise<EssentialityLevel[]>
	findById(id: number): Promise<EssentialityLevel | null>
	findByCode(code: string): Promise<EssentialityLevel | null>
	create(input: CreateEssentialityLevelInput): Promise<EssentialityLevel>
	update(id: number, input: UpdateEssentialityLevelInput): Promise<EssentialityLevel>
	deactivate(id: number): Promise<EssentialityLevel>
}
