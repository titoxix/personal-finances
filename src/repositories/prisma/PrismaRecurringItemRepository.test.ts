// @vitest-environment node
import { afterAll, beforeEach, describe, expect, it } from 'vitest'
import { createTestUser } from '@/test/factories'
import { prismaTest } from '@/test/prisma'
import { createPrismaRecurringItemRepository } from './PrismaRecurringItemRepository'

const repository = createPrismaRecurringItemRepository(prismaTest)

beforeEach(async () => {
	await prismaTest.transaction.deleteMany()
	await prismaTest.recurringItem.deleteMany()
	await prismaTest.category.deleteMany()
	await prismaTest.essentialityLevel.deleteMany()
	await prismaTest.user.deleteMany()
})

afterAll(async () => {
	await prismaTest.transaction.deleteMany()
	await prismaTest.recurringItem.deleteMany()
	await prismaTest.category.deleteMany()
	await prismaTest.essentialityLevel.deleteMany()
	await prismaTest.user.deleteMany()
	await prismaTest.$disconnect()
})

async function setupFixtures(userId: string) {
	const category = await prismaTest.category.create({
		data: { code: 'digital', label: 'Digital', userId },
	})
	const essentiality = await prismaTest.essentialityLevel.create({
		data: { code: 'esencial', label: 'Esencial', sortOrder: 1, userId },
	})
	return { categoryId: category.id, essentialityId: essentiality.id }
}

const baseItem = (categoryId: number, essentialityId: number) => ({
	description: 'Netflix',
	categoryId,
	essentialityId,
	paymentMethod: 'ueno_mastercard' as const,
	frequency: 'monthly' as const,
})

