// @vitest-environment node
import { afterAll, beforeEach, describe, expect, it } from 'vitest'
import { createTestUser } from '@/test/factories'
import { prismaTest } from '@/test/prisma'
import { createPrismaIncomeRepository } from './PrismaIncomeRepository'

const repository = createPrismaIncomeRepository(prismaTest)

const MAY_2026 = new Date('2026-05-01')
const APR_2026 = new Date('2026-04-01')

const baseIncome = {
	grossIncomeUsd: 5433,
	budgetCapUsd: 5000,
	automaticInvestmentUsd: 433,
	automaticDest: 'etf_xtb',
	exchangeRate: 7800,
}

beforeEach(async () => {
	await prismaTest.income.deleteMany()
	await prismaTest.user.deleteMany()
})

afterAll(async () => {
	await prismaTest.income.deleteMany()
	await prismaTest.user.deleteMany()
	await prismaTest.$disconnect()
})

describe('PrismaIncomeRepository', () => {
	describe('findAll', () => {
		it('returns empty array when no records exist', async () => {
			const user = await createTestUser(prismaTest)
			const result = await repository.findAll(user.id)
			expect(result).toEqual([])
		})

		it('returns all records ordered by month descending', async () => {
			const user = await createTestUser(prismaTest)
			await prismaTest.income.create({
				data: { ...baseIncome, month: APR_2026, userId: user.id },
			})
			await prismaTest.income.create({
				data: { ...baseIncome, month: MAY_2026, userId: user.id },
			})

			const result = await repository.findAll(user.id)

			expect(result).toHaveLength(2)
			expect(result[0]?.month).toEqual(MAY_2026)
			expect(result[1]?.month).toEqual(APR_2026)
		})

		it('returns numeric values for Decimal fields', async () => {
			const user = await createTestUser(prismaTest)
			await prismaTest.income.create({
				data: { ...baseIncome, month: MAY_2026, userId: user.id },
			})

			const result = await repository.findAll(user.id)

			expect(typeof result[0]?.grossIncomeUsd).toBe('number')
			expect(typeof result[0]?.budgetCapUsd).toBe('number')
			expect(typeof result[0]?.automaticInvestmentUsd).toBe('number')
			expect(typeof result[0]?.exchangeRate).toBe('number')
		})

		it('does not return records belonging to another user', async () => {
			const user = await createTestUser(prismaTest)
			const otherUser = await createTestUser(prismaTest)
			await prismaTest.income.create({
				data: { ...baseIncome, month: MAY_2026, userId: otherUser.id },
			})

			const result = await repository.findAll(user.id)
			expect(result).toEqual([])
		})
	})

	describe('findById', () => {
		it('returns the record when it exists', async () => {
			const user = await createTestUser(prismaTest)
			const created = await prismaTest.income.create({
				data: { ...baseIncome, month: MAY_2026, userId: user.id },
			})

			const result = await repository.findById(user.id, created.id)

			expect(result).not.toBeNull()
			expect(result?.month).toEqual(MAY_2026)
			expect(result?.grossIncomeUsd).toBe(5433)
			expect(result?.budgetCapUsd).toBe(5000)
			expect(result?.automaticInvestmentUsd).toBe(433)
			expect(result?.automaticDest).toBe('etf_xtb')
			expect(result?.exchangeRate).toBe(7800)
		})

		it('returns null when record does not exist', async () => {
			const user = await createTestUser(prismaTest)
			const result = await repository.findById(user.id, 999)
			expect(result).toBeNull()
		})

		it('returns null when record belongs to another user', async () => {
			const user = await createTestUser(prismaTest)
			const otherUser = await createTestUser(prismaTest)
			const created = await prismaTest.income.create({
				data: { ...baseIncome, month: MAY_2026, userId: otherUser.id },
			})

			const result = await repository.findById(user.id, created.id)
			expect(result).toBeNull()
		})
	})

	describe('findByMonth', () => {
		it('returns the income record for the given month', async () => {
			const user = await createTestUser(prismaTest)
			await prismaTest.income.create({
				data: { ...baseIncome, month: MAY_2026, userId: user.id },
			})
			await prismaTest.income.create({
				data: { ...baseIncome, month: APR_2026, userId: user.id },
			})

			const result = await repository.findByMonth(user.id, MAY_2026)

			expect(result).not.toBeNull()
			expect(result?.month).toEqual(MAY_2026)
		})

		it('returns null when no record exists for that month', async () => {
			const user = await createTestUser(prismaTest)
			const result = await repository.findByMonth(user.id, MAY_2026)
			expect(result).toBeNull()
		})

		it('does not return a record for that month belonging to another user', async () => {
			const user = await createTestUser(prismaTest)
			const otherUser = await createTestUser(prismaTest)
			await prismaTest.income.create({
				data: { ...baseIncome, month: MAY_2026, userId: otherUser.id },
			})

			const result = await repository.findByMonth(user.id, MAY_2026)
			expect(result).toBeNull()
		})
	})

	describe('create', () => {
		it('creates a record with all required fields', async () => {
			const user = await createTestUser(prismaTest)
			const result = await repository.create(user.id, {
				...baseIncome,
				month: MAY_2026,
			})

			expect(result.id).toBeDefined()
			expect(result.month).toEqual(MAY_2026)
			expect(result.grossIncomeUsd).toBe(5433)
			expect(result.budgetCapUsd).toBe(5000)
			expect(result.automaticInvestmentUsd).toBe(433)
			expect(result.automaticDest).toBe('etf_xtb')
			expect(result.exchangeRate).toBe(7800)
			expect(result.notes).toBeNull()
			expect(result.createdAt).toBeInstanceOf(Date)
		})

		it('creates a record with optional notes', async () => {
			const user = await createTestUser(prismaTest)
			const result = await repository.create(user.id, {
				...baseIncome,
				month: MAY_2026,
				notes: 'Mes con bono incluido',
			})

			expect(result.notes).toBe('Mes con bono incluido')
		})

		it('allows the same month for two different users', async () => {
			const user = await createTestUser(prismaTest)
			const otherUser = await createTestUser(prismaTest)
			await repository.create(user.id, { ...baseIncome, month: MAY_2026 })

			const result = await repository.create(otherUser.id, {
				...baseIncome,
				month: MAY_2026,
			})

			expect(result.month).toEqual(MAY_2026)
		})
	})

	describe('update', () => {
		it('updates the provided fields', async () => {
			const user = await createTestUser(prismaTest)
			const created = await prismaTest.income.create({
				data: { ...baseIncome, month: MAY_2026, userId: user.id },
			})

			const result = await repository.update(user.id, created.id, {
				budgetCapUsd: 4800,
				automaticInvestmentUsd: 633,
				notes: 'Ajuste de techo',
			})

			expect(result.budgetCapUsd).toBe(4800)
			expect(result.automaticInvestmentUsd).toBe(633)
			expect(result.notes).toBe('Ajuste de techo')
			expect(result.grossIncomeUsd).toBe(5433)
		})

		it('updates only the provided fields leaving others unchanged', async () => {
			const user = await createTestUser(prismaTest)
			const created = await prismaTest.income.create({
				data: {
					...baseIncome,
					month: MAY_2026,
					notes: 'nota original',
					userId: user.id,
				},
			})

			const result = await repository.update(user.id, created.id, {
				exchangeRate: 7850,
			})

			expect(result.exchangeRate).toBe(7850)
			expect(result.notes).toBe('nota original')
			expect(result.automaticDest).toBe('etf_xtb')
		})

		it('rejects updating a record that belongs to another user', async () => {
			const user = await createTestUser(prismaTest)
			const otherUser = await createTestUser(prismaTest)
			const created = await prismaTest.income.create({
				data: { ...baseIncome, month: MAY_2026, userId: otherUser.id },
			})

			await expect(
				repository.update(user.id, created.id, { budgetCapUsd: 100 }),
			).rejects.toThrow()
		})
	})
})
