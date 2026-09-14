// @vitest-environment node
import { afterAll, beforeEach, describe, expect, it } from 'vitest'
import { createTestUser } from '@/test/factories'
import { prismaTest } from '@/test/prisma'
import { createPrismaInstallmentPlanRepository } from './PrismaInstallmentPlanRepository'

const repository = createPrismaInstallmentPlanRepository(prismaTest)

beforeEach(async () => {
	await prismaTest.installmentPlan.deleteMany()
	await prismaTest.category.deleteMany()
	await prismaTest.essentialityLevel.deleteMany()
	await prismaTest.user.deleteMany()
})

afterAll(async () => {
	await prismaTest.installmentPlan.deleteMany()
	await prismaTest.category.deleteMany()
	await prismaTest.essentialityLevel.deleteMany()
	await prismaTest.user.deleteMany()
	await prismaTest.$disconnect()
})

async function setupCategoryAndEssentiality(userId: string) {
	const category = await prismaTest.category.create({
		data: { code: 'equipamiento', label: 'Equipamiento', userId },
	})
	const essentiality = await prismaTest.essentialityLevel.create({
		data: { code: 'importante', label: 'Importante', sortOrder: 2, userId },
	})
	return { categoryId: category.id, essentialityId: essentiality.id }
}

const basePlan = (categoryId: number, essentialityId: number) => ({
	description: 'Gym equipamiento',
	installmentsTotal: 12,
	startDate: new Date('2026-01-01'),
	paymentMethod: 'itau_visa' as const,
	categoryId,
	essentialityId,
})