describe('PrismaRecurringItemRepository', () => {
	describe('findAll', () => {
		it('returns empty array when no items exist', async () => {
			const user = await createTestUser(prismaTest)
			const result = await repository.findAll(user.id)
			expect(result).toEqual([])
		})

		it('returns both active and inactive items', async () => {
			const user = await createTestUser(prismaTest)
			const { categoryId, essentialityId } = await setupFixtures(user.id)
			await prismaTest.recurringItem.createMany({
				data: [
					{
						...baseItem(categoryId, essentialityId),
						active: true,
						userId: user.id,
					},
					{
						...baseItem(categoryId, essentialityId),
						description: 'Spotify',
						active: false,
						userId: user.id,
					},
				],
			})

			const result = await repository.findAll(user.id)
			expect(result).toHaveLength(2)
		})

		it('returns numeric values for Decimal fields', async () => {
			const user = await createTestUser(prismaTest)
			const { categoryId, essentialityId } = await setupFixtures(user.id)
			await prismaTest.recurringItem.create({
				data: {
					...baseItem(categoryId, essentialityId),
					amountGs: 95000,
					amountUsd: 12.99,
					userId: user.id,
				},
			})

			const result = await repository.findAll(user.id)

			expect(typeof result[0]?.amountGs).toBe('number')
			expect(typeof result[0]?.amountUsd).toBe('number')
			expect(result[0]?.amountGs).toBe(95000)
			expect(result[0]?.amountUsd).toBe(12.99)
		})

		it('does not return items belonging to another user', async () => {
			const user = await createTestUser(prismaTest)
			const otherUser = await createTestUser(prismaTest)
			const { categoryId, essentialityId } = await setupFixtures(otherUser.id)
			await prismaTest.recurringItem.create({
				data: { ...baseItem(categoryId, essentialityId), userId: otherUser.id },
			})

			const result = await repository.findAll(user.id)
			expect(result).toEqual([])
		})
	})

	describe('findById', () => {
		it('returns the item when it exists', async () => {
			const user = await createTestUser(prismaTest)
			const { categoryId, essentialityId } = await setupFixtures(user.id)
			const created = await prismaTest.recurringItem.create({
				data: {
					...baseItem(categoryId, essentialityId),
					amountGs: 95000,
					billingDay: 5,
					userId: user.id,
				},
			})

			const result = await repository.findById(user.id, created.id)

			expect(result).not.toBeNull()
			expect(result?.description).toBe('Netflix')
			expect(result?.amountGs).toBe(95000)
			expect(result?.billingDay).toBe(5)
			expect(result?.paymentMethod).toBe('ueno_mastercard')
			expect(result?.frequency).toBe('monthly')
			expect(result?.isVariable).toBe(false)
			expect(result?.active).toBe(true)
		})

		it('returns null when item does not exist', async () => {
			const user = await createTestUser(prismaTest)
			const result = await repository.findById(user.id, 999)
			expect(result).toBeNull()
		})

		it('returns null when item belongs to another user', async () => {
			const user = await createTestUser(prismaTest)
			const otherUser = await createTestUser(prismaTest)
			const { categoryId, essentialityId } = await setupFixtures(otherUser.id)
			const created = await prismaTest.recurringItem.create({
				data: { ...baseItem(categoryId, essentialityId), userId: otherUser.id },
			})

			const result = await repository.findById(user.id, created.id)
			expect(result).toBeNull()
		})
	})

	describe('findActive', () => {
		it('returns only active items', async () => {
			const user = await createTestUser(prismaTest)
			const { categoryId, essentialityId } = await setupFixtures(user.id)
			await prismaTest.recurringItem.createMany({
				data: [
					{
						...baseItem(categoryId, essentialityId),
						description: 'Netflix',
						active: true,
						userId: user.id,
					},
					{
						...baseItem(categoryId, essentialityId),
						description: 'Spotify',
						active: true,
						userId: user.id,
					},
					{
						...baseItem(categoryId, essentialityId),
						description: 'HBO',
						active: false,
						userId: user.id,
					},
				],
			})

			const result = await repository.findActive(user.id)

			expect(result).toHaveLength(2)
			expect(result.every((i) => i.active)).toBe(true)
		})

		it('returns empty array when no active items exist', async () => {
			const user = await createTestUser(prismaTest)
			const { categoryId, essentialityId } = await setupFixtures(user.id)
			await prismaTest.recurringItem.create({
				data: {
					...baseItem(categoryId, essentialityId),
					active: false,
					userId: user.id,
				},
			})

			const result = await repository.findActive(user.id)
			expect(result).toEqual([])
		})
	})

	describe('create', () => {
		it('creates an item with required fields', async () => {
			const user = await createTestUser(prismaTest)
			const { categoryId, essentialityId } = await setupFixtures(user.id)
			const result = await repository.create(
				user.id,
				baseItem(categoryId, essentialityId),
			)

			expect(result.id).toBeDefined()
			expect(result.description).toBe('Netflix')
			expect(result.categoryId).toBe(categoryId)
			expect(result.essentialityId).toBe(essentialityId)
			expect(result.paymentMethod).toBe('ueno_mastercard')
			expect(result.frequency).toBe('monthly')
			expect(result.amountGs).toBeNull()
			expect(result.amountUsd).toBeNull()
			expect(result.billingDay).toBeNull()
			expect(result.billingMonth).toBeNull()
			expect(result.isVariable).toBe(false)
			expect(result.active).toBe(true)
			expect(result.notes).toBeNull()
		})

		it('creates an annual item with billing month and amount', async () => {
			const user = await createTestUser(prismaTest)
			const { categoryId, essentialityId } = await setupFixtures(user.id)
			const result = await repository.create(user.id, {
				...baseItem(categoryId, essentialityId),
				description: 'IRP',
				frequency: 'annual',
				billingMonth: 3,
				amountGs: 2500000,
				isVariable: true,
				notes: 'Impuesto a la renta personal',
			})

			expect(result.frequency).toBe('annual')
			expect(result.billingMonth).toBe(3)
			expect(result.amountGs).toBe(2500000)
			expect(result.isVariable).toBe(true)
			expect(result.notes).toBe('Impuesto a la renta personal')
		})
	})

	describe('update', () => {
		it('updates the provided fields', async () => {
			const user = await createTestUser(prismaTest)
			const { categoryId, essentialityId } = await setupFixtures(user.id)
			const created = await prismaTest.recurringItem.create({
				data: {
					...baseItem(categoryId, essentialityId),
					amountGs: 90000,
					userId: user.id,
				},
			})

			const result = await repository.update(user.id, created.id, {
				amountGs: 95000,
				notes: 'Nuevo plan',
			})

			expect(result.amountGs).toBe(95000)
			expect(result.notes).toBe('Nuevo plan')
			expect(result.description).toBe('Netflix')
		})

		it('can set nullable fields to null', async () => {
			const user = await createTestUser(prismaTest)
			const { categoryId, essentialityId } = await setupFixtures(user.id)
			const created = await prismaTest.recurringItem.create({
				data: {
					...baseItem(categoryId, essentialityId),
					amountGs: 90000,
					notes: 'nota',
					userId: user.id,
				},
			})

			const result = await repository.update(user.id, created.id, {
				amountGs: null,
				notes: null,
			})

			expect(result.amountGs).toBeNull()
			expect(result.notes).toBeNull()
		})

		it('rejects updating an item that belongs to another user', async () => {
			const user = await createTestUser(prismaTest)
			const otherUser = await createTestUser(prismaTest)
			const { categoryId, essentialityId } = await setupFixtures(otherUser.id)
			const created = await prismaTest.recurringItem.create({
				data: { ...baseItem(categoryId, essentialityId), userId: otherUser.id },
			})

			await expect(
				repository.update(user.id, created.id, { notes: 'Hackeado' }),
			).rejects.toThrow()
		})
	})

	describe('deactivate', () => {
		it('sets active to false without deleting the record', async () => {
			const user = await createTestUser(prismaTest)
			const { categoryId, essentialityId } = await setupFixtures(user.id)
			const created = await prismaTest.recurringItem.create({
				data: { ...baseItem(categoryId, essentialityId), userId: user.id },
			})

			const result = await repository.deactivate(user.id, created.id)

			expect(result.active).toBe(false)
			expect(result.id).toBe(created.id)

			const stillExists = await prismaTest.recurringItem.findUnique({
				where: { id: created.id },
			})
			expect(stillExists).not.toBeNull()
		})

		it('rejects deactivating an item that belongs to another user', async () => {
			const user = await createTestUser(prismaTest)
			const otherUser = await createTestUser(prismaTest)
			const { categoryId, essentialityId } = await setupFixtures(otherUser.id)
			const created = await prismaTest.recurringItem.create({
				data: { ...baseItem(categoryId, essentialityId), userId: otherUser.id },
			})

			await expect(repository.deactivate(user.id, created.id)).rejects.toThrow()
		})
	})
})
