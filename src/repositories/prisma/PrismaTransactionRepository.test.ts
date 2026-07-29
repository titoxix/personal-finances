// @vitest-environment node
import { afterAll, beforeEach, describe, expect, it } from 'vitest'
import { createTestUser } from '@/test/factories'
import { prismaTest } from '@/test/prisma'
import { createPrismaTransactionRepository } from './PrismaTransactionRepository'

const repository = createPrismaTransactionRepository(prismaTest)

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
	const cat1 = await prismaTest.category.create({
		data: { code: 'alimentacion', label: 'Alimentación', userId },
	})
	const cat2 = await prismaTest.category.create({
		data: { code: 'transporte', label: 'Transporte', userId },
	})
	const essentiality = await prismaTest.essentialityLevel.create({
		data: { code: 'esencial', label: 'Esencial', sortOrder: 1, userId },
	})
	const recurringItem = await prismaTest.recurringItem.create({
		data: {
			description: 'Alquiler',
			categoryId: cat1.id,
			essentialityId: essentiality.id,
			paymentMethod: 'transferencia',
			frequency: 'monthly',
			amountGs: 7000000,
			billingDay: 1,
			userId,
		},
	})
	return {
		categoryId: cat1.id,
		category2Id: cat2.id,
		essentialityId: essentiality.id,
		recurringItemId: recurringItem.id,
	}
}

const baseTx = (categoryId: number, essentialityId: number) => ({
	date: new Date('2026-05-10'),
	description: 'Supermercado',
	categoryId,
	essentialityId,
	paymentMethod: 'itau_debito' as const,
})

