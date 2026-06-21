// @vitest-environment node
import { afterAll, beforeEach, describe, expect, it } from 'vitest'
import { prismaTest } from '@/test/prisma'
import { createPrismaSnapshotRepository } from './PrismaSnapshotRepository'

const repository = createPrismaSnapshotRepository(prismaTest)

const MAY_15 = new Date('2026-05-15')
const APR_10 = new Date('2026-04-10')
const MAR_05 = new Date('2026-03-05')

const baseSnapshot = {
	incomeUsd: 5433,
	exchangeRateValue: 7800,
	balanceItauUsd: 2000,
	balanceItauGs: 1500000,
	netWorthUsd: 45000,
}

beforeEach(async () => {
	await prismaTest.snapshot.deleteMany()
})

afterAll(async () => {
	await prismaTest.snapshot.deleteMany()
	await prismaTest.$disconnect()
})

describe('PrismaSnapshotRepository', () => {
	describe('findAll', () => {
		it('returns empty array when no snapshots exist', async () => {
			const result = await repository.findAll()
			expect(result).toEqual([])
		})

		it('returns all snapshots ordered by date descending', async () => {
			await prismaTest.snapshot.create({ data: { date: APR_10 } })
			await prismaTest.snapshot.create({ data: { date: MAY_15 } })
			await prismaTest.snapshot.create({ data: { date: MAR_05 } })

			const result = await repository.findAll()

			expect(result).toHaveLength(3)
			expect(result[0]?.date).toEqual(MAY_15)
			expect(result[1]?.date).toEqual(APR_10)
			expect(result[2]?.date).toEqual(MAR_05)
		})

		it('returns numeric values for Decimal fields', async () => {
			await prismaTest.snapshot.create({
				data: { date: MAY_15, ...baseSnapshot },
			})

			const result = await repository.findAll()

			expect(typeof result[0]?.incomeUsd).toBe('number')
			expect(typeof result[0]?.exchangeRateValue).toBe('number')
			expect(typeof result[0]?.netWorthUsd).toBe('number')
			expect(result[0]?.incomeUsd).toBe(5433)
			expect(result[0]?.exchangeRateValue).toBe(7800)
			expect(result[0]?.netWorthUsd).toBe(45000)
			expect(Array.isArray(result[0]?.investments)).toBe(true)
		})
	})

	describe('findById', () => {
		it('returns the snapshot when it exists', async () => {
			const created = await prismaTest.snapshot.create({
				data: { date: MAY_15, ...baseSnapshot },
			})

			const result = await repository.findById(created.id)

			expect(result).not.toBeNull()
			expect(result?.date).toEqual(MAY_15)
			expect(result?.incomeUsd).toBe(5433)
			expect(result?.balanceItauUsd).toBe(2000)
			expect(result?.balanceItauGs).toBe(1500000)
		})

		it('returns null when snapshot does not exist', async () => {
			const result = await repository.findById(999)
			expect(result).toBeNull()
		})
	})

	describe('findLatest', () => {
		it('returns the most recent snapshot', async () => {
			await prismaTest.snapshot.create({ data: { date: MAR_05 } })
			await prismaTest.snapshot.create({
				data: { date: MAY_15, incomeUsd: 5433 },
			})
			await prismaTest.snapshot.create({ data: { date: APR_10 } })

			const result = await repository.findLatest()

			expect(result).not.toBeNull()
			expect(result?.date).toEqual(MAY_15)
			expect(result?.incomeUsd).toBe(5433)
		})

		it('returns null when no snapshots exist', async () => {
			const result = await repository.findLatest()
			expect(result).toBeNull()
		})
	})

	describe('findByDateRange', () => {
		it('returns snapshots within the date range', async () => {
			await prismaTest.snapshot.create({ data: { date: MAR_05 } })
			await prismaTest.snapshot.create({ data: { date: APR_10 } })
			await prismaTest.snapshot.create({ data: { date: MAY_15 } })

			const result = await repository.findByDateRange(
				new Date('2026-04-01'),
				new Date('2026-05-01'),
			)

			expect(result).toHaveLength(1)
			expect(result[0]?.date).toEqual(APR_10)
		})
	})

	describe('create', () => {
		it('creates a snapshot with only date (all fields null)', async () => {
			const result = await repository.create({ date: MAY_15 })

			expect(result.id).toBeDefined()
			expect(result.date).toEqual(MAY_15)
			expect(result.incomeUsd).toBeNull()
			expect(result.exchangeRateValue).toBeNull()
			expect(result.netWorthUsd).toBeNull()
			expect(result.notes).toBeNull()
			expect(result.createdAt).toBeInstanceOf(Date)
		})

		it('creates a snapshot with no investments returns empty array', async () => {
			const result = await repository.create({ date: MAY_15 })
			expect(result.investments).toEqual([])
		})

		it('allows multiple snapshots for the same date', async () => {
			const first = await repository.create({ date: MAY_15, incomeUsd: 1000 })
			const second = await repository.create({ date: MAY_15, incomeUsd: 2000 })

			expect(first.id).not.toBe(second.id)
			expect(first.date).toEqual(MAY_15)
			expect(second.date).toEqual(MAY_15)
		})

		it('creates investments with GS currency', async () => {
			const result = await repository.create({
				date: MAY_15,
				investments: [
					{
						name: 'Ahorro programado',
						currency: 'GS',
						value: 1200000,
						returnPct: 4,
					},
				],
			})

			expect(result.investments[0]?.currency).toBe('GS')
			expect(result.investments[0]?.value).toBe(1200000)
			expect(result.investments[0]?.returnPct).toBe(4)
		})

		it('creates a snapshot with balance and investment fields', async () => {
			const result = await repository.create({
				date: MAY_15,
				incomeUsd: 5433,
				exchangeRateValue: 7800,
				balanceItauUsd: 2000,
				balanceItauGs: 1500000,
				balanceUenoUsd: 500,
				itauCardGs: 800000,
				netWorthUsd: 45000,
				totalInvestedUsd: 37000,
				totalDebtUsd: 102.56,
				savingsRatePct: 7.97,
				notes: 'Mes con bono',
				investments: [
					{ name: 'Investor Fund', currency: 'USD', value: 12000 },
					{ name: 'ETF Portfolio', currency: 'USD', value: 25000 },
				],
			})

			expect(result.incomeUsd).toBe(5433)
			expect(result.balanceItauUsd).toBe(2000)
			expect(result.investments).toHaveLength(2)
			expect(result.investments[0]?.value).toBe(12000)
			expect(result.investments[1]?.value).toBe(25000)
			expect(result.savingsRatePct).toBe(7.97)
			expect(result.notes).toBe('Mes con bono')
		})
	})

	describe('update', () => {
		it('updates the provided fields', async () => {
			const created = await prismaTest.snapshot.create({
				data: { date: MAY_15, incomeUsd: 5000 },
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

		it('replaces investments when provided', async () => {
			const created = await repository.create({
				date: MAY_15,
				investments: [{ name: 'Investor', currency: 'USD', value: 10000 }],
			})

			const result = await repository.update(created.id, {
				investments: [
					{ name: 'ETF', currency: 'USD', value: 25000, returnPct: 11 },
					{
						name: 'Ahorro programado',
						currency: 'GS',
						value: 900000,
						returnPct: 4,
					},
				],
			})

			expect(result.investments).toHaveLength(2)
			expect(result.investments[0]?.name).toBe('ETF')
			expect(result.investments[1]?.name).toBe('Ahorro programado')
		})

		it('leaves investments untouched when not provided', async () => {
			const created = await repository.create({
				date: MAY_15,
				investments: [{ name: 'Investor', currency: 'USD', value: 10000 }],
			})

			const result = await repository.update(created.id, { incomeUsd: 5000 })

			expect(result.investments).toHaveLength(1)
			expect(result.investments[0]?.name).toBe('Investor')
		})

		it('clears all investments when provided as empty array', async () => {
			const created = await repository.create({
				date: MAY_15,
				investments: [{ name: 'Investor', currency: 'USD', value: 10000 }],
			})

			const result = await repository.update(created.id, { investments: [] })

			expect(result.investments).toEqual([])
		})

		it('can set fields to null', async () => {
			const created = await prismaTest.snapshot.create({
				data: { date: MAY_15, incomeUsd: 5433, notes: 'nota' },
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
