import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { EssentialityLevel } from '@/domain/entities/essentiality-level'
import type { IEssentialityLevelRepository } from '@/domain/repositories/IEssentialityLevelRepository'
import { createEssentialityLevelService } from './EssentialityLevelService'

const USER_ID = 'user-1'

const makeRepo = (): IEssentialityLevelRepository => ({
	findAll: vi.fn(),
	findById: vi.fn(),
	findByCode: vi.fn(),
	create: vi.fn(),
	update: vi.fn(),
	deactivate: vi.fn(),
})

const makeLevel = (
	overrides: Partial<EssentialityLevel> = {},
): EssentialityLevel => ({
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
			const levels = [
				makeLevel(),
				makeLevel({ id: 2, code: 'optional', label: 'Opcional', sortOrder: 2 }),
			]
			vi.mocked(repo.findAll).mockResolvedValue(levels)

			const result = await service.findAll(USER_ID)

			expect(result).toBe(levels)
			expect(repo.findAll).toHaveBeenCalledWith(USER_ID)
		})
	})

	describe('findById', () => {
		it('returns the level when it exists', async () => {
			const level = makeLevel()
			vi.mocked(repo.findById).mockResolvedValue(level)

			const result = await service.findById(USER_ID, 1)

			expect(result).toBe(level)
		})

		it('throws when level does not exist', async () => {
			vi.mocked(repo.findById).mockResolvedValue(null)

			await expect(service.findById(USER_ID, 999)).rejects.toThrow(
				'EssentialityLevel not found',
			)
		})
	})

	describe('findByCode', () => {
		it('returns the level when code matches', async () => {
			const level = makeLevel()
			vi.mocked(repo.findByCode).mockResolvedValue(level)

			const result = await service.findByCode(USER_ID, 'essential')

			expect(result).toBe(level)
		})

		it('returns null when code does not exist', async () => {
			vi.mocked(repo.findByCode).mockResolvedValue(null)

			const result = await service.findByCode(USER_ID, 'inexistente')

			expect(result).toBeNull()
		})
	})

	describe('create', () => {
		it('creates and returns the new level', async () => {
			const level = makeLevel()
			vi.mocked(repo.findByCode).mockResolvedValue(null)
			vi.mocked(repo.create).mockResolvedValue(level)

			const result = await service.create(USER_ID, {
				code: 'essential',
				label: 'Esencial',
				sortOrder: 1,
			})

			expect(result).toBe(level)
			expect(repo.create).toHaveBeenCalledWith(USER_ID, {
				code: 'essential',
				label: 'Esencial',
				sortOrder: 1,
			})
		})

		it('throws when code is already taken', async () => {
			vi.mocked(repo.findByCode).mockResolvedValue(makeLevel())

			await expect(
				service.create(USER_ID, {
					code: 'essential',
					label: 'Esencial',
					sortOrder: 1,
				}),
			).rejects.toThrow('EssentialityLevel code already exists')
		})
	})

	describe('update', () => {
		it('updates and returns the level', async () => {
			const existing = makeLevel()
			const updated = makeLevel({ label: 'Esencial actualizado' })
			vi.mocked(repo.findById).mockResolvedValue(existing)
			vi.mocked(repo.update).mockResolvedValue(updated)

			const result = await service.update(USER_ID, 1, {
				label: 'Esencial actualizado',
			})

			expect(result).toBe(updated)
			expect(repo.update).toHaveBeenCalledWith(USER_ID, 1, {
				label: 'Esencial actualizado',
			})
		})

		it('throws when level does not exist', async () => {
			vi.mocked(repo.findById).mockResolvedValue(null)

			await expect(
				service.update(USER_ID, 999, { label: 'x' }),
			).rejects.toThrow('EssentialityLevel not found')
		})
	})

	describe('deactivate', () => {
		it('deactivates and returns the level', async () => {
			const existing = makeLevel()
			const deactivated = makeLevel({ active: false })
			vi.mocked(repo.findById).mockResolvedValue(existing)
			vi.mocked(repo.deactivate).mockResolvedValue(deactivated)

			const result = await service.deactivate(USER_ID, 1)

			expect(result).toBe(deactivated)
			expect(repo.deactivate).toHaveBeenCalledWith(USER_ID, 1)
		})

		it('throws when level does not exist', async () => {
			vi.mocked(repo.findById).mockResolvedValue(null)

			await expect(service.deactivate(USER_ID, 999)).rejects.toThrow(
				'EssentialityLevel not found',
			)
		})
	})
})