describe('PrismaInstallmentPlanRepository', () => {
	describe('findAll', () => {
		it('returns empty array when no plans exist', async () => {
			const user = await createTestUser(prismaTest)
			const result = await repository.findAll(user.id)
			expect(result).toEqual([])
		})

		it('returns both active and inactive plans', async () => {
			const user = await createTestUser(prismaTest)
			const { categoryId, essentialityId } = await setupCategoryAndEssentiality(
				user.id,
			)
			await prismaTest.installmentPlan.createMany({
				data: [
					{
						...basePlan(categoryId, essentialityId),
						active: true,
						userId: user.id,
					},
					{
						...basePlan(categoryId, essentialityId),
						description: 'Laptop',
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
			const { categoryId, essentialityId } = await setupCategoryAndEssentiality(
				user.id,
			)
			await prismaTest.installmentPlan.create({
				data: {
					...basePlan(categoryId, essentialityId),
					totalAmountGs: 3600000,
					installmentAmountGs: 300000,
					userId: user.id,
				},
			})

			const result = await repository.findAll(user.id)

			expect(typeof result[0]?.totalAmountGs).toBe('number')
			expect(typeof result[0]?.installmentAmountGs).toBe('number')
			expect(result[0]?.totalAmountGs).toBe(3600000)
			expect(result[0]?.installmentAmountGs).toBe(300000)
		})

		it('does not return plans belonging to another user', async () => {
			const user = await createTestUser(prismaTest)
			const otherUser = await createTestUser(prismaTest)
			const { categoryId, essentialityId } = await setupCategoryAndEssentiality(
				otherUser.id,
			)
			await prismaTest.installmentPlan.create({
				data: { ...basePlan(categoryId, essentialityId), userId: otherUser.id },
			})

			const result = await repository.findAll(user.id)
			expect(result).toEqual([])
		})
	})

	describe('findById', () => {
		it('returns the plan when it exists', async () => {
			const user = await createTestUser(prismaTest)
			const { categoryId, essentialityId } = await setupCategoryAndEssentiality(
				user.id,
			)
			const created = await prismaTest.installmentPlan.create({
				data: {
					...basePlan(categoryId, essentialityId),
					totalAmountGs: 3600000,
					installmentAmountGs: 300000,
					endDate: new Date('2026-12-01'),
					userId: user.id,
				},
			})

			const result = await repository.findById(user.id, created.id)

			expect(result).not.toBeNull()
			expect(result?.description).toBe('Gym equipamiento')
			expect(result?.installmentsTotal).toBe(12)
			expect(result?.installmentsPaid).toBe(0)
			expect(result?.totalAmountGs).toBe(3600000)
			expect(result?.installmentAmountGs).toBe(300000)
			expect(result?.startDate).toEqual(new Date('2026-01-01'))
			expect(result?.endDate).toEqual(new Date('2026-12-01'))
			expect(result?.paymentMethod).toBe('itau_visa')
			expect(result?.active).toBe(true)
		})

		it('returns null when plan does not exist', async () => {
			const user = await createTestUser(prismaTest)
			const result = await repository.findById(user.id, 999)
			expect(result).toBeNull()
		})

		it('returns null when plan belongs to another user', async () => {
			const user = await createTestUser(prismaTest)
			const otherUser = await createTestUser(prismaTest)
			const { categoryId, essentialityId } = await setupCategoryAndEssentiality(
				otherUser.id,
			)
			const created = await prismaTest.installmentPlan.create({
				data: { ...basePlan(categoryId, essentialityId), userId: otherUser.id },
			})

			const result = await repository.findById(user.id, created.id)
			expect(result).toBeNull()
		})
	})

	describe('findActive', () => {
		it('returns only active plans', async () => {
			const user = await createTestUser(prismaTest)
			const { categoryId, essentialityId } = await setupCategoryAndEssentiality(
				user.id,
			)
			await prismaTest.installmentPlan.createMany({
				data: [
					{
						...basePlan(categoryId, essentialityId),
						description: 'Gym',
						active: true,
						userId: user.id,
					},
					{
						...basePlan(categoryId, essentialityId),
						description: 'Laptop',
						active: true,
						userId: user.id,
					},
					{
						...basePlan(categoryId, essentialityId),
						description: 'TV',
						active: false,
						userId: user.id,
					},
				],
			})

			const result = await repository.findActive(user.id)

			expect(result).toHaveLength(2)
			expect(result.every((p) => p.active)).toBe(true)
		})

		it('returns empty array when no active plans exist', async () => {
			const user = await createTestUser(prismaTest)
			const { categoryId, essentialityId } = await setupCategoryAndEssentiality(
				user.id,
			)
			await prismaTest.installmentPlan.create({
				data: {
					...basePlan(categoryId, essentialityId),
					active: false,
					userId: user.id,
				},
			})

			const result = await repository.findActive(user.id)
			expect(result).toEqual([])
		})
	})

	describe('create', () => {
		it('creates a plan with required fields and defaults', async () => {
			const user = await createTestUser(prismaTest)
			const { categoryId, essentialityId } = await setupCategoryAndEssentiality(
				user.id,
			)
			const result = await repository.create(
				user.id,
				basePlan(categoryId, essentialityId),
			)

			expect(result.id).toBeDefined()
			expect(result.description).toBe('Gym equipamiento')
			expect(result.installmentsTotal).toBe(12)
			expect(result.installmentsPaid).toBe(0)
			expect(result.totalAmountGs).toBeNull()
			expect(result.totalAmountUsd).toBeNull()
			expect(result.installmentAmountGs).toBeNull()
			expect(result.endDate).toBeNull()
			expect(result.active).toBe(true)
			expect(result.notes).toBeNull()
			expect(result.createdAt).toBeInstanceOf(Date)
		})

		it('creates a plan with all optional fields', async () => {
			const user = await createTestUser(prismaTest)
			const { categoryId, essentialityId } = await setupCategoryAndEssentiality(
				user.id,
			)
			const endDate = new Date('2026-12-01')

			const result = await repository.create(user.id, {
				...basePlan(categoryId, essentialityId),
				totalAmountGs: 3600000,
				totalAmountUsd: 461.54,
				installmentAmountGs: 300000,
				endDate,
				notes: 'Pago con visa cuotas sin interés',
			})

			expect(result.totalAmountGs).toBe(3600000)
			expect(result.totalAmountUsd).toBe(461.54)
			expect(result.installmentAmountGs).toBe(300000)
			expect(result.endDate).toEqual(endDate)
			expect(result.notes).toBe('Pago con visa cuotas sin interés')
		})
	})

	describe('update', () => {
		it('updates installmentsPaid', async () => {
			const user = await createTestUser(prismaTest)
			const { categoryId, essentialityId } = await setupCategoryAndEssentiality(
				user.id,
			)
			const created = await prismaTest.installmentPlan.create({
				data: { ...basePlan(categoryId, essentialityId), userId: user.id },
			})

			const result = await repository.update(user.id, created.id, {
				installmentsPaid: 3,
			})

			expect(result.installmentsPaid).toBe(3)
			expect(result.description).toBe('Gym equipamiento')
		})

		it('updates only the provided fields', async () => {
			const user = await createTestUser(prismaTest)
			const { categoryId, essentialityId } = await setupCategoryAndEssentiality(
				user.id,
			)
			const created = await prismaTest.installmentPlan.create({
				data: {
					...basePlan(categoryId, essentialityId),
					totalAmountGs: 3600000,
					notes: 'nota original',
					userId: user.id,
				},
			})

			const result = await repository.update(user.id, created.id, {
				notes: 'nota actualizada',
			})

			expect(result.notes).toBe('nota actualizada')
			expect(result.totalAmountGs).toBe(3600000)
		})

		it('can set nullable fields to null', async () => {
			const user = await createTestUser(prismaTest)
			const { categoryId, essentialityId } = await setupCategoryAndEssentiality(
				user.id,
			)
			const created = await prismaTest.installmentPlan.create({
				data: {
					...basePlan(categoryId, essentialityId),
					totalAmountGs: 3600000,
					notes: 'nota',
					userId: user.id,
				},
			})

			const result = await repository.update(user.id, created.id, {
				totalAmountGs: null,
				notes: null,
			})

			expect(result.totalAmountGs).toBeNull()
			expect(result.notes).toBeNull()
		})

		it('rejects updating a plan that belongs to another user', async () => {
			const user = await createTestUser(prismaTest)
			const otherUser = await createTestUser(prismaTest)
			const { categoryId, essentialityId } = await setupCategoryAndEssentiality(
				otherUser.id,
			)
			const created = await prismaTest.installmentPlan.create({
				data: { ...basePlan(categoryId, essentialityId), userId: otherUser.id },
			})

			await expect(
				repository.update(user.id, created.id, { installmentsPaid: 5 }),
			).rejects.toThrow()
		})
	})

	describe('deactivate', () => {
		it('sets active to false without deleting the record', async () => {
			const user = await createTestUser(prismaTest)
			const { categoryId, essentialityId } = await setupCategoryAndEssentiality(
				user.id,
			)
			const created = await prismaTest.installmentPlan.create({
				data: { ...basePlan(categoryId, essentialityId), userId: user.id },
			})

			const result = await repository.deactivate(user.id, created.id)

			expect(result.active).toBe(false)
			expect(result.id).toBe(created.id)

			const stillExists = await prismaTest.installmentPlan.findUnique({
				where: { id: created.id },
			})
			expect(stillExists).not.toBeNull()
		})

		it('rejects deactivating a plan that belongs to another user', async () => {
			const user = await createTestUser(prismaTest)
			const otherUser = await createTestUser(prismaTest)
			const { categoryId, essentialityId } = await setupCategoryAndEssentiality(
				otherUser.id,
			)
			const created = await prismaTest.installmentPlan.create({
				data: { ...basePlan(categoryId, essentialityId), userId: otherUser.id },
			})

			await expect(repository.deactivate(user.id, created.id)).rejects.toThrow()
		})
	})
})
