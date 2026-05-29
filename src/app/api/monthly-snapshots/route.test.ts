// @vitest-environment node

import { NextRequest } from 'next/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/prisma', () => ({ prisma: {} }))
vi.mock('@/repositories/prisma/PrismaMonthlySnapshotRepository', () => ({
	createPrismaMonthlySnapshotRepository: vi.fn(() => ({})),
}))

const mockService = {
	findAll: vi.fn(),
	findById: vi.fn(),
	findByMonth: vi.fn(),
	findLatest: vi.fn(),
	create: vi.fn(),
	update: vi.fn(),
}

vi.mock('@/services/MonthlySnapshotService', () => ({
	createMonthlySnapshotService: vi.fn(() => mockService),
}))

const { GET, POST } = await import('./route')

const snapshot = {
	id: 1,
	month: new Date('2026-05-01'),
	incomeUsd: 3000,
	exchangeRateValue: 7800,
	exchangeRateId: 1,
	balanceItauUsd: 5000,
	balanceItauGs: null,
	balanceUenoUsd: null,
	balanceUenoGs: null,
	balanceMangoGs: null,
	balanceGnbGs: null,
	gnbCardGs: null,
	investorFundUsd: null,
	investorFundGs: null,
	investorReturnPct: null,
	etfPortfolioUsd: null,
	etfReturnPct: null,
	itauCardGs: null,
	uenoCardGs: null,
	pendingInstallmentsGs: null,
	netWorthUsd: null,
	totalInvestedUsd: null,
	totalDebtUsd: null,
	savingsRatePct: null,
	notes: null,
	createdAt: new Date(),
}

describe('GET /api/monthly-snapshots', () => {
	beforeEach(() => vi.clearAllMocks())

	it('returns all snapshots with 200', async () => {
		mockService.findAll.mockResolvedValue([snapshot])
		const response = await GET()
		expect(response.status).toBe(200)
	})
})

describe('POST /api/monthly-snapshots', () => {
	beforeEach(() => vi.clearAllMocks())

	it('creates snapshot and returns 201', async () => {
		mockService.create.mockResolvedValue(snapshot)
		const request = new NextRequest('http://localhost/api/monthly-snapshots', {
			method: 'POST',
			body: JSON.stringify({ month: '2026-05-01' }),
			headers: { 'Content-Type': 'application/json' },
		})
		const response = await POST(request)
		expect(response.status).toBe(201)
	})

	it('returns 400 for missing month', async () => {
		const request = new NextRequest('http://localhost/api/monthly-snapshots', {
			method: 'POST',
			body: JSON.stringify({}),
			headers: { 'Content-Type': 'application/json' },
		})
		const response = await POST(request)
		expect(response.status).toBe(400)
	})

	it('returns 409 when snapshot already exists for month', async () => {
		mockService.create.mockRejectedValue(
			new Error('MonthlySnapshot already exists for this month'),
		)
		const request = new NextRequest('http://localhost/api/monthly-snapshots', {
			method: 'POST',
			body: JSON.stringify({ month: '2026-05-01' }),
			headers: { 'Content-Type': 'application/json' },
		})
		const response = await POST(request)
		expect(response.status).toBe(409)
	})
})
