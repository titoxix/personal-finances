// @vitest-environment node

import { NextRequest } from 'next/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/prisma', () => ({ prisma: {} }))
vi.mock('@/repositories/prisma/PrismaCategoryRepository', () => ({
	createPrismaCategoryRepository: vi.fn(() => ({})),
}))

const mockService = {
	findAll: vi.fn(),
	findById: vi.fn(),
	findByCode: vi.fn(),
	create: vi.fn(),
	update: vi.fn(),
	deactivate: vi.fn(),
}

vi.mock('@/services/CategoryService', () => ({
	createCategoryService: vi.fn(() => mockService),
}))

const { GET, POST } = await import('./route')

const category = {
	id: 1,
	code: 'FOOD',
	label: 'Food',
	description: null,
	active: true,
	createdAt: new Date(),
}

describe('GET /api/categories', () => {
	beforeEach(() => vi.clearAllMocks())

	it('returns all categories with 200', async () => {
		mockService.findAll.mockResolvedValue([category])

		const response = await GET()

		expect(response.status).toBe(200)
		const data = await response.json()
		expect(data).toHaveLength(1)
		expect(data[0].code).toBe('FOOD')
	})

	it('returns empty array when no categories', async () => {
		mockService.findAll.mockResolvedValue([])

		const response = await GET()

		expect(response.status).toBe(200)
		const data = await response.json()
		expect(data).toEqual([])
	})
})

describe('POST /api/categories', () => {
	beforeEach(() => vi.clearAllMocks())

	it('creates a category and returns 201', async () => {
		mockService.create.mockResolvedValue(category)

		const request = new NextRequest('http://localhost/api/categories', {
			method: 'POST',
			body: JSON.stringify({ code: 'FOOD', label: 'Food' }),
			headers: { 'Content-Type': 'application/json' },
		})

		const response = await POST(request)

		expect(response.status).toBe(201)
		const data = await response.json()
		expect(data.code).toBe('FOOD')
	})

	it('returns 400 for missing required fields', async () => {
		const request = new NextRequest('http://localhost/api/categories', {
			method: 'POST',
			body: JSON.stringify({ label: 'Food' }),
			headers: { 'Content-Type': 'application/json' },
		})

		const response = await POST(request)

		expect(response.status).toBe(400)
	})

	it('returns 400 for empty code', async () => {
		const request = new NextRequest('http://localhost/api/categories', {
			method: 'POST',
			body: JSON.stringify({ code: '', label: 'Food' }),
			headers: { 'Content-Type': 'application/json' },
		})

		const response = await POST(request)

		expect(response.status).toBe(400)
	})

	it('returns 409 when code already exists', async () => {
		mockService.create.mockRejectedValue(
			new Error('Category code already exists'),
		)

		const request = new NextRequest('http://localhost/api/categories', {
			method: 'POST',
			body: JSON.stringify({ code: 'FOOD', label: 'Food' }),
			headers: { 'Content-Type': 'application/json' },
		})

		const response = await POST(request)

		expect(response.status).toBe(409)
	})
})
