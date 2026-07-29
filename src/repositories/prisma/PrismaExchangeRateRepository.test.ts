// @vitest-environment node
import { afterAll, beforeEach, describe, expect, it } from 'vitest'
import { createTestUser } from '@/test/factories'
import { prismaTest } from '@/test/prisma'
import { createPrismaExchangeRateRepository } from './PrismaExchangeRateRepository'

const repository = createPrismaExchangeRateRepository(prismaTest)

beforeEach(async () => {
	await prismaTest.exchangeRate.deleteMany()
	await prismaTest.user.deleteMany()
})

afterAll(async () => {
	await prismaTest.exchangeRate.deleteMany()
	await prismaTest.user.deleteMany()
	await prismaTest.$disconnect()
})

describe('PrismaExchangeRateRepository', () => {
	describe('findAll', () => {
		it('returns empty array when no records exist', async () => {
			const user = await createTestUser(prismaTest)
			const result = await repository.findAll(user.id)
			expect(result).toEqual([])
		})

		it('returns all records ordered by recordedAt descending', async () => {
			const user = await createTestUser(prismaTest)
			await prismaTest.exchangeRate.create({
				data: {
					source: 'itau',
					rateSell: 7800,
					recordedAt: new Date('2024-01-01T09:00:00Z'),
					userId: user.id,
				},
			})
			await prismaTest.exchangeRate.create({
				data: {
					source: 'ueno',
					rateSell: 7820,
					recordedAt: new Date('2024-01-02T09:00:00Z'),
					userId: user.id,
				},
			})

			const result = await repository.findAll(user.id)

			expect(result).toHaveLength(2)
			expect(result[0]?.source).toBe('ueno')
			expect(result[1]?.source).toBe('itau')
		})

		it('returns rates as plain numbers', async () => {
			const user = await createTestUser(prismaTest)
			await prismaTest.exchangeRate.create({
				data: { source: 'bcp', rateMid: 7810.5, userId: user.id },
			})

			const result = await repository.findAll(user.id)

			expect(typeof result[0]?.rateMid).toBe('number')
			expect(result[0]?.rateMid).toBe(7810.5)
		})

		it('does not return records belonging to another user', async () => {
			const user = await createTestUser(prismaTest)
			const otherUser = await createTestUser(prismaTest)
			await prismaTest.exchangeRate.create({
				data: { source: 'itau', rateSell: 7800, userId: otherUser.id },
			})

			const result = await repository.findAll(user.id)
			expect(result).toEqual([])
		})
	})

	describe('findById', () => {
		it('returns the record when it exists', async () => {
			const user = await createTestUser(prismaTest)
			const created = await prismaTest.exchangeRate.create({
				data: {
					source: 'itau',
					rateBuy: 7700,
					rateSell: 7800,
					userId: user.id,
				},
			})

			const result = await repository.findById(user.id, created.id)

			expect(result).not.toBeNull()
			expect(result?.source).toBe('itau')
			expect(result?.rateBuy).toBe(7700)
			expect(result?.rateSell).toBe(7800)
		})

		it('returns null when record does not exist', async () => {
			const user = await createTestUser(prismaTest)
			const result = await repository.findById(user.id, 999)
			expect(result).toBeNull()
		})

		it('returns null when record belongs to another user', async () => {
			const user = await createTestUser(prismaTest)
			const otherUser = await createTestUser(prismaTest)
			const created = await prismaTest.exchangeRate.create({
				data: { source: 'itau', rateBuy: 7700, userId: otherUser.id },
			})

			const result = await repository.findById(user.id, created.id)
			expect(result).toBeNull()
		})
	})

	describe('findBySource', () => {
		it('returns only records for the given source, ordered by recordedAt descending', async () => {
			const user = await createTestUser(prismaTest)
			await prismaTest.exchangeRate.create({
				data: {
					source: 'itau',
					rateSell: 7800,
					recordedAt: new Date('2024-01-01T09:00:00Z'),
					userId: user.id,
				},
			})
			await prismaTest.exchangeRate.create({
				data: {
					source: 'itau',
					rateSell: 7820,
					recordedAt: new Date('2024-01-02T09:00:00Z'),
					userId: user.id,
				},
			})
			await prismaTest.exchangeRate.create({
				data: { source: 'ueno', rateSell: 7830, userId: user.id },
			})

			const result = await repository.findBySource(user.id, 'itau')

			expect(result).toHaveLength(2)
			expect(result.every((r) => r.source === 'itau')).toBe(true)
			expect(result[0]?.rateSell).toBe(7820)
			expect(result[1]?.rateSell).toBe(7800)
		})

		it('returns empty array when no records exist for source', async () => {
			const user = await createTestUser(prismaTest)
			const result = await repository.findBySource(user.id, 'bcp')
			expect(result).toEqual([])
		})

		it('does not return records for that source belonging to another user', async () => {
			const user = await createTestUser(prismaTest)
			const otherUser = await createTestUser(prismaTest)
			await prismaTest.exchangeRate.create({
				data: { source: 'itau', rateSell: 7800, userId: otherUser.id },
			})

			const result = await repository.findBySource(user.id, 'itau')
			expect(result).toEqual([])
		})
	})

	describe('findLatestBySource', () => {
		it('returns the most recent record for the given source', async () => {
			const user = await createTestUser(prismaTest)
			await prismaTest.exchangeRate.create({
				data: {
					source: 'itau',
					rateSell: 7800,
					recordedAt: new Date('2024-01-01T09:00:00Z'),
					userId: user.id,
				},
			})
			await prismaTest.exchangeRate.create({
				data: {
					source: 'itau',
					rateSell: 7850,
					recordedAt: new Date('2024-01-03T09:00:00Z'),
					userId: user.id,
				},
			})
			await prismaTest.exchangeRate.create({
				data: {
					source: 'itau',
					rateSell: 7820,
					recordedAt: new Date('2024-01-02T09:00:00Z'),
					userId: user.id,
				},
			})

			const result = await repository.findLatestBySource(user.id, 'itau')

			expect(result).not.toBeNull()
			expect(result?.rateSell).toBe(7850)
		})

		it('returns null when no records exist for source', async () => {
			const user = await createTestUser(prismaTest)
			const result = await repository.findLatestBySource(user.id, 'ueno')
			expect(result).toBeNull()
		})
	})

	describe('create', () => {
		it('creates a record for a bank with buy and sell rates', async () => {
			const user = await createTestUser(prismaTest)
			const result = await repository.create(user.id, {
				source: 'itau',
				rateBuy: 7700,
				rateSell: 7800,
			})

			expect(result.id).toBeDefined()
			expect(result.source).toBe('itau')
			expect(result.rateBuy).toBe(7700)
			expect(result.rateSell).toBe(7800)
			expect(result.rateMid).toBeNull()
			expect(result.notes).toBeNull()
			expect(result.recordedAt).toBeInstanceOf(Date)
		})

		it('creates a BCP record with only rateMid', async () => {
			const user = await createTestUser(prismaTest)
			const result = await repository.create(user.id, {
				source: 'bcp',
				rateMid: 7810,
			})

			expect(result.source).toBe('bcp')
			expect(result.rateMid).toBe(7810)
			expect(result.rateBuy).toBeNull()
			expect(result.rateSell).toBeNull()
		})

		it('creates a record with optional notes and custom recordedAt', async () => {
			const user = await createTestUser(prismaTest)
			const recordedAt = new Date('2024-06-15T10:00:00Z')

			const result = await repository.create(user.id, {
				source: 'ueno',
				rateSell: 7830,
				notes: 'Tasa del mediodía',
				recordedAt,
			})

			expect(result.notes).toBe('Tasa del mediodía')
			expect(result.recordedAt).toEqual(recordedAt)
		})
	})

	describe('update', () => {
		it('rejects updating a record that belongs to another user', async () => {
			const user = await createTestUser(prismaTest)
			const otherUser = await createTestUser(prismaTest)
			const created = await prismaTest.exchangeRate.create({
				data: { source: 'itau', rateBuy: 7700, userId: otherUser.id },
			})

			await expect(
				repository.update(user.id, created.id, { rateBuy: 7750 }),
			).rejects.toThrow()
		})
	})

	describe('delete', () => {
		it('rejects deleting a record that belongs to another user', async () => {
			const user = await createTestUser(prismaTest)
			const otherUser = await createTestUser(prismaTest)
			const created = await prismaTest.exchangeRate.create({
				data: { source: 'itau', rateBuy: 7700, userId: otherUser.id },
			})

			await expect(repository.delete(user.id, created.id)).rejects.toThrow()
		})
	})
})
