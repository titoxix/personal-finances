// @vitest-environment node
import { afterAll, beforeEach, describe, expect, it } from 'vitest'
import { prismaTest } from '@/test/prisma'
import { PrismaMonthlySnapshotRepository } from './PrismaMonthlySnapshotRepository'

const repository = new PrismaMonthlySnapshotRepository(prismaTest)

const MAY_2026 = new Date('2026-05-01')
const APR_2026 = new Date('2026-04-01')
const MAR_2026 = new Date('2026-03-01')

const baseSnapshot = {
	incomeUsd: 5433,
	exchangeRateValue: 7800,
	balanceItauUsd: 2000,
	balanceItauGs: 1500000,
	netWorthUsd: 45000,
}

beforeEach(async () => {
	await prismaTest.monthlySnapshot.deleteMany()
})

afterAll(async () => {
	await prismaTest.monthlySnapshot.deleteMany()
	await prismaTest.$disconnect()
})

describe('PrismaMonthlySnapshotRepository', () => {
	describe('findAll', () => {
		it('returns empty array when no snapshots exist', async () => {
			const result = await repository.findAll()
			expect(result).toEqual([])
		})

		it('returns all snapshots ordered by month descending', async () => {
			await prismaTest.monthlySnapshot.create({ data: { month: APR_2026 } })
			await prismaTest.monthlySnapshot.create({ data: { month: MAY_2026 } })
			await prismaTest.monthlySnapshot.create({ data: { month: MAR_2026 } })

			const result = await repository.findAll()

			expect(result).toHaveLength(3)
			expect(result[0]?.month).toEqual(MAY_2026)
			expect(result[1]?.month).toEqual(APR_2026)
			expect(result[2]?.month).toEqual(MAR_2026)
		})

		it('returns numeric values for Decimal fields', async () => {
			await prismaTest.monthlySnapshot.create({
				data: { month: MAY_2026, ...baseSnapshot },
			})

			const result = await repository.findAll()

			expect(typeof result[0]?.incomeUsd).toBe('number')
			expect(typeof result[0]?.exchangeRateValue).toBe('number')
			expect(typeof result[0]?.netWorthUsd).toBe('number')
			expect(result[0]?.incomeUsd).toBe(5433)
			expect(result[0]?.exchangeRateValue).toBe(7800)
			expect(result[0]?.netWorthUsd).toBe(45000)
		})
	})

	describe('findById', () => {
		it('returns the snapshot when it exists', async () => {
			const created = await prismaTest.monthlySnapshot.create({
				data: { month: MAY_2026, ...baseSnapshot },
			})

			const result = await repository.findById(created.id)

			expect(result).not.toBeNull()
			expect(result?.month).toEqual(MAY_2026)
			expect(result?.incomeUsd).toBe(5433)
			expect(result?.balanceItauUsd).toBe(2000)
			expect(result?.balanceItauGs).toBe(1500000)
		})

		it('returns null when snapshot does not exist', async () => {
			const result = await repository.findById(999)
			expect(result).toBeNull()
		})
	})

	describe('findByMonth', () => {
		it('returns the snapshot for the given month', async () => {
			await prismaTest.monthlySnapshot.create({ data: { month: APR_2026 } })
			await prismaTest.monthlySnapshot.create({ data: { month: MAY_2026, incomeUsd: 5433 } })

			const result = await repository.findByMonth(MAY_2026)

			expect(result).not.toBeNull()
			expect(result?.month).toEqual(MAY_2026)
			expect(result?.incomeUsd).toBe(5433)
		})

		it('returns null when no snapshot exists for that month', async () => {
			const result = await repository.findByMonth(MAY_2026)
			expect(result).toBeNull()
		})
	})

	describe('findLatest', () => {
		it('returns the most recent snapshot', async () => {
			await prismaTest.monthlySnapshot.create({ data: { month: MAR_2026 } })
			await prismaTest.monthlySnapshot.create({ data: { month: MAY_2026, incomeUsd: 5433 } })
			await prismaTest.monthlySnapshot.create({ data: { month: APR_2026 } })

			const result = await repository.findLatest()

			expect(result).not.toBeNull()
			expect(result?.month).toEqual(MAY_2026)
			expect(result?.incomeUsd).toBe(5433)
		})

		it('returns null when no snapshots exist', async () => {
			const result = await repository.findLatest()
			expect(result).toBeNull()
		})
	})

	describe('create', () => {
		it('creates a snapshot with only month (all fields null)', async () => {
			const result = await repository.create({ month: MAY_2026 })

			expect(result.id).toBeDefined()
			expect(result.month).toEqual(MAY_2026)
			expect(result.incomeUsd).toBeNull()
			expect(result.exchangeRateValue).toBeNull()
			expect(result.netWorthUsd).toBeNull()
			expect(result.notes).toBeNull()
			expect(result.createdAt).toBeInstanceOf(Date)
		})

		it('creates a snapshot with balance and investment fields', async () => {
			const result = await repository.create({
				month: MAY_2026,
				incomeUsd: 5433,
				exchangeRateValue: 7800,
				balanceItauUsd: 2000,
				balanceItauGs: 1500000,
				balanceUenoUsd: 500,
				investorFundUsd: 12000,
				etfPortfolioUsd: 25000,
				itauCardGs: 800000,
				netWorthUsd: 45000,
				totalInvestedUsd: 37000,
				totalDebtUsd: 102.56,
				savingsRatePct: 7.97,
				notes: 'Mes con bono',
			})

			expect(result.incomeUsd).toBe(5433)
			expect(result.balanceItauUsd).toBe(2000)
			expect(result.investorFundUsd).toBe(12000)
			expect(result.etfPortfolioUsd).toBe(25000)
			expect(result.savingsRatePct).toBe(7.97)
			expect(result.notes).toBe('Mes con bono')
		})
	})

	describe('update', () => {
		it('updates the provided fields', async () => {
			const created = await prismaTest.monthlySnapshot.create({
				data: { month: MAY_2026, incomeUsd: 5000 },
			})

			const result = await repository.update(created.id, {
				incomeUsd: 5433,
				netWorthUsd: 45000,
				notes: 'Actualizado con bono',
			})

			expect(result.incomeUsd).toBe(5433)
			expect(result.netWorthUsd).toBe(45000)
			expect(result.notes).toBe('Actualizado con bono')
		})

		it('can set fields to null', async () => {
			const created = await prismaTest.monthlySnapshot.create({
				data: { month: MAY_2026, incomeUsd: 5433, notes: 'nota' },
			})

			const result = await repository.update(created.id, {
				incomeUsd: null,
				notes: null,
			})

			expect(result.incomeUsd).toBeNull()
			expect(result.notes).toBeNull()
		})
	})
})
