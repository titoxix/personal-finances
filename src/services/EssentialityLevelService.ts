import type { EssentialityLevel } from '@/domain/entities/essentiality-level'
import type {
	CreateEssentialityLevelInput,
	IEssentialityLevelRepository,
	UpdateEssentialityLevelInput,
} from '@/domain/repositories/IEssentialityLevelRepository'

export function createEssentialityLevelService(
	repo: IEssentialityLevelRepository,
) {
	return {
		findAll: (): Promise<EssentialityLevel[]> => repo.findAll(),

		findById: async (id: number): Promise<EssentialityLevel> => {
			const level = await repo.findById(id)
			if (!level) throw new Error('EssentialityLevel not found')
			return level
		},

		findByCode: (code: string): Promise<EssentialityLevel | null> =>
			repo.findByCode(code),

		create: async (
			input: CreateEssentialityLevelInput,
		): Promise<EssentialityLevel> => {
			const existing = await repo.findByCode(input.code)
			if (existing) throw new Error('EssentialityLevel code already exists')
			return repo.create(input)
		},

		update: async (
			id: number,
			input: UpdateEssentialityLevelInput,
		): Promise<EssentialityLevel> => {
			const existing = await repo.findById(id)
			if (!existing) throw new Error('EssentialityLevel not found')
			return repo.update(id, input)
		},

		deactivate: async (id: number): Promise<EssentialityLevel> => {
			const existing = await repo.findById(id)
			if (!existing) throw new Error('EssentialityLevel not found')
			return repo.deactivate(id)
		},
	}
}
