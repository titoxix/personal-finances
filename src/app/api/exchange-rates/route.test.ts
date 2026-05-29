// @vitest-environment node

import { NextRequest } from 'next/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/prisma', () => ({ prisma: {} }))
vi.mock('@/repositories/prisma/PrismaExchangeRateRepository', () => ({
	createPrismaExchangeRateRepository: vi.fn(() => ({})),
}))

const mockService = {
	findAll: vi.fn(),
	findById: vi.fn(),
	findBySource: vi.fn(),
	findLatestBySource: vi.fn(),
	create: vi.fn(),
}

vi.mock('@/services/ExchangeRateService', () => ({
	createExchangeRateService: vi.fn(() => mockService),
}))

const { GET, POST } = await import('./route')

const rate = {
	id: 1,
	recordedAt: new Date(),
	source: 'bcp',
	rateBuy: null,
	rateSell: null,
	rateMid: 7800,
	notes: null,
	createdAt: new Date(),
}

describe('GET /api/exchange-rates', () => {
	beforeEach(() => vi.clearAllMocks())

	it('returns all rates with 200', async () => {
		mockService.findAll.mockResolvedValue([rate])
		const response = await GET()
		expect(response.status).toBe(200)
	})
})

describe('POST /api/exchange-rates', () => {
	beforeEach(() => vi.clearAllMocks())

	it('creates a rate and returns 201', async () => {
		mockService.create.mockResolvedValue(rate)
		const request = new NextRequest('http://localhost/api/exchange-rates', {
			method: 'POST',
			body: JSON.stringify({ source: 'bcp', rateMid: 7800 }),
			headers: { 'Content-Type': 'application/json' },
		})
		const response = await POST(request)
		expect(response.status).toBe(201)
	})

	it('returns 400 for invalid source', async () => {
		const request = new NextRequest('http://localhost/api/exchange-rates', {
			method: 'POST',
			body: JSON.stringify({ source: 'unknown', rateMid: 7800 }),
			headers: { 'Content-Type': 'application/json' },
		})
		const response = await POST(request)
		expect(response.status).toBe(400)
	})

	it('returns 422 for business rule violation', async () => {
		mockService.create.mockRejectedValue(new Error('bcp rate requires rateMid'))
		const request = new NextRequest('http://localhost/api/exchange-rates', {
			method: 'POST',
			body: JSON.stringify({ source: 'bcp' }),
			headers: { 'Content-Type': 'application/json' },
		})
		const response = await POST(request)
		expect(response.status).toBe(422)
	})
})
