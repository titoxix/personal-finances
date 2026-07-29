// @vitest-environment node
import { afterAll, beforeEach, describe, expect, it } from 'vitest'
import { createTestUser } from '@/test/factories'
import { prismaTest } from '@/test/prisma'
import { createPrismaCategoryRepository } from './PrismaCategoryRepository'

const repository = createPrismaCategoryRepository(prismaTest)

beforeEach(async () => {
	await prismaTest.category.deleteMany()
	await prismaTest.user.deleteMany()
})

afterAll(async () => {
	await prismaTest.category.deleteMany()
	await prismaTest.user.deleteMany()
	await prismaTest.$disconnect()
})

describe('PrismaCategoryRepository', () => {
	describe('findAll', () => {
		it('returns empty array when no categories exist', async () => {
			const user = await createTestUser(prismaTest)
			const result = await repository.findAll(user.id)
			expect(result).toEqual([])
		})

		it('returns all active and inactive categories for the user', async () => {
			const user = await createTestUser(prismaTest)
			await prismaTest.category.createMany({
				data: [
					{ code: 'alimentacion', label: 'Alimentación', userId: user.id },
					{ code: 'vivienda', label: 'Vivienda', userId: user.id },
				],
			})

			const result = await repository.findAll(user.id)
			expect(result).toHaveLength(2)
		})

		it('does not return categories belonging to another user', async () => {
			const user = await createTestUser(prismaTest)
			const otherUser = await createTestUser(prismaTest)
			await prismaTest.category.create({
				data: {
					code: 'alimentacion',
					label: 'Alimentación',
					userId: otherUser.id,
				},
			})

			const result = await repository.findAll(user.id)
			expect(result).toEqual([])
		})
	})

	describe('findById', () => {
		it('returns the category when it exists and belongs to the user', async () => {
			const user = await createTestUser(prismaTest)
			const created = await prismaTest.category.create({
				data: { code: 'ocio', label: 'Ocio', userId: user.id },
			})

			const result = await repository.findById(user.id, created.id)

			expect(result).not.toBeNull()
			expect(result?.code).toBe('ocio')
			expect(result?.label).toBe('Ocio')
		})

		it('returns null when category does not exist', async () => {
			const user = await createTestUser(prismaTest)
			const result = await repository.findById(user.id, 999)
			expect(result).toBeNull()
		})

		it('returns null when category belongs to another user', async () => {
			const user = await createTestUser(prismaTest)
			const otherUser = await createTestUser(prismaTest)
			const created = await prismaTest.category.create({
				data: { code: 'ocio', label: 'Ocio', userId: otherUser.id },
			})

			const result = await repository.findById(user.id, created.id)
			expect(result).toBeNull()
		})
	})

	describe('findByCode', () => {
		it('returns the category when code matches for the user', async () => {
			const user = await createTestUser(prismaTest)
			await prismaTest.category.create({
				data: { code: 'transporte', label: 'Transporte', userId: user.id },
			})

			const result = await repository.findByCode(user.id, 'transporte')

			expect(result).not.toBeNull()
			expect(result?.label).toBe('Transporte')
		})

		it('returns null when code does not exist', async () => {
			const user = await createTestUser(prismaTest)
			const result = await repository.findByCode(user.id, 'inexistente')
			expect(result).toBeNull()
		})

		it('returns null when the code belongs to another user', async () => {
			const user = await createTestUser(prismaTest)
			const otherUser = await createTestUser(prismaTest)
			await prismaTest.category.create({
				data: { code: 'transporte', label: 'Transporte', userId: otherUser.id },
			})

			const result = await repository.findByCode(user.id, 'transporte')
			expect(result).toBeNull()
		})
	})

	describe('create', () => {
		it('creates a category with required fields', async () => {
			const user = await createTestUser(prismaTest)
			const result = await repository.create(user.id, {
				code: 'salud',
				label: 'Salud',
			})

			expect(result.id).toBeDefined()
			expect(result.code).toBe('salud')
			expect(result.label).toBe('Salud')
			expect(result.description).toBeNull()
			expect(result.active).toBe(true)
		})

		it('creates a category with optional description', async () => {
			const user = await createTestUser(prismaTest)
			const result = await repository.create(user.id, {
				code: 'salud',
				label: 'Salud',
				description: 'Seguros médicos, consultas, gym',
			})

			expect(result.description).toBe('Seguros médicos, consultas, gym')
		})

		it('allows the same code for two different users', async () => {
			const user = await createTestUser(prismaTest)
			const otherUser = await createTestUser(prismaTest)
			await repository.create(user.id, { code: 'salud', label: 'Salud' })

			const result = await repository.create(otherUser.id, {
				code: 'salud',
				label: 'Salud',
			})

			expect(result.code).toBe('salud')
		})
	})

	describe('update', () => {
		it('updates label and description', async () => {
			const user = await createTestUser(prismaTest)
			const created = await prismaTest.category.create({
				data: { code: 'ocio', label: 'Ocio', userId: user.id },
			})

			const result = await repository.update(user.id, created.id, {
				label: 'Ocio y entretenimiento',
				description: 'Restaurantes, cine, bares',
			})

			expect(result.label).toBe('Ocio y entretenimiento')
			expect(result.description).toBe('Restaurantes, cine, bares')
			expect(result.code).toBe('ocio')
		})

		it('updates only the provided fields', async () => {
			const user = await createTestUser(prismaTest)
			const created = await prismaTest.category.create({
				data: {
					code: 'ocio',
					label: 'Ocio',
					description: 'desc original',
					userId: user.id,
				},
			})

			const result = await repository.update(user.id, created.id, {
				label: 'Nuevo label',
			})

			expect(result.label).toBe('Nuevo label')
			expect(result.description).toBe('desc original')
		})

		it('rejects updating a category that belongs to another user', async () => {
			const user = await createTestUser(prismaTest)
			const otherUser = await createTestUser(prismaTest)
			const created = await prismaTest.category.create({
				data: { code: 'ocio', label: 'Ocio', userId: otherUser.id },
			})

			await expect(
				repository.update(user.id, created.id, { label: 'Hackeado' }),
			).rejects.toThrow()
		})
	})

	describe('deactivate', () => {
		it('sets active to false without deleting the record', async () => {
			const user = await createTestUser(prismaTest)
			const created = await prismaTest.category.create({
				data: { code: 'ocio', label: 'Ocio', userId: user.id },
			})

			const result = await repository.deactivate(user.id, created.id)

			expect(result.active).toBe(false)
			expect(result.id).toBe(created.id)

			const stillExists = await prismaTest.category.findUnique({
				where: { id: created.id },
			})
			expect(stillExists).not.toBeNull()
		})

		it('rejects deactivating a category that belongs to another user', async () => {
			const user = await createTestUser(prismaTest)
			const otherUser = await createTestUser(prismaTest)
			const created = await prismaTest.category.create({
				data: { code: 'ocio', label: 'Ocio', userId: otherUser.id },
			})

			await expect(repository.deactivate(user.id, created.id)).rejects.toThrow()
		})
	})
})
