// @vitest-environment node
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { prismaTest } from '@/test/prisma'
import { PrismaRecurringItemRepository } from './PrismaRecurringItemRepository'

const repository = new PrismaRecurringItemRepository(prismaTest)

let categoryId: number
let essentialityId: number

beforeAll(async () => {
	const category = await prismaTest.category.create({
		data: { code: 'digital', label: 'Digital' },
	})
	const essentiality = await prismaTest.essentialityLevel.create({
		data: { code: 'esencial', label: 'Esencial', sortOrder: 1 },
	})
	categoryId = category.id
	essentialityId = essentiality.id
})

beforeEach(async () => {
	await prismaTest.recurringItem.deleteMany()
})

afterAll(async () => {
	await prismaTest.recurringItem.deleteMany()
	await prismaTest.category.deleteMany()
	await prismaTest.essentialityLevel.deleteMany()
	await prismaTest.$disconnect()
})

const baseItem = () => ({
	description: 'Netflix',
	categoryId,
	essentialityId,
	paymentMethod: 'ueno_mastercard' as const,
	frequency: 'monthly' as const,
})

describe('PrismaRecurringItemRepository', () => {
	describe('findAll', () => {
		it('returns empty array when no items exist', async () => {
			const result = await repository.findAll()
			expect(result).toEqual([])
		})

		it('returns both active and inactive items', async () => {
			await prismaTest.recurringItem.createMany({
				data: [
					{ ...baseItem(), active: true },
					{ ...baseItem(), description: 'Spotify', active: false },
				],
			})

			const result = await repository.findAll()
			expect(result).toHaveLength(2)
		})

		it('returns numeric values for Decimal fields', async () => {
			await prismaTest.recurringItem.create({
				data: { ...baseItem(), amountGs: 95000, amountUsd: 12.99 },
			})

			const result = await repository.findAll()

			expect(typeof result[0]?.amountGs).toBe('number')
			expect(typeof result[0]?.amountUsd).toBe('number')
			expect(result[0]?.amountGs).toBe(95000)
			expect(result[0]?.amountUsd).toBe(12.99)
		})
	})

	describe('findById', () => {
		it('returns the item when it exists', async () => {
			const created = await prismaTest.recurringItem.create({
				data: { ...baseItem(), amountGs: 95000, billingDay: 5 },
			})

			const result = await repository.findById(created.id)

			expect(result).not.toBeNull()
			expect(result?.description).toBe('Netflix')
			expect(result?.amountGs).toBe(95000)
			expect(result?.billingDay).toBe(5)
			expect(result?.paymentMethod).toBe('ueno_mastercard')
			expect(result?.frequency).toBe('monthly')
			expect(result?.isVariable).toBe(false)
			expect(result?.active).toBe(true)
		})

		it('returns null when item does not exist', async () => {
			const result = await repository.findById(999)
			expect(result).toBeNull()
		})
	})

	describe('findActive', () => {
		it('returns only active items', async () => {
			await prismaTest.recurringItem.createMany({
				data: [
					{ ...baseItem(), description: 'Netflix', active: true },
					{ ...baseItem(), description: 'Spotify', active: true },
					{ ...baseItem(), description: 'HBO', active: false },
				],
			})

			const result = await repository.findActive()

			expect(result).toHaveLength(2)
			expect(result.every((i) => i.active)).toBe(true)
		})

		it('returns empty array when no active items exist', async () => {
			await prismaTest.recurringItem.create({
				data: { ...baseItem(), active: false },
			})

			const result = await repository.findActive()
			expect(result).toEqual([])
		})
	})

	describe('create', () => {
		it('creates an item with required fields', async () => {
			const result = await repository.create(baseItem())

			expect(result.id).toBeDefined()
			expect(result.description).toBe('Netflix')
			expect(result.categoryId).toBe(categoryId)
			expect(result.essentialityId).toBe(essentialityId)
			expect(result.paymentMethod).toBe('ueno_mastercard')
			expect(result.frequency).toBe('monthly')
			expect(result.amountGs).toBeNull()
			expect(result.amountUsd).toBeNull()
			expect(result.billingDay).toBeNull()
			expect(result.billingMonth).toBeNull()
			expect(result.isVariable).toBe(false)
			expect(result.active).toBe(true)
			expect(result.notes).toBeNull()
		})

		it('creates an annual item with billing month and amount', async () => {
			const result = await repository.create({
				...baseItem(),
				description: 'IRP',
				frequency: 'annual',
				billingMonth: 3,
				amountGs: 2500000,
				isVariable: true,
				notes: 'Impuesto a la renta personal',
			})

			expect(result.frequency).toBe('annual')
			expect(result.billingMonth).toBe(3)
			expect(result.amountGs).toBe(2500000)
			expect(result.isVariable).toBe(true)
			expect(result.notes).toBe('Impuesto a la renta personal')
		})
	})

	describe('update', () => {
		it('updates the provided fields', async () => {
			const created = await prismaTest.recurringItem.create({
				data: { ...baseItem(), amountGs: 90000 },
			})

			const result = await repository.update(created.id, {
				amountGs: 95000,
				notes: 'Nuevo plan',
			})

			expect(result.amountGs).toBe(95000)
			expect(result.notes).toBe('Nuevo plan')
			expect(result.description).toBe('Netflix')
		})

		it('can set nullable fields to null', async () => {
			const created = await prismaTest.recurringItem.create({
				data: { ...baseItem(), amountGs: 90000, notes: 'nota' },
			})

			const result = await repository.update(created.id, {
				amountGs: null,
				notes: null,
			})

			expect(result.amountGs).toBeNull()
			expect(result.notes).toBeNull()
		})
	})

	describe('deactivate', () => {
		it('sets active to false without deleting the record', async () => {
			const created = await prismaTest.recurringItem.create({
				data: { ...baseItem() },
			})

			const result = await repository.deactivate(created.id)

			expect(result.active).toBe(false)
			expect(result.id).toBe(created.id)

			const stillExists = await prismaTest.recurringItem.findUnique({
				where: { id: created.id },
			})
			expect(stillExists).not.toBeNull()
		})
	})
})
