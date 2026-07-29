// @vitest-environment node
import { afterAll, beforeEach, describe, expect, it } from 'vitest'
import { createTestUser } from '@/test/factories'
import { prismaTest } from '@/test/prisma'
import { createPrismaBudgetRepository } from './PrismaBudgetRepository'

const repository = createPrismaBudgetRepository(prismaTest)

const MAY_2026 = new Date('2026-05-01')
const APR_2026 = new Date('2026-04-01')

beforeEach(async () => {
	await prismaTest.budget.deleteMany()
	await prismaTest.category.deleteMany()
	await prismaTest.essentialityLevel.deleteMany()
	await prismaTest.user.deleteMany()
})

afterAll(async () => {
	await prismaTest.budget.deleteMany()
	await prismaTest.category.deleteMany()
	await prismaTest.essentialityLevel.deleteMany()
	await prismaTest.user.deleteMany()
	await prismaTest.$disconnect()
})

async function setupFixtures(userId: string) {
	const cat1 = await prismaTest.category.create({
		data: { code: 'alimentacion', label: 'Alimentación', userId },
	})
	const cat2 = await prismaTest.category.create({
		data: { code: 'vivienda', label: 'Vivienda', userId },
	})
	const essentiality = await prismaTest.essentialityLevel.create({
		data: { code: 'esencial', label: 'Esencial', sortOrder: 1, userId },
	})
	return {
		categoryId: cat1.id,
		category2Id: cat2.id,
		essentialityId: essentiality.id,
	}
}

const baseBudget = (categoryId: number, essentialityId: number) => ({
	month: MAY_2026,
	categoryId,
	essentialityId,
})

