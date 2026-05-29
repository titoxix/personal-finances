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

const { GET, PATCH, DELETE } = await import('./route')

const req = new NextRequest('http://localhost/api/categories/1')

const category = {
	id: 1,
	code: 'FOOD',
	label: 'Food',
	description: null,
	active: true,
	createdAt: new Date(),
}

describe('GET /api/categories/[id]', () => {
	beforeEach(() => vi.clearAllMocks())

	it('returns category with 200', async () => {
		mockService.findById.mockResolvedValue(category)

		const response = await GET(req, { params: Promise.resolve({ id: '1' }) })

		expect(response.status).toBe(200)
		const data = await response.json()
		expect(data.id).toBe(1)
	})

	it('returns 404 when category not found', async () => {
		mockService.findById.mockRejectedValue(new Error('Category not found'))

		const response = await GET(req, { params: Promise.resolve({ id: '99' }) })

		expect(response.status).toBe(404)
	})
})

describe('PATCH /api/categories/[id]', () => {
	beforeEach(() => vi.clearAllMocks())

	it('updates a category and returns 200', async () => {
		const updated = { ...category, label: 'Updated Food' }
		mockService.update.mockResolvedValue(updated)

		const request = new NextRequest('http://localhost/api/categories/1', {
			method: 'PATCH',
			body: JSON.stringify({ label: 'Updated Food' }),
			headers: { 'Content-Type': 'application/json' },
		})

		const response = await PATCH(request, {
			params: Promise.resolve({ id: '1' }),
		})

		expect(response.status).toBe(200)
		const data = await response.json()
		expect(data.label).toBe('Updated Food')
	})

	it('returns 400 for empty label', async () => {
		const request = new NextRequest('http://localhost/api/categories/1', {
			method: 'PATCH',
			body: JSON.stringify({ label: '' }),
			headers: { 'Content-Type': 'application/json' },
		})

		const response = await PATCH(request, {
			params: Promise.resolve({ id: '1' }),
		})

		expect(response.status).toBe(400)
	})

	it('returns 404 when category not found', async () => {
		mockService.update.mockRejectedValue(new Error('Category not found'))

		const request = new NextRequest('http://localhost/api/categories/1', {
			method: 'PATCH',
			body: JSON.stringify({ label: 'New Label' }),
			headers: { 'Content-Type': 'application/json' },
		})

		const response = await PATCH(request, {
			params: Promise.resolve({ id: '99' }),
		})

		expect(response.status).toBe(404)
	})
})

describe('DELETE /api/categories/[id]', () => {
	beforeEach(() => vi.clearAllMocks())

	it('deactivates a category and returns 200', async () => {
		const deactivated = { ...category, active: false }
		mockService.deactivate.mockResolvedValue(deactivated)

		const response = await DELETE(req, { params: Promise.resolve({ id: '1' }) })

		expect(response.status).toBe(200)
		const data = await response.json()
		expect(data.active).toBe(false)
	})

	it('returns 404 when category not found', async () => {
		mockService.deactivate.mockRejectedValue(new Error('Category not found'))

		const response = await DELETE(req, {
			params: Promise.resolve({ id: '99' }),
		})

		expect(response.status).toBe(404)
	})
})
