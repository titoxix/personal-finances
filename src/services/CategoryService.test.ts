import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Category } from '@/domain/entities/category'
import type { ICategoryRepository } from '@/domain/repositories/ICategoryRepository'
import { createCategoryService } from './CategoryService'

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
			const categories = [makeCategory(), makeCategory({ id: 2, code: 'vivienda', label: 'Vivienda' })]
			vi.mocked(repo.findAll).mockResolvedValue(categories)

			const result = await service.findAll()

			expect(result).toBe(categories)
			expect(repo.findAll).toHaveBeenCalledOnce()
		})
	})

	describe('findById', () => {
		it('returns the category when it exists', async () => {
			const category = makeCategory()
			vi.mocked(repo.findById).mockResolvedValue(category)

			const result = await service.findById(1)

			expect(result).toBe(category)
		})

		it('throws when category does not exist', async () => {
			vi.mocked(repo.findById).mockResolvedValue(null)

			await expect(service.findById(999)).rejects.toThrow('Category not found')
		})
	})

	describe('findByCode', () => {
		it('returns the category when code matches', async () => {
			const category = makeCategory()
			vi.mocked(repo.findByCode).mockResolvedValue(category)

			const result = await service.findByCode('alimentacion')

			expect(result).toBe(category)
		})

		it('returns null when code does not exist', async () => {
			vi.mocked(repo.findByCode).mockResolvedValue(null)

			const result = await service.findByCode('inexistente')

			expect(result).toBeNull()
		})
	})

	describe('create', () => {
		it('creates and returns the new category', async () => {
			const category = makeCategory()
			vi.mocked(repo.findByCode).mockResolvedValue(null)
			vi.mocked(repo.create).mockResolvedValue(category)

			const result = await service.create({ code: 'alimentacion', label: 'Alimentación' })

			expect(result).toBe(category)
			expect(repo.create).toHaveBeenCalledWith({ code: 'alimentacion', label: 'Alimentación' })
		})

		it('throws when code is already taken', async () => {
			vi.mocked(repo.findByCode).mockResolvedValue(makeCategory())

			await expect(
				service.create({ code: 'alimentacion', label: 'Alimentación' }),
			).rejects.toThrow('Category code already exists')
		})
	})

	describe('update', () => {
		it('updates and returns the category', async () => {
			const existing = makeCategory()
			const updated = makeCategory({ label: 'Alimentación actualizada' })
			vi.mocked(repo.findById).mockResolvedValue(existing)
			vi.mocked(repo.update).mockResolvedValue(updated)

			const result = await service.update(1, { label: 'Alimentación actualizada' })

			expect(result).toBe(updated)
			expect(repo.update).toHaveBeenCalledWith(1, { label: 'Alimentación actualizada' })
		})

		it('throws when category does not exist', async () => {
			vi.mocked(repo.findById).mockResolvedValue(null)

			await expect(service.update(999, { label: 'x' })).rejects.toThrow('Category not found')
		})
	})

	describe('deactivate', () => {
		it('deactivates and returns the category', async () => {
			const existing = makeCategory()
			const deactivated = makeCategory({ active: false })
			vi.mocked(repo.findById).mockResolvedValue(existing)
			vi.mocked(repo.deactivate).mockResolvedValue(deactivated)

			const result = await service.deactivate(1)

			expect(result).toBe(deactivated)
			expect(repo.deactivate).toHaveBeenCalledWith(1)
		})

		it('throws when category does not exist', async () => {
			vi.mocked(repo.findById).mockResolvedValue(null)

			await expect(service.deactivate(999)).rejects.toThrow('Category not found')
		})
	})
})
