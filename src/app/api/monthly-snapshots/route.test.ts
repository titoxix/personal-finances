// @vitest-environment node

import { NextRequest } from 'next/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockService = {
	findAll: vi.fn(),
	findById: vi.fn(),
	findByDate: vi.fn(),
	findLatest: vi.fn(),
	create: vi.fn(),
	update: vi.fn(),
}

vi.mock('@/lib/container', () => ({
	snapshotService: mockService,
}))

const { GET, POST } = await import('./route')

const snapshot = {
	id: 1,
	date: new Date('2026-05-15'),
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
	itauCardGs: null,
	uenoCardGs: null,
	pendingInstallmentsGs: null,
	netWorthUsd: null,
	totalInvestedUsd: null,
	totalDebtUsd: null,
	savingsRatePct: null,
	notes: null,
	investments: [],
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
			body: JSON.stringify({ date: '2026-05-15' }),
			headers: { 'Content-Type': 'application/json' },
		})
		const response = await POST(request)
		expect(response.status).toBe(201)
	})

	it('returns 400 for missing date', async () => {
		const request = new NextRequest('http://localhost/api/monthly-snapshots', {
			method: 'POST',
			body: JSON.stringify({}),
			headers: { 'Content-Type': 'application/json' },
		})
		const response = await POST(request)
		expect(response.status).toBe(400)
	})

	it('creates snapshot with investments and returns 201', async () => {
		mockService.create.mockResolvedValue({
			...snapshot,
			investments: [
				{
					id: 1,
					snapshotId: 1,
					name: 'Investor',
					currency: 'USD',
					value: 10000,
					returnPct: 3.2,
					createdAt: new Date(),
				},
			],
		})
		const request = new NextRequest('http://localhost/api/monthly-snapshots', {
			method: 'POST',
			body: JSON.stringify({
				date: '2026-05-15',
				investments: [
					{ name: 'Investor', currency: 'USD', value: 10000, returnPct: 3.2 },
				],
			}),
			headers: { 'Content-Type': 'application/json' },
		})
		const response = await POST(request)
		expect(response.status).toBe(201)
	})
})
