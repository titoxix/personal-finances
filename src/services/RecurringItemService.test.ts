import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { RecurringItem } from '@/domain/entities/recurring-item'
import type { IRecurringItemRepository } from '@/domain/repositories/IRecurringItemRepository'
import { createRecurringItemService } from './RecurringItemService'

const makeRepo = (): IRecurringItemRepository => ({
	findAll: vi.fn(),
	findById: vi.fn(),
	findActive: vi.fn(),
	create: vi.fn(),
	update: vi.fn(),
	deactivate: vi.fn(),
})

const makeItem = (overrides: Partial<RecurringItem> = {}): RecurringItem => ({
	id: 1,
	description: 'Netflix',
	amountUsd: 15,
	amountGs: null,
	categoryId: 1,
	essentialityId: 1,
	paymentMethod: 'ueno_mastercard',
	frequency: 'monthly',
	billingDay: 15,
	billingMonth: null,
	isVariable: false,
	active: true,
	notes: null,
	createdAt: new Date(),
	...overrides,
})

describe('createRecurringItemService', () => {
	let repo: IRecurringItemRepository
	let service: ReturnType<typeof createRecurringItemService>

	beforeEach(() => {
		repo = makeRepo()
		service = createRecurringItemService(repo)
	})

	describe('findAll', () => {
		it('returns all items from repository', async () => {
			const items = [makeItem()]
			vi.mocked(repo.findAll).mockResolvedValue(items)

			const result = await service.findAll()

			expect(result).toBe(items)
			expect(repo.findAll).toHaveBeenCalledOnce()
		})
	})

	describe('findById', () => {
		it('returns the item when it exists', async () => {
			const item = makeItem()
			vi.mocked(repo.findById).mockResolvedValue(item)

			const result = await service.findById(1)

			expect(result).toBe(item)
		})

		it('throws when item does not exist', async () => {
			vi.mocked(repo.findById).mockResolvedValue(null)

			await expect(service.findById(999)).rejects.toThrow('RecurringItem not found')
		})
	})

	describe('findActive', () => {
		it('returns active items from repository', async () => {
			const items = [makeItem()]
			vi.mocked(repo.findActive).mockResolvedValue(items)

			const result = await service.findActive()

			expect(result).toBe(items)
			expect(repo.findActive).toHaveBeenCalledOnce()
		})
	})

	describe('create', () => {
		it('creates a valid monthly item', async () => {
			const item = makeItem()
			vi.mocked(repo.create).mockResolvedValue(item)

			const result = await service.create({
				description: 'Netflix',
				categoryId: 1,
				essentialityId: 1,
				paymentMethod: 'ueno_mastercard',
				frequency: 'monthly',
				billingDay: 15,
				amountUsd: 15,
			})

			expect(result).toBe(item)
		})

		it('creates a valid annual item', async () => {
			const item = makeItem({ frequency: 'annual', billingMonth: 3 })
			vi.mocked(repo.create).mockResolvedValue(item)

			const result = await service.create({
				description: 'Spotify anual',
				categoryId: 1,
				essentialityId: 1,
				paymentMethod: 'itau_visa',
				frequency: 'annual',
				billingDay: 10,
				billingMonth: 3,
				amountUsd: 99,
			})

			expect(result).toBe(item)
		})

		it('creates a variable item without amount', async () => {
			const item = makeItem({ amountUsd: null, isVariable: true })
			vi.mocked(repo.create).mockResolvedValue(item)

			const result = await service.create({
				description: 'Luz variable',
				categoryId: 1,
				essentialityId: 1,
				paymentMethod: 'transferencia',
				frequency: 'monthly',
				billingDay: 5,
				isVariable: true,
			})

			expect(result).toBe(item)
		})

		it('throws when monthly item has no billingDay', async () => {
			await expect(
				service.create({
					description: 'Netflix',
					categoryId: 1,
					essentialityId: 1,
					paymentMethod: 'ueno_mastercard',
					frequency: 'monthly',
					amountUsd: 15,
				}),
			).rejects.toThrow('monthly item requires billingDay')
		})

		it('throws when annual item has no billingMonth', async () => {
			await expect(
				service.create({
					description: 'Spotify anual',
					categoryId: 1,
					essentialityId: 1,
					paymentMethod: 'itau_visa',
					frequency: 'annual',
					billingDay: 10,
					amountUsd: 99,
				}),
			).rejects.toThrow('annual item requires billingDay and billingMonth')
		})

		it('throws when annual item has no billingDay', async () => {
			await expect(
				service.create({
					description: 'Spotify anual',
					categoryId: 1,
					essentialityId: 1,
					paymentMethod: 'itau_visa',
					frequency: 'annual',
					billingMonth: 3,
					amountUsd: 99,
				}),
			).rejects.toThrow('annual item requires billingDay and billingMonth')
		})

		it('throws when non-variable item has no amount', async () => {
			await expect(
				service.create({
					description: 'Netflix',
					categoryId: 1,
					essentialityId: 1,
					paymentMethod: 'ueno_mastercard',
					frequency: 'monthly',
					billingDay: 15,
				}),
			).rejects.toThrow('non-variable item requires amountGs or amountUsd')
		})
	})

	describe('update', () => {
		it('updates and returns the item', async () => {
			const existing = makeItem()
			const updated = makeItem({ amountUsd: 18 })
			vi.mocked(repo.findById).mockResolvedValue(existing)
			vi.mocked(repo.update).mockResolvedValue(updated)

			const result = await service.update(1, { amountUsd: 18 })

			expect(result).toBe(updated)
			expect(repo.update).toHaveBeenCalledWith(1, { amountUsd: 18 })
		})

		it('throws when item does not exist', async () => {
			vi.mocked(repo.findById).mockResolvedValue(null)

			await expect(service.update(999, { amountUsd: 18 })).rejects.toThrow('RecurringItem not found')
		})
	})

	describe('deactivate', () => {
		it('deactivates and returns the item', async () => {
			const existing = makeItem()
			const deactivated = makeItem({ active: false })
			vi.mocked(repo.findById).mockResolvedValue(existing)
			vi.mocked(repo.deactivate).mockResolvedValue(deactivated)

			const result = await service.deactivate(1)

			expect(result).toBe(deactivated)
			expect(repo.deactivate).toHaveBeenCalledWith(1)
		})

		it('throws when item does not exist', async () => {
			vi.mocked(repo.findById).mockResolvedValue(null)

			await expect(service.deactivate(999)).rejects.toThrow('RecurringItem not found')
		})
	})
})
