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

const { GET, PATCH } = await import('./route')

const req = new NextRequest('http://localhost/api/incomes/1')
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

describe('GET /api/incomes/[id]', () => {
	beforeEach(() => vi.clearAllMocks())

	it('returns income with 200', async () => {
		mockService.findById.mockResolvedValue(income)
		const response = await GET(req, { params: Promise.resolve({ id: '1' }) })
		expect(response.status).toBe(200)
	})

	it('returns 404 when not found', async () => {
		mockService.findById.mockRejectedValue(new Error('Income not found'))
		const response = await GET(req, { params: Promise.resolve({ id: '99' }) })
		expect(response.status).toBe(404)
	})
})

describe('PATCH /api/incomes/[id]', () => {
	beforeEach(() => vi.clearAllMocks())

	it('updates and returns 200', async () => {
		mockService.update.mockResolvedValue({ ...income, grossIncomeUsd: 3500 })
		const request = new NextRequest('http://localhost/api/incomes/1', {
			method: 'PATCH',
			body: JSON.stringify({ grossIncomeUsd: 3500 }),
			headers: { 'Content-Type': 'application/json' },
		})
		const response = await PATCH(request, {
			params: Promise.resolve({ id: '1' }),
		})
		expect(response.status).toBe(200)
	})

	it('returns 404 when not found', async () => {
		mockService.update.mockRejectedValue(new Error('Income not found'))
		const request = new NextRequest('http://localhost/api/incomes/1', {
			method: 'PATCH',
			body: JSON.stringify({ grossIncomeUsd: 3500 }),
			headers: { 'Content-Type': 'application/json' },
		})
		const response = await PATCH(request, {
			params: Promise.resolve({ id: '99' }),
		})
		expect(response.status).toBe(404)
	})
})