describe('PrismaBudgetRepository', () => {
	describe('findAll', () => {
		it('returns empty array when no budgets exist', async () => {
			const user = await createTestUser(prismaTest)
			const result = await repository.findAll(user.id)
			expect(result).toEqual([])
		})

		it('returns all budgets', async () => {
			const user = await createTestUser(prismaTest)
			const { categoryId, category2Id, essentialityId } = await setupFixtures(
				user.id,
			)
			await prismaTest.budget.createMany({
				data: [
					{ month: MAY_2026, categoryId, essentialityId, userId: user.id },
					{
						month: MAY_2026,
						categoryId: category2Id,
						essentialityId,
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
			await prismaTest.budget.create({
				data: {
					...baseBudget(categoryId, essentialityId),
					budgetedUsd: 500,
					budgetedGs: 3900000,
					userId: user.id,
				},
			})

			const result = await repository.findAll(user.id)

			expect(typeof result[0]?.budgetedUsd).toBe('number')
			expect(typeof result[0]?.budgetedGs).toBe('number')
			expect(result[0]?.budgetedUsd).toBe(500)
			expect(result[0]?.budgetedGs).toBe(3900000)
		})

		it('does not return budgets belonging to another user', async () => {
			const user = await createTestUser(prismaTest)
			const otherUser = await createTestUser(prismaTest)
			const { categoryId, essentialityId } = await setupFixtures(otherUser.id)
			await prismaTest.budget.create({
				data: {
					...baseBudget(categoryId, essentialityId),
					userId: otherUser.id,
				},
			})

			const result = await repository.findAll(user.id)
			expect(result).toEqual([])
		})
	})

	describe('findById', () => {
		it('returns the budget when it exists', async () => {
			const user = await createTestUser(prismaTest)
			const { categoryId, essentialityId } = await setupFixtures(user.id)
			const created = await prismaTest.budget.create({
				data: {
					...baseBudget(categoryId, essentialityId),
					budgetedUsd: 500,
					budgetedGs: 3900000,
					userId: user.id,
				},
			})

			const result = await repository.findById(user.id, created.id)

			expect(result).not.toBeNull()
			expect(result?.month).toEqual(MAY_2026)
			expect(result?.categoryId).toBe(categoryId)
			expect(result?.budgetedUsd).toBe(500)
			expect(result?.budgetedGs).toBe(3900000)
			expect(result?.notes).toBeNull()
		})

		it('returns null when budget does not exist', async () => {
			const user = await createTestUser(prismaTest)
			const result = await repository.findById(user.id, 999)
			expect(result).toBeNull()
		})

		it('returns null when budget belongs to another user', async () => {
			const user = await createTestUser(prismaTest)
			const otherUser = await createTestUser(prismaTest)
			const { categoryId, essentialityId } = await setupFixtures(otherUser.id)
			const created = await prismaTest.budget.create({
				data: {
					...baseBudget(categoryId, essentialityId),
					userId: otherUser.id,
				},
			})

			const result = await repository.findById(user.id, created.id)
			expect(result).toBeNull()
		})
	})

	describe('findByMonth', () => {
		it('returns all budgets for the given month', async () => {
			const user = await createTestUser(prismaTest)
			const { categoryId, category2Id, essentialityId } = await setupFixtures(
				user.id,
			)
			await prismaTest.budget.createMany({
				data: [
					{ month: MAY_2026, categoryId, essentialityId, userId: user.id },
					{
						month: MAY_2026,
						categoryId: category2Id,
						essentialityId,
						userId: user.id,
					},
					{ month: APR_2026, categoryId, essentialityId, userId: user.id },
				],
			})

			const result = await repository.findByMonth(user.id, MAY_2026)

			expect(result).toHaveLength(2)
			expect(
				result.every((b) => b.month.getTime() === MAY_2026.getTime()),
			).toBe(true)
		})

		it('returns empty array when no budgets exist for that month', async () => {
			const user = await createTestUser(prismaTest)
			const result = await repository.findByMonth(user.id, MAY_2026)
			expect(result).toEqual([])
		})
	})

	describe('findByMonthAndCategory', () => {
		it('returns the budget for the given month and category', async () => {
			const user = await createTestUser(prismaTest)
			const { categoryId, category2Id, essentialityId } = await setupFixtures(
				user.id,
			)
			await prismaTest.budget.createMany({
				data: [
					{
						month: MAY_2026,
						categoryId,
						essentialityId,
						budgetedUsd: 500,
						userId: user.id,
					},
					{
						month: MAY_2026,
						categoryId: category2Id,
						essentialityId,
						budgetedUsd: 1200,
						userId: user.id,
					},
				],
			})

			const result = await repository.findByMonthAndCategory(
				user.id,
				MAY_2026,
				categoryId,
			)

			expect(result).not.toBeNull()
			expect(result?.categoryId).toBe(categoryId)
			expect(result?.budgetedUsd).toBe(500)
		})

		it('returns null when no match exists', async () => {
			const user = await createTestUser(prismaTest)
			const { categoryId } = await setupFixtures(user.id)
			const result = await repository.findByMonthAndCategory(
				user.id,
				MAY_2026,
				categoryId,
			)
			expect(result).toBeNull()
		})
	})

	describe('create', () => {
		it('creates a budget with required fields and null amounts', async () => {
			const user = await createTestUser(prismaTest)
			const { categoryId, essentialityId } = await setupFixtures(user.id)
			const result = await repository.create(
				user.id,
				baseBudget(categoryId, essentialityId),
			)

			expect(result.id).toBeDefined()
			expect(result.month).toEqual(MAY_2026)
			expect(result.categoryId).toBe(categoryId)
			expect(result.essentialityId).toBe(essentialityId)
			expect(result.budgetedUsd).toBeNull()
			expect(result.budgetedGs).toBeNull()
			expect(result.notes).toBeNull()
			expect(result.createdAt).toBeInstanceOf(Date)
		})

		it('creates a budget with amounts and notes', async () => {
			const user = await createTestUser(prismaTest)
			const { categoryId, essentialityId } = await setupFixtures(user.id)
			const result = await repository.create(user.id, {
				...baseBudget(categoryId, essentialityId),
				budgetedUsd: 500,
				budgetedGs: 3900000,
				notes: 'Incluye delivery',
			})

			expect(result.budgetedUsd).toBe(500)
			expect(result.budgetedGs).toBe(3900000)
			expect(result.notes).toBe('Incluye delivery')
		})
	})

	describe('update', () => {
		it('updates the provided fields', async () => {
			const user = await createTestUser(prismaTest)
			const { categoryId, essentialityId } = await setupFixtures(user.id)
			const created = await prismaTest.budget.create({
				data: {
					...baseBudget(categoryId, essentialityId),
					budgetedUsd: 500,
					userId: user.id,
				},
			})

			const result = await repository.update(user.id, created.id, {
				budgetedUsd: 600,
				notes: 'Ajuste por inflación',
			})

			expect(result.budgetedUsd).toBe(600)
			expect(result.notes).toBe('Ajuste por inflación')
			expect(result.categoryId).toBe(categoryId)
		})

		it('can set nullable fields to null', async () => {
			const user = await createTestUser(prismaTest)
			const { categoryId, essentialityId } = await setupFixtures(user.id)
			const created = await prismaTest.budget.create({
				data: {
					...baseBudget(categoryId, essentialityId),
					budgetedUsd: 500,
					notes: 'nota',
					userId: user.id,
				},
			})

			const result = await repository.update(user.id, created.id, {
				budgetedUsd: null,
				notes: null,
			})

			expect(result.budgetedUsd).toBeNull()
			expect(result.notes).toBeNull()
		})

		it('rejects updating a budget that belongs to another user', async () => {
			const user = await createTestUser(prismaTest)
			const otherUser = await createTestUser(prismaTest)
			const { categoryId, essentialityId } = await setupFixtures(otherUser.id)
			const created = await prismaTest.budget.create({
				data: {
					...baseBudget(categoryId, essentialityId),
					userId: otherUser.id,
				},
			})

			await expect(
				repository.update(user.id, created.id, { budgetedUsd: 100 }),
			).rejects.toThrow()
		})
	})

	describe('findRecurring', () => {
		it('returns the latest recurring budget per category up to the given month', async () => {
			const user = await createTestUser(prismaTest)
			const { categoryId, essentialityId } = await setupFixtures(user.id)
			await prismaTest.budget.create({
				data: {
					...baseBudget(categoryId, essentialityId),
					month: APR_2026,
					isRecurring: true,
					budgetedUsd: 100,
					userId: user.id,
				},
			})

			const result = await repository.findRecurring(user.id, MAY_2026)

			expect(result).toHaveLength(1)
			expect(result[0]?.categoryId).toBe(categoryId)
		})

		it('does not return recurring budgets belonging to another user', async () => {
			const user = await createTestUser(prismaTest)
			const otherUser = await createTestUser(prismaTest)
			const { categoryId, essentialityId } = await setupFixtures(otherUser.id)
			await prismaTest.budget.create({
				data: {
					...baseBudget(categoryId, essentialityId),
					month: APR_2026,
					isRecurring: true,
					userId: otherUser.id,
				},
			})

			const result = await repository.findRecurring(user.id, MAY_2026)
			expect(result).toEqual([])
		})
	})

	describe('softDelete', () => {
		it('sets deletedAt and deleteReason without removing the record', async () => {
			const user = await createTestUser(prismaTest)
			const { categoryId, essentialityId } = await setupFixtures(user.id)
			const created = await prismaTest.budget.create({
				data: { ...baseBudget(categoryId, essentialityId), userId: user.id },
			})

			const result = await repository.softDelete(
				user.id,
				created.id,
				'Ya no aplica',
			)

			expect(result.deletedAt).toBeInstanceOf(Date)
			expect(result.deleteReason).toBe('Ya no aplica')

			const stillExists = await prismaTest.budget.findUnique({
				where: { id: created.id },
			})
			expect(stillExists).not.toBeNull()
		})

		it('rejects soft-deleting a budget that belongs to another user', async () => {
			const user = await createTestUser(prismaTest)
			const otherUser = await createTestUser(prismaTest)
			const { categoryId, essentialityId } = await setupFixtures(otherUser.id)
			const created = await prismaTest.budget.create({
				data: {
					...baseBudget(categoryId, essentialityId),
					userId: otherUser.id,
				},
			})

			await expect(repository.softDelete(user.id, created.id)).rejects.toThrow()
		})
	})
})