describe('PrismaTransactionRepository', () => {
	describe('findAll', () => {
		it('returns empty array when no transactions exist', async () => {
			const user = await createTestUser(prismaTest)
			const result = await repository.findAll(user.id)
			expect(result).toEqual([])
		})

		it('returns all transactions ordered by date descending', async () => {
			const user = await createTestUser(prismaTest)
			const { categoryId, essentialityId } = await setupFixtures(user.id)
			await prismaTest.transaction.create({
				data: {
					...baseTx(categoryId, essentialityId),
					date: new Date('2026-05-05'),
					description: 'Farmacia',
					userId: user.id,
				},
			})
			await prismaTest.transaction.create({
				data: {
					...baseTx(categoryId, essentialityId),
					date: new Date('2026-05-10'),
					description: 'Supermercado',
					userId: user.id,
				},
			})

			const result = await repository.findAll(user.id)

			expect(result).toHaveLength(2)
			expect(result[0]?.description).toBe('Supermercado')
			expect(result[1]?.description).toBe('Farmacia')
		})

		it('returns numeric values for Decimal fields', async () => {
			const user = await createTestUser(prismaTest)
			const { categoryId, essentialityId } = await setupFixtures(user.id)
			await prismaTest.transaction.create({
				data: {
					...baseTx(categoryId, essentialityId),
					amountGs: 150000,
					amountUsd: 19.23,
					exchangeRateValue: 7800,
					userId: user.id,
				},
			})

			const result = await repository.findAll(user.id)

			expect(typeof result[0]?.amountGs).toBe('number')
			expect(typeof result[0]?.amountUsd).toBe('number')
			expect(typeof result[0]?.exchangeRateValue).toBe('number')
			expect(result[0]?.amountGs).toBe(150000)
			expect(result[0]?.amountUsd).toBe(19.23)
			expect(result[0]?.exchangeRateValue).toBe(7800)
		})

		it('does not return transactions belonging to another user', async () => {
			const user = await createTestUser(prismaTest)
			const otherUser = await createTestUser(prismaTest)
			const { categoryId, essentialityId } = await setupFixtures(otherUser.id)
			await prismaTest.transaction.create({
				data: {
					...baseTx(categoryId, essentialityId),
					userId: otherUser.id,
				},
			})

			const result = await repository.findAll(user.id)
			expect(result).toEqual([])
		})
	})

	describe('findById', () => {
		it('returns the transaction when it exists', async () => {
			const user = await createTestUser(prismaTest)
			const { categoryId, essentialityId } = await setupFixtures(user.id)
			const created = await prismaTest.transaction.create({
				data: {
					...baseTx(categoryId, essentialityId),
					amountGs: 150000,
					weekOfMonth: 2,
					isRecurring: false,
					userId: user.id,
				},
			})

			const result = await repository.findById(user.id, created.id)

			expect(result).not.toBeNull()
			expect(result?.description).toBe('Supermercado')
			expect(result?.amountGs).toBe(150000)
			expect(result?.weekOfMonth).toBe(2)
			expect(result?.isInstallment).toBe(false)
			expect(result?.isRecurring).toBe(false)
			expect(result?.categoryId).toBe(categoryId)
		})

		it('returns null when transaction does not exist', async () => {
			const user = await createTestUser(prismaTest)
			const result = await repository.findById(user.id, 999)
			expect(result).toBeNull()
		})

		it('returns null when transaction belongs to another user', async () => {
			const user = await createTestUser(prismaTest)
			const otherUser = await createTestUser(prismaTest)
			const { categoryId, essentialityId } = await setupFixtures(otherUser.id)
			const created = await prismaTest.transaction.create({
				data: { ...baseTx(categoryId, essentialityId), userId: otherUser.id },
			})

			const result = await repository.findById(user.id, created.id)
			expect(result).toBeNull()
		})
	})

	describe('findByMonth', () => {
		it('returns transactions whose date falls within the given month', async () => {
			const user = await createTestUser(prismaTest)
			const { categoryId, essentialityId } = await setupFixtures(user.id)
			await prismaTest.transaction.create({
				data: {
					...baseTx(categoryId, essentialityId),
					date: new Date('2026-05-01'),
					userId: user.id,
				},
			})
			await prismaTest.transaction.create({
				data: {
					...baseTx(categoryId, essentialityId),
					date: new Date('2026-05-31'),
					userId: user.id,
				},
			})
			await prismaTest.transaction.create({
				data: {
					...baseTx(categoryId, essentialityId),
					date: new Date('2026-04-30'),
					description: 'Otro mes',
					userId: user.id,
				},
			})

			const result = await repository.findByMonth(
				user.id,
				new Date('2026-05-01'),
			)

			expect(result).toHaveLength(2)
			expect(result.every((t) => t.date.getUTCMonth() === 4)).toBe(true)
		})

		it('returns empty array when no transactions exist for that month', async () => {
			const user = await createTestUser(prismaTest)
			const result = await repository.findByMonth(
				user.id,
				new Date('2026-05-01'),
			)
			expect(result).toEqual([])
		})
	})

	describe('findByMonthAndCategory', () => {
		it('returns transactions for the given month and category', async () => {
			const user = await createTestUser(prismaTest)
			const { categoryId, category2Id, essentialityId } = await setupFixtures(
				user.id,
			)
			await prismaTest.transaction.createMany({
				data: [
					{
						...baseTx(categoryId, essentialityId),
						date: new Date('2026-05-10'),
						description: 'Super',
						categoryId,
						userId: user.id,
					},
					{
						...baseTx(categoryId, essentialityId),
						date: new Date('2026-05-15'),
						description: 'Almuerzo',
						categoryId,
						userId: user.id,
					},
					{
						...baseTx(categoryId, essentialityId),
						date: new Date('2026-05-12'),
						categoryId: category2Id,
						userId: user.id,
					},
					{
						...baseTx(categoryId, essentialityId),
						date: new Date('2026-04-10'),
						description: 'Otro mes',
						categoryId,
						userId: user.id,
					},
				],
			})

			const result = await repository.findByMonthAndCategory(
				user.id,
				new Date('2026-05-01'),
				categoryId,
			)

			expect(result).toHaveLength(2)
			expect(result.every((t) => t.categoryId === categoryId)).toBe(true)
		})

		it('returns empty array when no matches', async () => {
			const user = await createTestUser(prismaTest)
			const { categoryId } = await setupFixtures(user.id)
			const result = await repository.findByMonthAndCategory(
				user.id,
				new Date('2026-05-01'),
				categoryId,
			)
			expect(result).toEqual([])
		})
	})

	describe('create', () => {
		it('creates a transaction with required fields and defaults', async () => {
			const user = await createTestUser(prismaTest)
			const { categoryId, essentialityId } = await setupFixtures(user.id)
			const result = await repository.create(
				user.id,
				baseTx(categoryId, essentialityId),
			)

			expect(result.id).toBeDefined()
			expect(result.date).toEqual(new Date('2026-05-10'))
			expect(result.description).toBe('Supermercado')
			expect(result.categoryId).toBe(categoryId)
			expect(result.paymentMethod).toBe('itau_debito')
			expect(result.amountGs).toBeNull()
			expect(result.amountUsd).toBeNull()
			expect(result.exchangeRateValue).toBeNull()
			expect(result.exchangeRateId).toBeNull()
			expect(result.weekOfMonth).toBeNull()
			expect(result.isInstallment).toBe(false)
			expect(result.installmentCurrent).toBeNull()
			expect(result.installmentTotal).toBeNull()
			expect(result.installmentPlanId).toBeNull()
			expect(result.isRecurring).toBe(false)
			expect(result.notes).toBeNull()
			expect(result.createdAt).toBeInstanceOf(Date)
		})

		it('creates a transaction with amounts and weekOfMonth', async () => {
			const user = await createTestUser(prismaTest)
			const { categoryId, essentialityId } = await setupFixtures(user.id)
			const result = await repository.create(user.id, {
				...baseTx(categoryId, essentialityId),
				amountGs: 150000,
				amountUsd: 19.23,
				exchangeRateValue: 7800,
				weekOfMonth: 2,
			})

			expect(result.amountGs).toBe(150000)
			expect(result.amountUsd).toBe(19.23)
			expect(result.exchangeRateValue).toBe(7800)
			expect(result.weekOfMonth).toBe(2)
		})

		it('creates an installment transaction', async () => {
			const user = await createTestUser(prismaTest)
			const { categoryId, essentialityId } = await setupFixtures(user.id)
			const result = await repository.create(user.id, {
				...baseTx(categoryId, essentialityId),
				amountGs: 300000,
				isInstallment: true,
				installmentCurrent: 1,
				installmentTotal: 12,
			})

			expect(result.isInstallment).toBe(true)
			expect(result.installmentCurrent).toBe(1)
			expect(result.installmentTotal).toBe(12)
		})

		it('creates a recurring transaction', async () => {
			const user = await createTestUser(prismaTest)
			const { categoryId, essentialityId } = await setupFixtures(user.id)
			const result = await repository.create(user.id, {
				...baseTx(categoryId, essentialityId),
				amountGs: 95000,
				isRecurring: true,
				notes: 'Netflix mensual',
			})

			expect(result.isRecurring).toBe(true)
			expect(result.notes).toBe('Netflix mensual')
		})

		it('creates a transaction linked to a recurring item', async () => {
			const user = await createTestUser(prismaTest)
			const { categoryId, essentialityId, recurringItemId } =
				await setupFixtures(user.id)
			const result = await repository.create(user.id, {
				...baseTx(categoryId, essentialityId),
				amountGs: 7000000,
				recurringItemId,
			})

			expect(result.recurringItemId).toBe(recurringItemId)
		})

		it('defaults recurringItemId to null when not provided', async () => {
			const user = await createTestUser(prismaTest)
			const { categoryId, essentialityId } = await setupFixtures(user.id)
			const result = await repository.create(
				user.id,
				baseTx(categoryId, essentialityId),
			)

			expect(result.recurringItemId).toBeNull()
		})
	})

	describe('update', () => {
		it('updates the provided fields', async () => {
			const user = await createTestUser(prismaTest)
			const { categoryId, essentialityId } = await setupFixtures(user.id)
			const created = await prismaTest.transaction.create({
				data: {
					...baseTx(categoryId, essentialityId),
					amountGs: 140000,
					userId: user.id,
				},
			})

			const result = await repository.update(user.id, created.id, {
				amountGs: 150000,
				notes: 'Corrección de monto',
			})

			expect(result.amountGs).toBe(150000)
			expect(result.notes).toBe('Corrección de monto')
			expect(result.description).toBe('Supermercado')
		})

		it('can set nullable fields to null', async () => {
			const user = await createTestUser(prismaTest)
			const { categoryId, essentialityId } = await setupFixtures(user.id)
			const created = await prismaTest.transaction.create({
				data: {
					...baseTx(categoryId, essentialityId),
					amountGs: 150000,
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

		it('can unlink a recurringItemId by setting it to null', async () => {
			const user = await createTestUser(prismaTest)
			const { categoryId, essentialityId, recurringItemId } =
				await setupFixtures(user.id)
			const created = await prismaTest.transaction.create({
				data: {
					...baseTx(categoryId, essentialityId),
					amountGs: 7000000,
					recurringItemId,
					userId: user.id,
				},
			})

			const result = await repository.update(user.id, created.id, {
				recurringItemId: null,
			})

			expect(result.recurringItemId).toBeNull()
		})

		it('rejects updating a transaction that belongs to another user', async () => {
			const user = await createTestUser(prismaTest)
			const otherUser = await createTestUser(prismaTest)
			const { categoryId, essentialityId } = await setupFixtures(otherUser.id)
			const created = await prismaTest.transaction.create({
				data: { ...baseTx(categoryId, essentialityId), userId: otherUser.id },
			})

			await expect(
				repository.update(user.id, created.id, { notes: 'Hackeado' }),
			).rejects.toThrow()
		})
	})

	describe('delete', () => {
		it('removes the transaction from the database', async () => {
			const user = await createTestUser(prismaTest)
			const { categoryId, essentialityId } = await setupFixtures(user.id)
			const created = await prismaTest.transaction.create({
				data: { ...baseTx(categoryId, essentialityId), userId: user.id },
			})

			await repository.delete(user.id, created.id)

			const gone = await prismaTest.transaction.findUnique({
				where: { id: created.id },
			})
			expect(gone).toBeNull()
		})

		it('rejects deleting a transaction that belongs to another user', async () => {
			const user = await createTestUser(prismaTest)
			const otherUser = await createTestUser(prismaTest)
			const { categoryId, essentialityId } = await setupFixtures(otherUser.id)
			const created = await prismaTest.transaction.create({
				data: { ...baseTx(categoryId, essentialityId), userId: otherUser.id },
			})

			await expect(repository.delete(user.id, created.id)).rejects.toThrow()
		})
	})
})
