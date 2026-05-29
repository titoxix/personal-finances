// @vitest-environment node

import { NextRequest } from 'next/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/prisma', () => ({ prisma: {} }))
vi.mock('@/repositories/prisma/PrismaIncomeRepository', () => ({
	createPrismaIncomeRepository: vi.fn(() => ({})),
}))

const mockService = {
	findAll: vi.fn(),
	findById: vi.fn(),
	findByMonth: vi.fn(),
	create: vi.fn(),
	update: vi.fn(),
}

vi.mock('@/services/IncomeService', () => ({
	createIncomeService: vi.fn(() => mockService),
}))

const { GET, POST } = await import('./route')

const income = {
	id: 1,
	month: new Date('2026-05-01'),
	grossIncomeUsd: 3000,
	budgetCapUsd: 2000,
	automaticInvestmentUsd: 500,
	automaticDest: 'ETF',
	exchangeRate: 7800,
	notes: null,
	createdAt: new Date(),
}

describe('GET /api/incomes', () => {
	beforeEach(() => vi.clearAllMocks())

	it('returns all incomes with 200', async () => {
		mockService.findAll.mockResolvedValue([income])
		const response = await GET()
		expect(response.status).toBe(200)
	})
})

describe('POST /api/incomes', () => {
	beforeEach(() => vi.clearAllMocks())

	it('creates income and returns 201', async () => {
		mockService.create.mockResolvedValue(income)
		const request = new NextRequest('http://localhost/api/incomes', {
			method: 'POST',
			body: JSON.stringify({
				month: '2026-05-01',
				grossIncomeUsd: 3000,
				budgetCapUsd: 2000,
				automaticInvestmentUsd: 500,
				automaticDest: 'ETF',
				exchangeRate: 7800,
			}),
			headers: { 'Content-Type': 'application/json' },
		})
		const response = await POST(request)
		expect(response.status).toBe(201)
	})

	it('returns 400 for missing required fields', async () => {
		const request = new NextRequest('http://localhost/api/incomes', {
			method: 'POST',
			body: JSON.stringify({ month: '2026-05-01' }),
			headers: { 'Content-Type': 'application/json' },
		})
		const response = await POST(request)
		expect(response.status).toBe(400)
	})

	it('returns 409 when income already exists for month', async () => {
		mockService.create.mockRejectedValue(
			new Error('Income already exists for this month'),
		)
		const request = new NextRequest('http://localhost/api/incomes', {
			method: 'POST',
			body: JSON.stringify({
				month: '2026-05-01',
				grossIncomeUsd: 3000,
				budgetCapUsd: 2000,
				automaticInvestmentUsd: 500,
				automaticDest: 'ETF',
				exchangeRate: 7800,
			}),
			headers: { 'Content-Type': 'application/json' },
		})
		const response = await POST(request)
		expect(response.status).toBe(409)
	})
})
