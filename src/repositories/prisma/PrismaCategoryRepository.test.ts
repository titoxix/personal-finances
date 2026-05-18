// @vitest-environment node
import { afterAll, beforeEach, describe, expect, it } from 'vitest'
import { prismaTest } from '@/test/prisma'
import { PrismaCategoryRepository } from './PrismaCategoryRepository'

const repository = new PrismaCategoryRepository(prismaTest)

beforeEach(async () => {
	await prismaTest.category.deleteMany()
})

afterAll(async () => {
	await prismaTest.category.deleteMany()
	await prismaTest.$disconnect()
})

describe('PrismaCategoryRepository', () => {
	describe('findAll', () => {
		it('returns empty array when no categories exist', async () => {
			const result = await repository.findAll()
			expect(result).toEqual([])
		})

		it('returns all active and inactive categories', async () => {
			await prismaTest.category.createMany({
				data: [
					{ code: 'alimentacion', label: 'Alimentación' },
					{ code: 'vivienda', label: 'Vivienda' },
				],
			})

			const result = await repository.findAll()
			expect(result).toHaveLength(2)
		})
	})

	describe('findById', () => {
		it('returns the category when it exists', async () => {
			const created = await prismaTest.category.create({
				data: { code: 'ocio', label: 'Ocio' },
			})

			const result = await repository.findById(created.id)

			expect(result).not.toBeNull()
			expect(result?.code).toBe('ocio')
			expect(result?.label).toBe('Ocio')
		})

		it('returns null when category does not exist', async () => {
			const result = await repository.findById(999)
			expect(result).toBeNull()
		})
	})

	describe('findByCode', () => {
		it('returns the category when code matches', async () => {
			await prismaTest.category.create({
				data: { code: 'transporte', label: 'Transporte' },
			})

			const result = await repository.findByCode('transporte')

			expect(result).not.toBeNull()
			expect(result?.label).toBe('Transporte')
		})

		it('returns null when code does not exist', async () => {
			const result = await repository.findByCode('inexistente')
			expect(result).toBeNull()
		})
	})

	describe('create', () => {
		it('creates a category with required fields', async () => {
			const result = await repository.create({
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
			const result = await repository.create({
				code: 'salud',
				label: 'Salud',
				description: 'Seguros médicos, consultas, gym',
			})

			expect(result.description).toBe('Seguros médicos, consultas, gym')
		})
	})

	describe('update', () => {
		it('updates label and description', async () => {
			const created = await prismaTest.category.create({
				data: { code: 'ocio', label: 'Ocio' },
			})

			const result = await repository.update(created.id, {
				label: 'Ocio y entretenimiento',
				description: 'Restaurantes, cine, bares',
			})

			expect(result.label).toBe('Ocio y entretenimiento')
			expect(result.description).toBe('Restaurantes, cine, bares')
			expect(result.code).toBe('ocio')
		})

		it('updates only the provided fields', async () => {
			const created = await prismaTest.category.create({
				data: { code: 'ocio', label: 'Ocio', description: 'desc original' },
			})

			const result = await repository.update(created.id, { label: 'Nuevo label' })

			expect(result.label).toBe('Nuevo label')
			expect(result.description).toBe('desc original')
		})
	})

	describe('deactivate', () => {
		it('sets active to false without deleting the record', async () => {
			const created = await prismaTest.category.create({
				data: { code: 'ocio', label: 'Ocio' },
			})

			const result = await repository.deactivate(created.id)

			expect(result.active).toBe(false)
			expect(result.id).toBe(created.id)

			const stillExists = await prismaTest.category.findUnique({
				where: { id: created.id },
			})
			expect(stillExists).not.toBeNull()
		})
	})
})
