import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { RecurringItem } from '@/domain/entities/recurring-item'
import type { RecurringItemSkip } from '@/domain/entities/recurring-item-skip'
import type { IRecurringItemRepository } from '@/domain/repositories/IRecurringItemRepository'
import type { IRecurringItemSkipRepository } from '@/domain/repositories/IRecurringItemSkipRepository'
import { createRecurringItemService } from './RecurringItemService'

const makeRepo = (): IRecurringItemRepository => ({
	findAll: vi.fn(),
	findById: vi.fn(),
	findActive: vi.fn(),
	create: vi.fn(),
	update: vi.fn(),
	deactivate: vi.fn(),
})

const makeSkipRepo = (): IRecurringItemSkipRepository => ({
	findByMonth: vi.fn(),
	create: vi.fn(),
	delete: vi.fn(),
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
	let skipRepo: IRecurringItemSkipRepository
	let service: ReturnType<typeof createRecurringItemService>

	beforeEach(() => {
		repo = makeRepo()
		skipRepo = makeSkipRepo()
		service = createRecurringItemService(repo, skipRepo)
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

			await expect(service.findById(999)).rejects.toThrow(
				'RecurringItem not found',
			)
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

			await expect(service.update(999, { amountUsd: 18 })).rejects.toThrow(
				'RecurringItem not found',
			)
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

			await expect(service.deactivate(999)).rejects.toThrow(
				'RecurringItem not found',
			)
		})
	})

	describe('findSkipsByMonth', () => {
		it('returns skips for the given month', async () => {
			const month = new Date(Date.UTC(2026, 5, 1))
			const skips: RecurringItemSkip[] = [
				{
					id: 1,
					recurringItemId: 1,
					month,
					reason: 'Pagó mi esposa',
					createdAt: new Date(),
				},
			]
			vi.mocked(skipRepo.findByMonth).mockResolvedValue(skips)

			const result = await service.findSkipsByMonth(month)

			expect(result).toBe(skips)
			expect(skipRepo.findByMonth).toHaveBeenCalledWith(month)
		})
	})

	describe('skipForMonth', () => {
		it('creates a skip for an active item', async () => {
			const item = makeItem()
			const month = new Date(Date.UTC(2026, 5, 1))
			const skip: RecurringItemSkip = {
				id: 1,
				recurringItemId: 1,
				month,
				reason: 'Pagó mi esposa',
				createdAt: new Date(),
			}
			vi.mocked(repo.findById).mockResolvedValue(item)
			vi.mocked(skipRepo.create).mockResolvedValue(skip)

			const result = await service.skipForMonth(1, month, 'Pagó mi esposa')

			expect(result).toBe(skip)
			expect(skipRepo.create).toHaveBeenCalledWith({
				recurringItemId: 1,
				month,
				reason: 'Pagó mi esposa',
			})
		})

		it('throws when item does not exist', async () => {
			vi.mocked(repo.findById).mockResolvedValue(null)

			await expect(
				service.skipForMonth(
					999,
					new Date(Date.UTC(2026, 5, 1)),
					'Pagó mi esposa',
				),
			).rejects.toThrow('RecurringItem not found')
		})

		it('throws when item is inactive', async () => {
			vi.mocked(repo.findById).mockResolvedValue(makeItem({ active: false }))

			await expect(
				service.skipForMonth(
					1,
					new Date(Date.UTC(2026, 5, 1)),
					'Pagó mi esposa',
				),
			).rejects.toThrow('Cannot skip an inactive item')
		})
	})

	describe('unskipForMonth', () => {
		it('deletes the skip', async () => {
			const month = new Date(Date.UTC(2026, 5, 1))
			vi.mocked(skipRepo.delete).mockResolvedValue(undefined)

			await service.unskipForMonth(1, month)

			expect(skipRepo.delete).toHaveBeenCalledWith(1, month)
		})
	})
})
