import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Category } from '@/domain/entities/category'
import type { ICategoryRepository } from '@/domain/repositories/ICategoryRepository'
import { createCategoryService } from './CategoryService'

const USER_ID = 'user-1'

const makeRepo = (): ICategoryRepository => ({
	findAll: vi.fn(),
	findById: vi.fn(),
	findByCode: vi.fn(),
	create: vi.fn(),
	update: vi.fn(),
	deactivate: vi.fn(),
})

const makeCategory = (overrides: Partial<Category> = {}): Category => ({
	id: 1,
	code: 'alimentacion',
	label: 'Alimentación',
	description: null,
	active: true,
	createdAt: new Date(),
	...overrides,
})

describe('createCategoryService', () => {
	let repo: ICategoryRepository
	let service: ReturnType<typeof createCategoryService>

	beforeEach(() => {
		repo = makeRepo()
		service = createCategoryService(repo)
	})

	describe('findAll', () => {
		it('returns all categories from repository', async () => {
			const categories = [
				makeCategory(),
				makeCategory({ id: 2, code: 'vivienda', label: 'Vivienda' }),
			]
			vi.mocked(repo.findAll).mockResolvedValue(categories)

			const result = await service.findAll(USER_ID)

			expect(result).toBe(categories)
			expect(repo.findAll).toHaveBeenCalledWith(USER_ID)
		})
	})

	describe('findById', () => {
		it('returns the category when it exists', async () => {
			const category = makeCategory()
			vi.mocked(repo.findById).mockResolvedValue(category)

			const result = await service.findById(USER_ID, 1)

			expect(result).toBe(category)
			expect(repo.findById).toHaveBeenCalledWith(USER_ID, 1)
		})

		it('throws when category does not exist', async () => {
			vi.mocked(repo.findById).mockResolvedValue(null)

			await expect(service.findById(USER_ID, 999)).rejects.toThrow(
				'Category not found',
			)
		})
	})

	describe('findByCode', () => {
		it('returns the category when code matches', async () => {
			const category = makeCategory()
			vi.mocked(repo.findByCode).mockResolvedValue(category)

			const result = await service.findByCode(USER_ID, 'alimentacion')

			expect(result).toBe(category)
		})

		it('returns null when code does not exist', async () => {
			vi.mocked(repo.findByCode).mockResolvedValue(null)

			const result = await service.findByCode(USER_ID, 'inexistente')

			expect(result).toBeNull()
		})
	})

	describe('create', () => {
		it('creates and returns the new category', async () => {
			const category = makeCategory()
			vi.mocked(repo.findByCode).mockResolvedValue(null)
			vi.mocked(repo.create).mockResolvedValue(category)

			const result = await service.create(USER_ID, {
				code: 'alimentacion',
				label: 'Alimentación',
			})

			expect(result).toBe(category)
			expect(repo.create).toHaveBeenCalledWith(USER_ID, {
				code: 'alimentacion',
				label: 'Alimentación',
			})
		})

		it('throws when code is already taken', async () => {
			vi.mocked(repo.findByCode).mockResolvedValue(makeCategory())

			await expect(
				service.create(USER_ID, {
					code: 'alimentacion',
					label: 'Alimentación',
				}),
			).rejects.toThrow('Category code already exists')
		})
	})

	describe('update', () => {
		it('updates and returns the category', async () => {
			const existing = makeCategory()
			const updated = makeCategory({ label: 'Alimentación actualizada' })
			vi.mocked(repo.findById).mockResolvedValue(existing)
			vi.mocked(repo.update).mockResolvedValue(updated)

			const result = await service.update(USER_ID, 1, {
				label: 'Alimentación actualizada',
			})

			expect(result).toBe(updated)
			expect(repo.update).toHaveBeenCalledWith(USER_ID, 1, {
				label: 'Alimentación actualizada',
			})
		})

		it('throws when category does not exist', async () => {
			vi.mocked(repo.findById).mockResolvedValue(null)

			await expect(
				service.update(USER_ID, 999, { label: 'x' }),
			).rejects.toThrow('Category not found')
		})
	})

	describe('deactivate', () => {
		it('deactivates and returns the category', async () => {
			const existing = makeCategory()
			const deactivated = makeCategory({ active: false })
			vi.mocked(repo.findById).mockResolvedValue(existing)
			vi.mocked(repo.deactivate).mockResolvedValue(deactivated)

			const result = await service.deactivate(USER_ID, 1)

			expect(result).toBe(deactivated)
			expect(repo.deactivate).toHaveBeenCalledWith(USER_ID, 1)
		})

		it('throws when category does not exist', async () => {
			vi.mocked(repo.findById).mockResolvedValue(null)

			await expect(service.deactivate(USER_ID, 999)).rejects.toThrow(
				'Category not found',
			)
		})
	})
})
