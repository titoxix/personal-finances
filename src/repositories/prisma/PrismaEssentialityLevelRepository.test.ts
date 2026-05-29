// @vitest-environment node
import { afterAll, beforeEach, describe, expect, it } from 'vitest'
import { prismaTest } from '@/test/prisma'
import { createPrismaEssentialityLevelRepository } from './PrismaEssentialityLevelRepository'

const repository = createPrismaEssentialityLevelRepository(prismaTest)

beforeEach(async () => {
	await prismaTest.essentialityLevel.deleteMany()
})

afterAll(async () => {
	await prismaTest.essentialityLevel.deleteMany()
	await prismaTest.$disconnect()
})

describe('PrismaEssentialityLevelRepository', () => {
	describe('findAll', () => {
		it('returns empty array when no levels exist', async () => {
			const result = await repository.findAll()
			expect(result).toEqual([])
		})

		it('returns all levels ordered by sortOrder', async () => {
			await prismaTest.essentialityLevel.createMany({
				data: [
					{ code: 'opcional', label: 'Opcional', sortOrder: 3 },
					{ code: 'esencial', label: 'Esencial', sortOrder: 1 },
					{ code: 'importante', label: 'Importante', sortOrder: 2 },
				],
			})

			const result = await repository.findAll()

			expect(result).toHaveLength(3)
			expect(result[0]?.code).toBe('esencial')
			expect(result[1]?.code).toBe('importante')
			expect(result[2]?.code).toBe('opcional')
		})
	})

	describe('findById', () => {
		it('returns the level when it exists', async () => {
			const created = await prismaTest.essentialityLevel.create({
				data: { code: 'esencial', label: 'Esencial', sortOrder: 1 },
			})

			const result = await repository.findById(created.id)

			expect(result).not.toBeNull()
			expect(result?.code).toBe('esencial')
			expect(result?.sortOrder).toBe(1)
		})

		it('returns null when level does not exist', async () => {
			const result = await repository.findById(999)
			expect(result).toBeNull()
		})
	})

	describe('findByCode', () => {
		it('returns the level when code matches', async () => {
			await prismaTest.essentialityLevel.create({
				data: { code: 'inversion', label: 'Inversión', sortOrder: 4 },
			})

			const result = await repository.findByCode('inversion')

			expect(result).not.toBeNull()
			expect(result?.label).toBe('Inversión')
		})

		it('returns null when code does not exist', async () => {
			const result = await repository.findByCode('inexistente')
			expect(result).toBeNull()
		})
	})

	describe('create', () => {
		it('creates a level with required fields', async () => {
			const result = await repository.create({
				code: 'esencial',
				label: 'Esencial',
				sortOrder: 1,
			})

			expect(result.id).toBeDefined()
			expect(result.code).toBe('esencial')
			expect(result.label).toBe('Esencial')
			expect(result.sortOrder).toBe(1)
			expect(result.description).toBeNull()
			expect(result.active).toBe(true)
		})

		it('creates a level with optional description', async () => {
			const result = await repository.create({
				code: 'esencial',
				label: 'Esencial',
				sortOrder: 1,
				description: 'Gastos que no se pueden eliminar',
			})

			expect(result.description).toBe('Gastos que no se pueden eliminar')
		})
	})

	describe('update', () => {
		it('updates label, description, and sortOrder', async () => {
			const created = await prismaTest.essentialityLevel.create({
				data: { code: 'opcional', label: 'Opcional', sortOrder: 3 },
			})

			const result = await repository.update(created.id, {
				label: 'Opcional / Lujo',
				description: 'Gastos prescindibles',
				sortOrder: 4,
			})

			expect(result.label).toBe('Opcional / Lujo')
			expect(result.description).toBe('Gastos prescindibles')
			expect(result.sortOrder).toBe(4)
			expect(result.code).toBe('opcional')
		})

		it('updates only the provided fields', async () => {
			const created = await prismaTest.essentialityLevel.create({
				data: {
					code: 'opcional',
					label: 'Opcional',
					sortOrder: 3,
					description: 'desc original',
				},
			})

			const result = await repository.update(created.id, {
				label: 'Nuevo label',
			})

			expect(result.label).toBe('Nuevo label')
			expect(result.description).toBe('desc original')
			expect(result.sortOrder).toBe(3)
		})
	})

	describe('deactivate', () => {
		it('sets active to false without deleting the record', async () => {
			const created = await prismaTest.essentialityLevel.create({
				data: { code: 'opcional', label: 'Opcional', sortOrder: 3 },
			})

			const result = await repository.deactivate(created.id)

			expect(result.active).toBe(false)
			expect(result.id).toBe(created.id)

			const stillExists = await prismaTest.essentialityLevel.findUnique({
				where: { id: created.id },
			})
			expect(stillExists).not.toBeNull()
		})
	})
})
