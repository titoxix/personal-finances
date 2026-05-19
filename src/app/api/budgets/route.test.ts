// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

vi.mock('@/lib/prisma', () => ({ prisma: {} }))
vi.mock('@/repositories/prisma/PrismaBudgetRepository', () => ({
	createPrismaBudgetRepository: vi.fn(() => ({})),
}))

const mockService = {
	findAll: vi.fn(),
	findById: vi.fn(),
	findByMonth: vi.fn(),
	findByMonthAndCategory: vi.fn(),
	create: vi.fn(),
	update: vi.fn(),
}

vi.mock('@/services/BudgetService', () => ({
	createBudgetService: vi.fn(() => mockService),
}))

const { GET, POST } = await import('./route')

const budget = { id: 1, month: new Date('2026-05-01'), categoryId: 1, essentialityId: 1, budgetedUsd: 200, budgetedGs: null, notes: null, createdAt: new Date() }

describe('GET /api/budgets', () => {
	beforeEach(() => vi.clearAllMocks())

	it('returns all budgets with 200', async () => {
		mockService.findAll.mockResolvedValue([budget])
		const response = await GET()
		expect(response.status).toBe(200)
	})
})

describe('POST /api/budgets', () => {
	beforeEach(() => vi.clearAllMocks())

	it('creates budget and returns 201', async () => {
		mockService.create.mockResolvedValue(budget)
		const request = new NextRequest('http://localhost/api/budgets', {
			method: 'POST',
			body: JSON.stringify({ month: '2026-05-01', categoryId: 1, essentialityId: 1, budgetedUsd: 200 }),
			headers: { 'Content-Type': 'application/json' },
		})
		const response = await POST(request)
		expect(response.status).toBe(201)
	})

	it('returns 400 for missing required fields', async () => {
		const request = new NextRequest('http://localhost/api/budgets', {
			method: 'POST',
			body: JSON.stringify({ month: '2026-05-01' }),
			headers: { 'Content-Type': 'application/json' },
		})
		const response = await POST(request)
		expect(response.status).toBe(400)
	})

	it('returns 409 when budget already exists for month+category', async () => {
		mockService.create.mockRejectedValue(new Error('Budget already exists for this month and category'))
		const request = new NextRequest('http://localhost/api/budgets', {
			method: 'POST',
			body: JSON.stringify({ month: '2026-05-01', categoryId: 1, essentialityId: 1, budgetedUsd: 200 }),
			headers: { 'Content-Type': 'application/json' },
		})
		const response = await POST(request)
		expect(response.status).toBe(409)
	})

	it('returns 422 when no amount provided', async () => {
		mockService.create.mockRejectedValue(new Error('budget requires budgetedUsd or budgetedGs'))
		const request = new NextRequest('http://localhost/api/budgets', {
			method: 'POST',
			body: JSON.stringify({ month: '2026-05-01', categoryId: 1, essentialityId: 1 }),
			headers: { 'Content-Type': 'application/json' },
		})
		const response = await POST(request)
		expect(response.status).toBe(422)
	})
})
