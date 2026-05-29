// @vitest-environment node

import { NextRequest } from 'next/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/prisma', () => ({ prisma: {} }))
vi.mock('@/repositories/prisma/PrismaRecurringItemRepository', () => ({
	createPrismaRecurringItemRepository: vi.fn(() => ({})),
}))

const mockService = {
	findAll: vi.fn(),
	findById: vi.fn(),
	findActive: vi.fn(),
	create: vi.fn(),
	update: vi.fn(),
	deactivate: vi.fn(),
}

vi.mock('@/services/RecurringItemService', () => ({
	createRecurringItemService: vi.fn(() => mockService),
}))

const { GET, POST } = await import('./route')

const item = {
	id: 1,
	description: 'Netflix',
	amountGs: null,
	amountUsd: 15,
	categoryId: 1,
	essentialityId: 1,
	paymentMethod: 'itau_visa',
	frequency: 'monthly',
	billingDay: 15,
	billingMonth: null,
	isVariable: false,
	active: true,
	notes: null,
	createdAt: new Date(),
}

describe('GET /api/recurring-items', () => {
	beforeEach(() => vi.clearAllMocks())

	it('returns all items with 200', async () => {
		mockService.findAll.mockResolvedValue([item])
		const response = await GET()
		expect(response.status).toBe(200)
	})
})

describe('POST /api/recurring-items', () => {
	beforeEach(() => vi.clearAllMocks())

	it('creates item and returns 201', async () => {
		mockService.create.mockResolvedValue(item)
		const request = new NextRequest('http://localhost/api/recurring-items', {
			method: 'POST',
			body: JSON.stringify({
				description: 'Netflix',
				categoryId: 1,
				essentialityId: 1,
				paymentMethod: 'itau_visa',
				frequency: 'monthly',
				amountUsd: 15,
				billingDay: 15,
			}),
			headers: { 'Content-Type': 'application/json' },
		})
		const response = await POST(request)
		expect(response.status).toBe(201)
	})

	it('returns 400 for invalid paymentMethod', async () => {
		const request = new NextRequest('http://localhost/api/recurring-items', {
			method: 'POST',
			body: JSON.stringify({
				description: 'Netflix',
				categoryId: 1,
				essentialityId: 1,
				paymentMethod: 'invalid',
				frequency: 'monthly',
			}),
			headers: { 'Content-Type': 'application/json' },
		})
		const response = await POST(request)
		expect(response.status).toBe(400)
	})

	it('returns 422 for missing billingDay on monthly', async () => {
		mockService.create.mockRejectedValue(
			new Error('monthly item requires billingDay'),
		)
		const request = new NextRequest('http://localhost/api/recurring-items', {
			method: 'POST',
			body: JSON.stringify({
				description: 'Netflix',
				categoryId: 1,
				essentialityId: 1,
				paymentMethod: 'itau_visa',
				frequency: 'monthly',
				amountUsd: 15,
			}),
			headers: { 'Content-Type': 'application/json' },
		})
		const response = await POST(request)
		expect(response.status).toBe(422)
	})
})
