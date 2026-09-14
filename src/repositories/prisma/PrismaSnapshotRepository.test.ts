// @vitest-environment node
import { afterAll, beforeEach, describe, expect, it } from 'vitest'
import { createTestUser } from '@/test/factories'
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
	await prismaTest.user.deleteMany()
})

afterAll(async () => {
	await prismaTest.snapshot.deleteMany()
	await prismaTest.user.deleteMany()
	await prismaTest.$disconnect()
})

describe('PrismaSnapshotRepository', () => {
	describe('findAll', () => {
		it('returns empty array when no snapshots exist', async () => {
			const user = await createTestUser(prismaTest)
			const result = await repository.findAll(user.id)
			expect(result).toEqual([])
		})

		it('returns all snapshots ordered by date descending', async () => {
			const user = await createTestUser(prismaTest)
			await prismaTest.snapshot.create({
				data: { date: APR_10, userId: user.id },
			})
			await prismaTest.snapshot.create({
				data: { date: MAY_15, userId: user.id },
			})
			await prismaTest.snapshot.create({
				data: { date: MAR_05, userId: user.id },
			})

			const result = await repository.findAll(user.id)

			expect(result).toHaveLength(3)
			expect(result[0]?.date).toEqual(MAY_15)
			expect(result[1]?.date).toEqual(APR_10)
			expect(result[2]?.date).toEqual(MAR_05)
		})

		it('returns numeric values for Decimal fields', async () => {
			const user = await createTestUser(prismaTest)
			await prismaTest.snapshot.create({
				data: { date: MAY_15, ...baseSnapshot, userId: user.id },
			})

			const result = await repository.findAll(user.id)

			expect(typeof result[0]?.incomeUsd).toBe('number')
			expect(typeof result[0]?.exchangeRateValue).toBe('number')
			expect(typeof result[0]?.netWorthUsd).toBe('number')
			expect(result[0]?.incomeUsd).toBe(5433)
			expect(result[0]?.exchangeRateValue).toBe(7800)
			expect(result[0]?.netWorthUsd).toBe(45000)
			expect(Array.isArray(result[0]?.investments)).toBe(true)
		})

		it('does not return snapshots belonging to another user', async () => {
			const user = await createTestUser(prismaTest)
			const otherUser = await createTestUser(prismaTest)
			await prismaTest.snapshot.create({
				data: { date: MAY_15, userId: otherUser.id },
			})

			const result = await repository.findAll(user.id)
			expect(result).toEqual([])
		})
	})

	describe('findById', () => {
		it('returns the snapshot when it exists', async () => {
			const user = await createTestUser(prismaTest)
			const created = await prismaTest.snapshot.create({
				data: { date: MAY_15, ...baseSnapshot, userId: user.id },
			})

			const result = await repository.findById(user.id, created.id)

			expect(result).not.toBeNull()
			expect(result?.date).toEqual(MAY_15)
			expect(result?.incomeUsd).toBe(5433)
			expect(result?.balanceItauUsd).toBe(2000)
			expect(result?.balanceItauGs).toBe(1500000)
		})

		it('returns null when snapshot does not exist', async () => {
			const user = await createTestUser(prismaTest)
			const result = await repository.findById(user.id, 999)
			expect(result).toBeNull()
		})

		it('returns null when snapshot belongs to another user', async () => {
			const user = await createTestUser(prismaTest)
			const otherUser = await createTestUser(prismaTest)
			const created = await prismaTest.snapshot.create({
				data: { date: MAY_15, userId: otherUser.id },
			})

			const result = await repository.findById(user.id, created.id)
			expect(result).toBeNull()
		})
	})

	describe('findLatest', () => {
		it('returns the most recent snapshot', async () => {
			const user = await createTestUser(prismaTest)
			await prismaTest.snapshot.create({
				data: { date: MAR_05, userId: user.id },
			})
			await prismaTest.snapshot.create({
				data: { date: MAY_15, incomeUsd: 5433, userId: user.id },
			})
			await prismaTest.snapshot.create({
				data: { date: APR_10, userId: user.id },
			})

			const result = await repository.findLatest(user.id)

			expect(result).not.toBeNull()
			expect(result?.date).toEqual(MAY_15)
			expect(result?.incomeUsd).toBe(5433)
		})

		it('returns null when no snapshots exist', async () => {
			const user = await createTestUser(prismaTest)
			const result = await repository.findLatest(user.id)
			expect(result).toBeNull()
		})

		it('does not return the latest snapshot belonging to another user', async () => {
			const user = await createTestUser(prismaTest)
			const otherUser = await createTestUser(prismaTest)
			await prismaTest.snapshot.create({
				data: { date: MAY_15, userId: otherUser.id },
			})

			const result = await repository.findLatest(user.id)
			expect(result).toBeNull()
		})
	})

	describe('findByDateRange', () => {
		it('returns snapshots within the date range', async () => {
			const user = await createTestUser(prismaTest)
			await prismaTest.snapshot.create({
				data: { date: MAR_05, userId: user.id },
			})
			await prismaTest.snapshot.create({
				data: { date: APR_10, userId: user.id },
			})
			await prismaTest.snapshot.create({
				data: { date: MAY_15, userId: user.id },
			})

			const result = await repository.findByDateRange(
				user.id,
				new Date('2026-04-01'),
				new Date('2026-05-01'),
			)

			expect(result).toHaveLength(1)
			expect(result[0]?.date).toEqual(APR_10)
		})
	})

	describe('create', () => {
		it('creates a snapshot with only date (all fields null)', async () => {
			const user = await createTestUser(prismaTest)
			const result = await repository.create(user.id, { date: MAY_15 })

			expect(result.id).toBeDefined()
			expect(result.date).toEqual(MAY_15)
			expect(result.incomeUsd).toBeNull()
			expect(result.exchangeRateValue).toBeNull()
			expect(result.netWorthUsd).toBeNull()
			expect(result.notes).toBeNull()
			expect(result.createdAt).toBeInstanceOf(Date)
		})

		it('creates a snapshot with no investments returns empty array', async () => {
			const user = await createTestUser(prismaTest)
			const result = await repository.create(user.id, { date: MAY_15 })
			expect(result.investments).toEqual([])
		})

		it('allows multiple snapshots for the same date', async () => {
			const user = await createTestUser(prismaTest)
			const first = await repository.create(user.id, {
				date: MAY_15,
				incomeUsd: 1000,
			})
			const second = await repository.create(user.id, {
				date: MAY_15,
				incomeUsd: 2000,
			})

			expect(first.id).not.toBe(second.id)
			expect(first.date).toEqual(MAY_15)
			expect(second.date).toEqual(MAY_15)
		})

		it('creates investments with GS currency', async () => {
			const user = await createTestUser(prismaTest)
			const result = await repository.create(user.id, {
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
			const user = await createTestUser(prismaTest)
			const result = await repository.create(user.id, {
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
			const user = await createTestUser(prismaTest)
			const created = await prismaTest.snapshot.create({
				data: { date: MAY_15, incomeUsd: 5000, userId: user.id },
			})

			const result = await repository.update(user.id, created.id, {
				incomeUsd: 5433,
				netWorthUsd: 45000,
				notes: 'Actualizado con bono',
			})

			expect(result.incomeUsd).toBe(5433)
			expect(result.netWorthUsd).toBe(45000)
			expect(result.notes).toBe('Actualizado con bono')
		})

		it('replaces investments when provided', async () => {
			const user = await createTestUser(prismaTest)
			const created = await repository.create(user.id, {
				date: MAY_15,
				investments: [{ name: 'Investor', currency: 'USD', value: 10000 }],
			})

			const result = await repository.update(user.id, created.id, {
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
			const user = await createTestUser(prismaTest)
			const created = await repository.create(user.id, {
				date: MAY_15,
				investments: [{ name: 'Investor', currency: 'USD', value: 10000 }],
			})

			const result = await repository.update(user.id, created.id, {
				incomeUsd: 5000,
			})

			expect(result.investments).toHaveLength(1)
			expect(result.investments[0]?.name).toBe('Investor')
		})

		it('clears all investments when provided as empty array', async () => {
			const user = await createTestUser(prismaTest)
			const created = await repository.create(user.id, {
				date: MAY_15,
				investments: [{ name: 'Investor', currency: 'USD', value: 10000 }],
			})

			const result = await repository.update(user.id, created.id, {
				investments: [],
			})

			expect(result.investments).toEqual([])
		})

		it('can set fields to null', async () => {
			const user = await createTestUser(prismaTest)
			const created = await prismaTest.snapshot.create({
				data: { date: MAY_15, incomeUsd: 5433, notes: 'nota', userId: user.id },
			})

			const result = await repository.update(user.id, created.id, {
				incomeUsd: null,
				notes: null,
			})

			expect(result.incomeUsd).toBeNull()
			expect(result.notes).toBeNull()
		})

		it('rejects updating a snapshot that belongs to another user', async () => {
			const user = await createTestUser(prismaTest)
			const otherUser = await createTestUser(prismaTest)
			const created = await prismaTest.snapshot.create({
				data: { date: MAY_15, userId: otherUser.id },
			})

			await expect(
				repository.update(user.id, created.id, { incomeUsd: 100 }),
			).rejects.toThrow()
		})
	})
})
