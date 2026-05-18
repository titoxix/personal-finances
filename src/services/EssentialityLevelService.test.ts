import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { EssentialityLevel } from '@/domain/entities/essentiality-level'
import type { IEssentialityLevelRepository } from '@/domain/repositories/IEssentialityLevelRepository'
import { createEssentialityLevelService } from './EssentialityLevelService'

const makeRepo = (): IEssentialityLevelRepository => ({
	findAll: vi.fn(),
	findById: vi.fn(),
	findByCode: vi.fn(),
	create: vi.fn(),
	update: vi.fn(),
	deactivate: vi.fn(),
})

const makeLevel = (overrides: Partial<EssentialityLevel> = {}): EssentialityLevel => ({
	id: 1,
	code: 'essential',
	label: 'Esencial',
	description: null,
	sortOrder: 1,
	active: true,
	createdAt: new Date(),
	...overrides,
})

describe('createEssentialityLevelService', () => {
	let repo: IEssentialityLevelRepository
	let service: ReturnType<typeof createEssentialityLevelService>

	beforeEach(() => {
		repo = makeRepo()
		service = createEssentialityLevelService(repo)
	})

	describe('findAll', () => {
		it('returns all levels from repository', async () => {
			const levels = [makeLevel(), makeLevel({ id: 2, code: 'optional', label: 'Opcional', sortOrder: 2 })]
			vi.mocked(repo.findAll).mockResolvedValue(levels)

			const result = await service.findAll()

			expect(result).toBe(levels)
			expect(repo.findAll).toHaveBeenCalledOnce()
		})
	})

	describe('findById', () => {
		it('returns the level when it exists', async () => {
			const level = makeLevel()
			vi.mocked(repo.findById).mockResolvedValue(level)

			const result = await service.findById(1)

			expect(result).toBe(level)
		})

		it('throws when level does not exist', async () => {
			vi.mocked(repo.findById).mockResolvedValue(null)

			await expect(service.findById(999)).rejects.toThrow('EssentialityLevel not found')
		})
	})

	describe('findByCode', () => {
		it('returns the level when code matches', async () => {
			const level = makeLevel()
			vi.mocked(repo.findByCode).mockResolvedValue(level)

			const result = await service.findByCode('essential')

			expect(result).toBe(level)
		})

		it('returns null when code does not exist', async () => {
			vi.mocked(repo.findByCode).mockResolvedValue(null)

			const result = await service.findByCode('inexistente')

			expect(result).toBeNull()
		})
	})

	describe('create', () => {
		it('creates and returns the new level', async () => {
			const level = makeLevel()
			vi.mocked(repo.findByCode).mockResolvedValue(null)
			vi.mocked(repo.create).mockResolvedValue(level)

			const result = await service.create({ code: 'essential', label: 'Esencial', sortOrder: 1 })

			expect(result).toBe(level)
			expect(repo.create).toHaveBeenCalledWith({ code: 'essential', label: 'Esencial', sortOrder: 1 })
		})

		it('throws when code is already taken', async () => {
			vi.mocked(repo.findByCode).mockResolvedValue(makeLevel())

			await expect(
				service.create({ code: 'essential', label: 'Esencial', sortOrder: 1 }),
			).rejects.toThrow('EssentialityLevel code already exists')
		})
	})

	describe('update', () => {
		it('updates and returns the level', async () => {
			const existing = makeLevel()
			const updated = makeLevel({ label: 'Esencial actualizado' })
			vi.mocked(repo.findById).mockResolvedValue(existing)
			vi.mocked(repo.update).mockResolvedValue(updated)

			const result = await service.update(1, { label: 'Esencial actualizado' })

			expect(result).toBe(updated)
			expect(repo.update).toHaveBeenCalledWith(1, { label: 'Esencial actualizado' })
		})

		it('throws when level does not exist', async () => {
			vi.mocked(repo.findById).mockResolvedValue(null)

			await expect(service.update(999, { label: 'x' })).rejects.toThrow('EssentialityLevel not found')
		})
	})

	describe('deactivate', () => {
		it('deactivates and returns the level', async () => {
			const existing = makeLevel()
			const deactivated = makeLevel({ active: false })
			vi.mocked(repo.findById).mockResolvedValue(existing)
			vi.mocked(repo.deactivate).mockResolvedValue(deactivated)

			const result = await service.deactivate(1)

			expect(result).toBe(deactivated)
			expect(repo.deactivate).toHaveBeenCalledWith(1)
		})

		it('throws when level does not exist', async () => {
			vi.mocked(repo.findById).mockResolvedValue(null)

			await expect(service.deactivate(999)).rejects.toThrow('EssentialityLevel not found')
		})
	})
})
