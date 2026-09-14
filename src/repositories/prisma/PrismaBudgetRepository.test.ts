// @vitest-environment node
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { prismaTest } from '@/test/prisma'
import { createPrismaBudgetRepository } from './PrismaBudgetRepository'

const repository = createPrismaBudgetRepository(prismaTest)

let categoryId: number
let category2Id: number
let essentialityId: number

const MAY_2026 = new Date('2026-05-01')
const APR_2026 = new Date('2026-04-01')

beforeAll(async () => {
	const cat1 = await prismaTest.category.create({
		data: { code: 'alimentacion', label: 'Alimentación' },
	})
	const cat2 = await prismaTest.category.create({
		data: { code: 'vivienda', label: 'Vivienda' },
	})
	const essentiality = await prismaTest.essentialityLevel.create({
		data: { code: 'esencial', label: 'Esencial', sortOrder: 1 },
	})
	categoryId = cat1.id
	category2Id = cat2.id
	essentialityId = essentiality.id
})

beforeEach(async () => {
	await prismaTest.budget.deleteMany()
})

afterAll(async () => {
	await prismaTest.budget.deleteMany()
	await prismaTest.category.deleteMany()
	await prismaTest.essentialityLevel.deleteMany()
	await prismaTest.$disconnect()
})

const baseBudget = () => ({
	month: MAY_2026,
	categoryId,
	essentialityId,
})

