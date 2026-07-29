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
		findAll: (userId: string): Promise<EssentialityLevel[]> =>
			repo.findAll(userId),

		findById: async (
			userId: string,
			id: number,
		): Promise<EssentialityLevel> => {
			const level = await repo.findById(userId, id)
			if (!level) throw new Error('EssentialityLevel not found')
			return level
		},

		findByCode: (
			userId: string,
			code: string,
		): Promise<EssentialityLevel | null> => repo.findByCode(userId, code),

		create: async (
			userId: string,
			input: CreateEssentialityLevelInput,
		): Promise<EssentialityLevel> => {
			const existing = await repo.findByCode(userId, input.code)
			if (existing) throw new Error('EssentialityLevel code already exists')
			return repo.create(userId, input)
		},

		update: async (
			userId: string,
			id: number,
			input: UpdateEssentialityLevelInput,
		): Promise<EssentialityLevel> => {
			const existing = await repo.findById(userId, id)
			if (!existing) throw new Error('EssentialityLevel not found')
			return repo.update(userId, id, input)
		},

		deactivate: async (
			userId: string,
			id: number,
		): Promise<EssentialityLevel> => {
			const existing = await repo.findById(userId, id)
			if (!existing) throw new Error('EssentialityLevel not found')
			return repo.deactivate(userId, id)
		},
	}
}
