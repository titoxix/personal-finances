// @vitest-environment node

import { NextRequest } from 'next/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

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

const { GET, PATCH } = await import('./route')

const req = new NextRequest('http://localhost/api/budgets/1')
const budget = {
	id: 1,
	month: new Date('2026-05-01'),
	categoryId: 1,
	essentialityId: 1,
	budgetedUsd: 200,
	budgetedGs: null,
	notes: null,
	createdAt: new Date(),
}

describe('GET /api/budgets/[id]', () => {
	beforeEach(() => vi.clearAllMocks())

	it('returns budget with 200', async () => {
		mockService.findById.mockResolvedValue(budget)
		const response = await GET(req, { params: Promise.resolve({ id: '1' }) })
		expect(response.status).toBe(200)
	})

	it('returns 404 when not found', async () => {
		mockService.findById.mockRejectedValue(new Error('Budget not found'))
		const response = await GET(req, { params: Promise.resolve({ id: '99' }) })
		expect(response.status).toBe(404)
	})
})

describe('PATCH /api/budgets/[id]', () => {
	beforeEach(() => vi.clearAllMocks())

	it('updates and returns 200', async () => {
		mockService.update.mockResolvedValue({ ...budget, budgetedUsd: 300 })
		const request = new NextRequest('http://localhost/api/budgets/1', {
			method: 'PATCH',
			body: JSON.stringify({ budgetedUsd: 300 }),
			headers: { 'Content-Type': 'application/json' },
		})
		const response = await PATCH(request, {
			params: Promise.resolve({ id: '1' }),
		})
		expect(response.status).toBe(200)
	})

	it('returns 404 when not found', async () => {
		mockService.update.mockRejectedValue(new Error('Budget not found'))
		const request = new NextRequest('http://localhost/api/budgets/1', {
			method: 'PATCH',
			body: JSON.stringify({ budgetedUsd: 300 }),
			headers: { 'Content-Type': 'application/json' },
		})
		const response = await PATCH(request, {
			params: Promise.resolve({ id: '99' }),
		})
		expect(response.status).toBe(404)
	})
})
