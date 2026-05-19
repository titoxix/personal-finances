// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

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

const { GET, PATCH, DELETE } = await import('./route')

const req = new NextRequest('http://localhost/api/recurring-items/1')
const item = { id: 1, description: 'Netflix', amountGs: null, amountUsd: 15, categoryId: 1, essentialityId: 1, paymentMethod: 'itau_visa', frequency: 'monthly', billingDay: 15, billingMonth: null, isVariable: false, active: true, notes: null, createdAt: new Date() }

describe('GET /api/recurring-items/[id]', () => {
	beforeEach(() => vi.clearAllMocks())

	it('returns item with 200', async () => {
		mockService.findById.mockResolvedValue(item)
		const response = await GET(req, { params: Promise.resolve({ id: '1' }) })
		expect(response.status).toBe(200)
	})

	it('returns 404 when not found', async () => {
		mockService.findById.mockRejectedValue(new Error('RecurringItem not found'))
		const response = await GET(req, { params: Promise.resolve({ id: '99' }) })
		expect(response.status).toBe(404)
	})
})

describe('PATCH /api/recurring-items/[id]', () => {
	beforeEach(() => vi.clearAllMocks())

	it('updates and returns 200', async () => {
		mockService.update.mockResolvedValue({ ...item, description: 'Spotify' })
		const request = new NextRequest('http://localhost/api/recurring-items/1', {
			method: 'PATCH',
			body: JSON.stringify({ description: 'Spotify' }),
			headers: { 'Content-Type': 'application/json' },
		})
		const response = await PATCH(request, { params: Promise.resolve({ id: '1' }) })
		expect(response.status).toBe(200)
	})

	it('returns 404 when not found', async () => {
		mockService.update.mockRejectedValue(new Error('RecurringItem not found'))
		const request = new NextRequest('http://localhost/api/recurring-items/1', {
			method: 'PATCH',
			body: JSON.stringify({ description: 'Spotify' }),
			headers: { 'Content-Type': 'application/json' },
		})
		const response = await PATCH(request, { params: Promise.resolve({ id: '99' }) })
		expect(response.status).toBe(404)
	})
})

describe('DELETE /api/recurring-items/[id]', () => {
	beforeEach(() => vi.clearAllMocks())

	it('deactivates and returns 200', async () => {
		mockService.deactivate.mockResolvedValue({ ...item, active: false })
		const response = await DELETE(req, { params: Promise.resolve({ id: '1' }) })
		expect(response.status).toBe(200)
	})

	it('returns 404 when not found', async () => {
		mockService.deactivate.mockRejectedValue(new Error('RecurringItem not found'))
		const response = await DELETE(req, { params: Promise.resolve({ id: '99' }) })
		expect(response.status).toBe(404)
	})
})
