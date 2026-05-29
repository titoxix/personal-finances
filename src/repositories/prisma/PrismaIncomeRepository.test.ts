// @vitest-environment node
import { afterAll, beforeEach, describe, expect, it } from 'vitest'
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
})

afterAll(async () => {
	await prismaTest.income.deleteMany()
	await prismaTest.$disconnect()
})

describe('PrismaIncomeRepository', () => {
	describe('findAll', () => {
		it('returns empty array when no records exist', async () => {
			const result = await repository.findAll()
			expect(result).toEqual([])
		})

		it('returns all records ordered by month descending', async () => {
			await prismaTest.income.create({
				data: { ...baseIncome, month: APR_2026 },
			})
			await prismaTest.income.create({
				data: { ...baseIncome, month: MAY_2026 },
			})

			const result = await repository.findAll()

			expect(result).toHaveLength(2)
			expect(result[0]?.month).toEqual(MAY_2026)
			expect(result[1]?.month).toEqual(APR_2026)
		})

		it('returns numeric values for Decimal fields', async () => {
			await prismaTest.income.create({
				data: { ...baseIncome, month: MAY_2026 },
			})

			const result = await repository.findAll()

			expect(typeof result[0]?.grossIncomeUsd).toBe('number')
			expect(typeof result[0]?.budgetCapUsd).toBe('number')
			expect(typeof result[0]?.automaticInvestmentUsd).toBe('number')
			expect(typeof result[0]?.exchangeRate).toBe('number')
		})
	})

	describe('findById', () => {
		it('returns the record when it exists', async () => {
			const created = await prismaTest.income.create({
				data: { ...baseIncome, month: MAY_2026 },
			})

			const result = await repository.findById(created.id)

			expect(result).not.toBeNull()
			expect(result?.month).toEqual(MAY_2026)
			expect(result?.grossIncomeUsd).toBe(5433)
			expect(result?.budgetCapUsd).toBe(5000)
			expect(result?.automaticInvestmentUsd).toBe(433)
			expect(result?.automaticDest).toBe('etf_xtb')
			expect(result?.exchangeRate).toBe(7800)
		})

		it('returns null when record does not exist', async () => {
			const result = await repository.findById(999)
			expect(result).toBeNull()
		})
	})

	describe('findByMonth', () => {
		it('returns the income record for the given month', async () => {
			await prismaTest.income.create({
				data: { ...baseIncome, month: MAY_2026 },
			})
			await prismaTest.income.create({
				data: { ...baseIncome, month: APR_2026 },
			})

			const result = await repository.findByMonth(MAY_2026)

			expect(result).not.toBeNull()
			expect(result?.month).toEqual(MAY_2026)
		})

		it('returns null when no record exists for that month', async () => {
			const result = await repository.findByMonth(MAY_2026)
			expect(result).toBeNull()
		})
	})

	describe('create', () => {
		it('creates a record with all required fields', async () => {
			const result = await repository.create({
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
			const result = await repository.create({
				...baseIncome,
				month: MAY_2026,
				notes: 'Mes con bono incluido',
			})

			expect(result.notes).toBe('Mes con bono incluido')
		})
	})

	describe('update', () => {
		it('updates the provided fields', async () => {
			const created = await prismaTest.income.create({
				data: { ...baseIncome, month: MAY_2026 },
			})

			const result = await repository.update(created.id, {
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
			const created = await prismaTest.income.create({
				data: { ...baseIncome, month: MAY_2026, notes: 'nota original' },
			})

			const result = await repository.update(created.id, { exchangeRate: 7850 })

			expect(result.exchangeRate).toBe(7850)
			expect(result.notes).toBe('nota original')
			expect(result.automaticDest).toBe('etf_xtb')
		})
	})
})
