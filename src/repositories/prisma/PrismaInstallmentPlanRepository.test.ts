// @vitest-environment node
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { prismaTest } from '@/test/prisma'
import { PrismaInstallmentPlanRepository } from './PrismaInstallmentPlanRepository'

const repository = new PrismaInstallmentPlanRepository(prismaTest)

let categoryId: number
let essentialityId: number

beforeAll(async () => {
	const category = await prismaTest.category.create({
		data: { code: 'equipamiento', label: 'Equipamiento' },
	})
	const essentiality = await prismaTest.essentialityLevel.create({
		data: { code: 'importante', label: 'Importante', sortOrder: 2 },
	})
	categoryId = category.id
	essentialityId = essentiality.id
})

beforeEach(async () => {
	await prismaTest.installmentPlan.deleteMany()
})

afterAll(async () => {
	await prismaTest.installmentPlan.deleteMany()
	await prismaTest.category.deleteMany()
	await prismaTest.essentialityLevel.deleteMany()
	await prismaTest.$disconnect()
})

const baseplan = () => ({
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
			const result = await repository.findAll()
			expect(result).toEqual([])
		})

		it('returns both active and inactive plans', async () => {
			await prismaTest.installmentPlan.createMany({
				data: [
					{ ...baseplan(), active: true },
					{ ...baseplan(), description: 'Laptop', active: false },
				],
			})

			const result = await repository.findAll()
			expect(result).toHaveLength(2)
		})

		it('returns numeric values for Decimal fields', async () => {
			await prismaTest.installmentPlan.create({
				data: {
					...baseplan(),
					totalAmountGs: 3600000,
					installmentAmountGs: 300000,
				},
			})

			const result = await repository.findAll()

			expect(typeof result[0]?.totalAmountGs).toBe('number')
			expect(typeof result[0]?.installmentAmountGs).toBe('number')
			expect(result[0]?.totalAmountGs).toBe(3600000)
			expect(result[0]?.installmentAmountGs).toBe(300000)
		})
	})

	describe('findById', () => {
		it('returns the plan when it exists', async () => {
			const created = await prismaTest.installmentPlan.create({
				data: {
					...baseplan(),
					totalAmountGs: 3600000,
					installmentAmountGs: 300000,
					endDate: new Date('2026-12-01'),
				},
			})

			const result = await repository.findById(created.id)

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
			const result = await repository.findById(999)
			expect(result).toBeNull()
		})
	})

	describe('findActive', () => {
		it('returns only active plans', async () => {
			await prismaTest.installmentPlan.createMany({
				data: [
					{ ...baseplan(), description: 'Gym', active: true },
					{ ...baseplan(), description: 'Laptop', active: true },
					{ ...baseplan(), description: 'TV', active: false },
				],
			})

			const result = await repository.findActive()

			expect(result).toHaveLength(2)
			expect(result.every((p) => p.active)).toBe(true)
		})

		it('returns empty array when no active plans exist', async () => {
			await prismaTest.installmentPlan.create({
				data: { ...baseplan(), active: false },
			})

			const result = await repository.findActive()
			expect(result).toEqual([])
		})
	})

	describe('create', () => {
		it('creates a plan with required fields and defaults', async () => {
			const result = await repository.create(baseplan())

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
			const endDate = new Date('2026-12-01')

			const result = await repository.create({
				...baseplan(),
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
			const created = await prismaTest.installmentPlan.create({
				data: baseplan(),
			})

			const result = await repository.update(created.id, { installmentsPaid: 3 })

			expect(result.installmentsPaid).toBe(3)
			expect(result.description).toBe('Gym equipamiento')
		})

		it('updates only the provided fields', async () => {
			const created = await prismaTest.installmentPlan.create({
				data: { ...baseplan(), totalAmountGs: 3600000, notes: 'nota original' },
			})

			const result = await repository.update(created.id, { notes: 'nota actualizada' })

			expect(result.notes).toBe('nota actualizada')
			expect(result.totalAmountGs).toBe(3600000)
		})

		it('can set nullable fields to null', async () => {
			const created = await prismaTest.installmentPlan.create({
				data: { ...baseplan(), totalAmountGs: 3600000, notes: 'nota' },
			})

			const result = await repository.update(created.id, {
				totalAmountGs: null,
				notes: null,
			})

			expect(result.totalAmountGs).toBeNull()
			expect(result.notes).toBeNull()
		})
	})

	describe('deactivate', () => {
		it('sets active to false without deleting the record', async () => {
			const created = await prismaTest.installmentPlan.create({
				data: baseplan(),
			})

			const result = await repository.deactivate(created.id)

			expect(result.active).toBe(false)
			expect(result.id).toBe(created.id)

			const stillExists = await prismaTest.installmentPlan.findUnique({
				where: { id: created.id },
			})
			expect(stillExists).not.toBeNull()
		})
	})
})
