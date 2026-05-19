// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

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

const { GET } = await import('./route')

const req = new NextRequest('http://localhost/api/exchange-rates/1')
const rate = { id: 1, recordedAt: new Date(), source: 'bcp', rateBuy: null, rateSell: null, rateMid: 7800, notes: null, createdAt: new Date() }

describe('GET /api/exchange-rates/[id]', () => {
	beforeEach(() => vi.clearAllMocks())

	it('returns rate with 200', async () => {
		mockService.findById.mockResolvedValue(rate)
		const response = await GET(req, { params: Promise.resolve({ id: '1' }) })
		expect(response.status).toBe(200)
	})

	it('returns 404 when not found', async () => {
		mockService.findById.mockRejectedValue(new Error('ExchangeRate not found'))
		const response = await GET(req, { params: Promise.resolve({ id: '99' }) })
		expect(response.status).toBe(404)
	})
})
