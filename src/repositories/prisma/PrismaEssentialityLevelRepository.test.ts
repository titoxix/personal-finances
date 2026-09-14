// @vitest-environment node
import { afterAll, beforeEach, describe, expect, it } from 'vitest'
import { createTestUser } from '@/test/factories'
import { prismaTest } from '@/test/prisma'
import { createPrismaEssentialityLevelRepository } from './PrismaEssentialityLevelRepository'

const repository = createPrismaEssentialityLevelRepository(prismaTest)

beforeEach(async () => {
	await prismaTest.essentialityLevel.deleteMany()
	await prismaTest.user.deleteMany()
})

afterAll(async () => {
	await prismaTest.essentialityLevel.deleteMany()
	await prismaTest.user.deleteMany()
	await prismaTest.$disconnect()
})

describe('PrismaEssentialityLevelRepository', () => {
	describe('findAll', () => {
		it('returns empty array when no levels exist', async () => {
			const user = await createTestUser(prismaTest)
			const result = await repository.findAll(user.id)
			expect(result).toEqual([])
		})

		it('returns all levels ordered by sortOrder', async () => {
			const user = await createTestUser(prismaTest)
			await prismaTest.essentialityLevel.createMany({
				data: [
					{
						code: 'opcional',
						label: 'Opcional',
						sortOrder: 3,
						userId: user.id,
					},
					{
						code: 'esencial',
						label: 'Esencial',
						sortOrder: 1,
						userId: user.id,
					},
					{
						code: 'importante',
						label: 'Importante',
						sortOrder: 2,
						userId: user.id,
					},
				],
			})

			const result = await repository.findAll(user.id)

			expect(result).toHaveLength(3)
			expect(result[0]?.code).toBe('esencial')
			expect(result[1]?.code).toBe('importante')
			expect(result[2]?.code).toBe('opcional')
		})

		it('does not return levels belonging to another user', async () => {
			const user = await createTestUser(prismaTest)
			const otherUser = await createTestUser(prismaTest)
			await prismaTest.essentialityLevel.create({
				data: {
					code: 'esencial',
					label: 'Esencial',
					sortOrder: 1,
					userId: otherUser.id,
				},
			})

			const result = await repository.findAll(user.id)
			expect(result).toEqual([])
		})
	})

	describe('findById', () => {
		it('returns the level when it exists and belongs to the user', async () => {
			const user = await createTestUser(prismaTest)
			const created = await prismaTest.essentialityLevel.create({
				data: {
					code: 'esencial',
					label: 'Esencial',
					sortOrder: 1,
					userId: user.id,
				},
			})

			const result = await repository.findById(user.id, created.id)

			expect(result).not.toBeNull()
			expect(result?.code).toBe('esencial')
			expect(result?.sortOrder).toBe(1)
		})

		it('returns null when level does not exist', async () => {
			const user = await createTestUser(prismaTest)
			const result = await repository.findById(user.id, 999)
			expect(result).toBeNull()
		})

		it('returns null when level belongs to another user', async () => {
			const user = await createTestUser(prismaTest)
			const otherUser = await createTestUser(prismaTest)
			const created = await prismaTest.essentialityLevel.create({
				data: {
					code: 'esencial',
					label: 'Esencial',
					sortOrder: 1,
					userId: otherUser.id,
				},
			})

			const result = await repository.findById(user.id, created.id)
			expect(result).toBeNull()
		})
	})

	describe('findByCode', () => {
		it('returns the level when code matches for the user', async () => {
			const user = await createTestUser(prismaTest)
			await prismaTest.essentialityLevel.create({
				data: {
					code: 'inversion',
					label: 'Inversión',
					sortOrder: 4,
					userId: user.id,
				},
			})

			const result = await repository.findByCode(user.id, 'inversion')

			expect(result).not.toBeNull()
			expect(result?.label).toBe('Inversión')
		})

		it('returns null when code does not exist', async () => {
			const user = await createTestUser(prismaTest)
			const result = await repository.findByCode(user.id, 'inexistente')
			expect(result).toBeNull()
		})

		it('returns null when the code belongs to another user', async () => {
			const user = await createTestUser(prismaTest)
			const otherUser = await createTestUser(prismaTest)
			await prismaTest.essentialityLevel.create({
				data: {
					code: 'inversion',
					label: 'Inversión',
					sortOrder: 4,
					userId: otherUser.id,
				},
			})

			const result = await repository.findByCode(user.id, 'inversion')
			expect(result).toBeNull()
		})
	})

	describe('create', () => {
		it('creates a level with required fields', async () => {
			const user = await createTestUser(prismaTest)
			const result = await repository.create(user.id, {
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
			const user = await createTestUser(prismaTest)
			const result = await repository.create(user.id, {
				code: 'esencial',
				label: 'Esencial',
				sortOrder: 1,
				description: 'Gastos que no se pueden eliminar',
			})

			expect(result.description).toBe('Gastos que no se pueden eliminar')
		})

		it('allows the same code for two different users', async () => {
			const user = await createTestUser(prismaTest)
			const otherUser = await createTestUser(prismaTest)
			await repository.create(user.id, {
				code: 'esencial',
				label: 'Esencial',
				sortOrder: 1,
			})

			const result = await repository.create(otherUser.id, {
				code: 'esencial',
				label: 'Esencial',
				sortOrder: 1,
			})

			expect(result.code).toBe('esencial')
		})
	})

	describe('update', () => {
		it('updates label, description, and sortOrder', async () => {
			const user = await createTestUser(prismaTest)
			const created = await prismaTest.essentialityLevel.create({
				data: {
					code: 'opcional',
					label: 'Opcional',
					sortOrder: 3,
					userId: user.id,
				},
			})

			const result = await repository.update(user.id, created.id, {
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
			const user = await createTestUser(prismaTest)
			const created = await prismaTest.essentialityLevel.create({
				data: {
					code: 'opcional',
					label: 'Opcional',
					sortOrder: 3,
					description: 'desc original',
					userId: user.id,
				},
			})

			const result = await repository.update(user.id, created.id, {
				label: 'Nuevo label',
			})

			expect(result.label).toBe('Nuevo label')
			expect(result.description).toBe('desc original')
			expect(result.sortOrder).toBe(3)
		})

		it('rejects updating a level that belongs to another user', async () => {
			const user = await createTestUser(prismaTest)
			const otherUser = await createTestUser(prismaTest)
			const created = await prismaTest.essentialityLevel.create({
				data: {
					code: 'opcional',
					label: 'Opcional',
					sortOrder: 3,
					userId: otherUser.id,
				},
			})

			await expect(
				repository.update(user.id, created.id, { label: 'Hackeado' }),
			).rejects.toThrow()
		})
	})

	describe('deactivate', () => {
		it('sets active to false without deleting the record', async () => {
			const user = await createTestUser(prismaTest)
			const created = await prismaTest.essentialityLevel.create({
				data: {
					code: 'opcional',
					label: 'Opcional',
					sortOrder: 3,
					userId: user.id,
				},
			})

			const result = await repository.deactivate(user.id, created.id)

			expect(result.active).toBe(false)
			expect(result.id).toBe(created.id)

			const stillExists = await prismaTest.essentialityLevel.findUnique({
				where: { id: created.id },
			})
			expect(stillExists).not.toBeNull()
		})

		it('rejects deactivating a level that belongs to another user', async () => {
			const user = await createTestUser(prismaTest)
			const otherUser = await createTestUser(prismaTest)
			const created = await prismaTest.essentialityLevel.create({
				data: {
					code: 'opcional',
					label: 'Opcional',
					sortOrder: 3,
					userId: otherUser.id,
				},
			})

			await expect(repository.deactivate(user.id, created.id)).rejects.toThrow()
		})
	})
})
