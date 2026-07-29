// @vitest-environment node
import { afterAll, beforeEach, describe, expect, it } from 'vitest'
import { createTestUser } from '@/test/factories'
import { prismaTest } from '@/test/prisma'
import { createPrismaRecurringItemSkipRepository } from './PrismaRecurringItemSkipRepository'

const repository = createPrismaRecurringItemSkipRepository(prismaTest)

const JUN_2026 = new Date('2026-06-01')

beforeEach(async () => {
	await prismaTest.recurringItemSkip.deleteMany()
	await prismaTest.recurringItem.deleteMany()
	await prismaTest.category.deleteMany()
	await prismaTest.essentialityLevel.deleteMany()
	await prismaTest.user.deleteMany()
})

afterAll(async () => {
	await prismaTest.recurringItemSkip.deleteMany()
	await prismaTest.recurringItem.deleteMany()
	await prismaTest.category.deleteMany()
	await prismaTest.essentialityLevel.deleteMany()
	await prismaTest.user.deleteMany()
	await prismaTest.$disconnect()
})

async function setupRecurringItem(userId: string) {
	const category = await prismaTest.category.create({
		data: { code: 'digital', label: 'Digital', userId },
	})
	const essentiality = await prismaTest.essentialityLevel.create({
		data: { code: 'esencial', label: 'Esencial', sortOrder: 1, userId },
	})
	const recurringItem = await prismaTest.recurringItem.create({
		data: {
			description: 'Netflix',
			categoryId: category.id,
			essentialityId: essentiality.id,
			paymentMethod: 'ueno_mastercard',
			frequency: 'monthly',
			billingDay: 15,
			amountUsd: 15,
			userId,
		},
	})
	return recurringItem.id
}

describe('PrismaRecurringItemSkipRepository', () => {
	describe('findByMonth', () => {
		it('returns empty array when no skips exist', async () => {
			const user = await createTestUser(prismaTest)
			const result = await repository.findByMonth(user.id, JUN_2026)
			expect(result).toEqual([])
		})

		it('returns skips for the given month belonging to the user', async () => {
			const user = await createTestUser(prismaTest)
			const recurringItemId = await setupRecurringItem(user.id)
			await prismaTest.recurringItemSkip.create({
				data: { recurringItemId, month: JUN_2026, reason: 'Pagó mi esposa' },
			})

			const result = await repository.findByMonth(user.id, JUN_2026)

			expect(result).toHaveLength(1)
			expect(result[0]?.reason).toBe('Pagó mi esposa')
		})

		it('does not return skips belonging to another user', async () => {
			const user = await createTestUser(prismaTest)
			const otherUser = await createTestUser(prismaTest)
			const recurringItemId = await setupRecurringItem(otherUser.id)
			await prismaTest.recurringItemSkip.create({
				data: { recurringItemId, month: JUN_2026, reason: 'Pagó mi esposa' },
			})

			const result = await repository.findByMonth(user.id, JUN_2026)
			expect(result).toEqual([])
		})
	})

	describe('create', () => {
		it('creates a skip when the recurring item belongs to the user', async () => {
			const user = await createTestUser(prismaTest)
			const recurringItemId = await setupRecurringItem(user.id)

			const result = await repository.create(user.id, {
				recurringItemId,
				month: JUN_2026,
				reason: 'Pagó mi esposa',
			})

			expect(result.id).toBeDefined()
			expect(result.recurringItemId).toBe(recurringItemId)
			expect(result.month).toEqual(JUN_2026)
			expect(result.reason).toBe('Pagó mi esposa')
		})

		it('rejects creating a skip for a recurring item belonging to another user', async () => {
			const user = await createTestUser(prismaTest)
			const otherUser = await createTestUser(prismaTest)
			const recurringItemId = await setupRecurringItem(otherUser.id)

			await expect(
				repository.create(user.id, {
					recurringItemId,
					month: JUN_2026,
					reason: 'Hackeado',
				}),
			).rejects.toThrow('RecurringItem not found')
		})
	})

	describe('delete', () => {
		it('deletes the skip when the recurring item belongs to the user', async () => {
			const user = await createTestUser(prismaTest)
			const recurringItemId = await setupRecurringItem(user.id)
			await prismaTest.recurringItemSkip.create({
				data: { recurringItemId, month: JUN_2026, reason: 'Pagó mi esposa' },
			})

			await repository.delete(user.id, recurringItemId, JUN_2026)

			const remaining = await prismaTest.recurringItemSkip.findMany({
				where: { recurringItemId, month: JUN_2026 },
			})
			expect(remaining).toEqual([])
		})

		it('throws when the skip does not exist', async () => {
			const user = await createTestUser(prismaTest)
			const recurringItemId = await setupRecurringItem(user.id)

			await expect(
				repository.delete(user.id, recurringItemId, JUN_2026),
			).rejects.toThrow('RecurringItemSkip not found')
		})

		it('rejects deleting a skip whose recurring item belongs to another user', async () => {
			const user = await createTestUser(prismaTest)
			const otherUser = await createTestUser(prismaTest)
			const recurringItemId = await setupRecurringItem(otherUser.id)
			await prismaTest.recurringItemSkip.create({
				data: { recurringItemId, month: JUN_2026, reason: 'Pagó mi esposa' },
			})

			await expect(
				repository.delete(user.id, recurringItemId, JUN_2026),
			).rejects.toThrow('RecurringItemSkip not found')
		})
	})
})