describe('PrismaBudgetRepository', () => {
	describe('findAll', () => {
		it('returns empty array when no budgets exist', async () => {
			const result = await repository.findAll()
			expect(result).toEqual([])
		})

		it('returns all budgets', async () => {
			await prismaTest.budget.createMany({
				data: [
					{ month: MAY_2026, categoryId, essentialityId },
					{ month: MAY_2026, categoryId: category2Id, essentialityId },
				],
			})

			const result = await repository.findAll()
			expect(result).toHaveLength(2)
		})

		it('returns numeric values for Decimal fields', async () => {
			await prismaTest.budget.create({
				data: { ...baseBudget(), budgetedUsd: 500, budgetedGs: 3900000 },
			})

			const result = await repository.findAll()

			expect(typeof result[0]?.budgetedUsd).toBe('number')
			expect(typeof result[0]?.budgetedGs).toBe('number')
			expect(result[0]?.budgetedUsd).toBe(500)
			expect(result[0]?.budgetedGs).toBe(3900000)
		})

		it('maps nullable margins without changing legacy totals or essentiality', async () => {
			await prismaTest.budget.createMany({
				data: [
					{
						...baseBudget(),
						budgetedUsd: 500,
						budgetedGs: 3900000,
					},
					{
						month: MAY_2026,
						categoryId: category2Id,
						essentialityId: null,
						marginUsd: 25.5,
						marginGs: 200000,
					},
				],
			})

			const result = await repository.findAll()
			const legacy = result.find((budget) => budget.categoryId === categoryId)
			const margin = result.find((budget) => budget.categoryId === category2Id)

			expect(legacy).toMatchObject({
				budgetedUsd: 500,
				budgetedGs: 3900000,
				marginUsd: null,
				marginGs: null,
				essentialityId,
			})
			expect(margin).toMatchObject({
				budgetedUsd: null,
				budgetedGs: null,
				marginUsd: 25.5,
				marginGs: 200000,
				essentialityId: null,
			})
		})
	})

	describe('findById', () => {
		it('returns the budget when it exists', async () => {
			const created = await prismaTest.budget.create({
				data: { ...baseBudget(), budgetedUsd: 500, budgetedGs: 3900000 },
			})

			const result = await repository.findById(created.id)

			expect(result).not.toBeNull()
			expect(result?.month).toEqual(MAY_2026)
			expect(result?.categoryId).toBe(categoryId)
			expect(result?.budgetedUsd).toBe(500)
			expect(result?.budgetedGs).toBe(3900000)
			expect(result?.notes).toBeNull()
		})

		it('returns null when budget does not exist', async () => {
			const result = await repository.findById(999)
			expect(result).toBeNull()
		})
	})

	describe('findByMonth', () => {
		it('returns all budgets for the given month', async () => {
			await prismaTest.budget.createMany({
				data: [
					{ month: MAY_2026, categoryId, essentialityId },
					{ month: MAY_2026, categoryId: category2Id, essentialityId },
					{ month: APR_2026, categoryId, essentialityId },
				],
			})

			const result = await repository.findByMonth(MAY_2026)

			expect(result).toHaveLength(2)
			expect(
				result.every((b) => b.month.getTime() === MAY_2026.getTime()),
			).toBe(true)
		})

		it('returns empty array when no budgets exist for that month', async () => {
			const result = await repository.findByMonth(MAY_2026)
			expect(result).toEqual([])
		})
	})

	describe('findByMonthAndCategory', () => {
		it('returns the budget for the given month and category', async () => {
			await prismaTest.budget.createMany({
				data: [
					{ month: MAY_2026, categoryId, essentialityId, budgetedUsd: 500 },
					{
						month: MAY_2026,
						categoryId: category2Id,
						essentialityId,
						budgetedUsd: 1200,
					},
				],
			})

			const result = await repository.findByMonthAndCategory(
				MAY_2026,
				categoryId,
			)

			expect(result).not.toBeNull()
			expect(result?.categoryId).toBe(categoryId)
			expect(result?.budgetedUsd).toBe(500)
		})

		it('returns null when no match exists', async () => {
			const result = await repository.findByMonthAndCategory(
				MAY_2026,
				categoryId,
			)
			expect(result).toBeNull()
		})
	})

	describe('create', () => {
		it('creates a budget with required fields and null amounts', async () => {
			const result = await repository.create(baseBudget())

			expect(result.id).toBeDefined()
			expect(result.month).toEqual(MAY_2026)
			expect(result.categoryId).toBe(categoryId)
			expect(result.essentialityId).toBeNull()
			expect(result.budgetedUsd).toBeNull()
			expect(result.budgetedGs).toBeNull()
			expect(result.notes).toBeNull()
			expect(result.createdAt).toBeInstanceOf(Date)
		})

		it('creates a budget with amounts and notes', async () => {
			const result = await repository.create({
				...baseBudget(),
				budgetedUsd: 500,
				budgetedGs: 3900000,
				notes: 'Incluye delivery',
			})

			expect(result.budgetedUsd).toBe(500)
			expect(result.budgetedGs).toBe(3900000)
			expect(result.notes).toBe('Incluye delivery')
		})

		it('creates a budget with null essentiality and a zero USD margin', async () => {
			const result = await repository.create({
				month: MAY_2026,
				categoryId,
				essentialityId,
				currency: 'USD',
				margin: 0,
			})

			expect(result).toMatchObject({
				essentialityId: null,
				marginUsd: 0,
				marginGs: null,
				budgetedUsd: null,
				budgetedGs: null,
			})
		})

		it('creates a budget with a non-negative GS margin', async () => {
			const result = await repository.create({
				month: MAY_2026,
				categoryId,
				essentialityId: null,
				currency: 'GS',
				margin: 250000,
			})

			expect(result.marginUsd).toBeNull()
			expect(result.marginGs).toBe(250000)
		})
	})

	describe('update', () => {
		it('updates the provided fields', async () => {
			const created = await prismaTest.budget.create({
				data: { ...baseBudget(), budgetedUsd: 500 },
			})

			const result = await repository.update(created.id, {
				budgetedUsd: 600,
				notes: 'Ajuste por inflación',
			})

			expect(result.budgetedUsd).toBe(600)
			expect(result.notes).toBe('Ajuste por inflación')
			expect(result.categoryId).toBe(categoryId)
		})

		it('can set nullable fields to null', async () => {
			const created = await prismaTest.budget.create({
				data: { ...baseBudget(), budgetedUsd: 500, notes: 'nota' },
			})

			const result = await repository.update(created.id, {
				budgetedUsd: null,
				notes: null,
			})

			expect(result.budgetedUsd).toBeNull()
			expect(result.notes).toBeNull()
		})

		it('preserves stored legacy essentiality when an update supplies another value', async () => {
			const replacement = await prismaTest.essentialityLevel.create({
				data: { code: 'deseable', label: 'Deseable', sortOrder: 2 },
			})
			const created = await prismaTest.budget.create({
				data: { ...baseBudget(), budgetedUsd: 500, marginGs: 100000 },
			})

			const result = await repository.update(created.id, {
				essentialityId: replacement.id,
				currency: 'USD',
				margin: 0,
			})

			expect(result.essentialityId).toBe(essentialityId)
			expect(result.budgetedUsd).toBe(500)
			expect(result.marginUsd).toBe(0)
			expect(result.marginGs).toBeNull()
		})

		it('preserves a stored null essentiality when an update supplies a value', async () => {
			const created = await prismaTest.budget.create({
				data: { ...baseBudget(), essentialityId: null },
			})

			const result = await repository.update(created.id, {
				essentialityId,
			})

			expect(result.essentialityId).toBeNull()
		})
	})

	describe('existsForMonthAndCategory', () => {
		it('returns true when the matching budget is soft-deleted', async () => {
			await prismaTest.budget.create({
				data: { ...baseBudget(), deletedAt: new Date() },
			})

			await expect(
				repository.existsForMonthAndCategory(MAY_2026, categoryId),
			).resolves.toBe(true)
			await expect(
				repository.existsForMonthAndCategory(APR_2026, categoryId),
			).resolves.toBe(false)
		})

		it('keeps category and month unique after soft deletion', async () => {
			await prismaTest.budget.create({
				data: { ...baseBudget(), deletedAt: new Date() },
			})

			await expect(repository.create(baseBudget())).rejects.toThrow()
		})
	})
})
