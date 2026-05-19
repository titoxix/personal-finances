// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

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

const { GET, PATCH } = await import('./route')

const req = new NextRequest('http://localhost/api/monthly-snapshots/1')
const snapshot = { id: 1, month: new Date('2026-05-01'), incomeUsd: 3000, exchangeRateValue: 7800, exchangeRateId: 1, balanceItauUsd: 5000, balanceItauGs: null, balanceUenoUsd: null, balanceUenoGs: null, balanceMangoGs: null, balanceGnbGs: null, gnbCardGs: null, investorFundUsd: null, investorFundGs: null, investorReturnPct: null, etfPortfolioUsd: null, etfReturnPct: null, itauCardGs: null, uenoCardGs: null, pendingInstallmentsGs: null, netWorthUsd: null, totalInvestedUsd: null, totalDebtUsd: null, savingsRatePct: null, notes: null, createdAt: new Date() }

describe('GET /api/monthly-snapshots/[id]', () => {
	beforeEach(() => vi.clearAllMocks())

	it('returns snapshot with 200', async () => {
		mockService.findById.mockResolvedValue(snapshot)
		const response = await GET(req, { params: Promise.resolve({ id: '1' }) })
		expect(response.status).toBe(200)
	})

	it('returns 404 when not found', async () => {
		mockService.findById.mockRejectedValue(new Error('MonthlySnapshot not found'))
		const response = await GET(req, { params: Promise.resolve({ id: '99' }) })
		expect(response.status).toBe(404)
	})
})

describe('PATCH /api/monthly-snapshots/[id]', () => {
	beforeEach(() => vi.clearAllMocks())

	it('updates and returns 200', async () => {
		mockService.update.mockResolvedValue({ ...snapshot, incomeUsd: 3500 })
		const request = new NextRequest('http://localhost/api/monthly-snapshots/1', {
			method: 'PATCH',
			body: JSON.stringify({ incomeUsd: 3500 }),
			headers: { 'Content-Type': 'application/json' },
		})
		const response = await PATCH(request, { params: Promise.resolve({ id: '1' }) })
		expect(response.status).toBe(200)
	})

	it('returns 404 when not found', async () => {
		mockService.update.mockRejectedValue(new Error('MonthlySnapshot not found'))
		const request = new NextRequest('http://localhost/api/monthly-snapshots/1', {
			method: 'PATCH',
			body: JSON.stringify({ incomeUsd: 3500 }),
			headers: { 'Content-Type': 'application/json' },
		})
		const response = await PATCH(request, { params: Promise.resolve({ id: '99' }) })
		expect(response.status).toBe(404)
	})
})
