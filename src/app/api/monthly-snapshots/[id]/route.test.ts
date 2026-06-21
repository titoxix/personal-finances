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

const { GET, PATCH } = await import('./route')

const req = new NextRequest('http://localhost/api/monthly-snapshots/1')
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

describe('GET /api/monthly-snapshots/[id]', () => {
	beforeEach(() => vi.clearAllMocks())

	it('returns snapshot with 200', async () => {
		mockService.findById.mockResolvedValue(snapshot)
		const response = await GET(req, { params: Promise.resolve({ id: '1' }) })
		expect(response.status).toBe(200)
	})

	it('returns 404 when not found', async () => {
		mockService.findById.mockRejectedValue(new Error('Snapshot not found'))
		const response = await GET(req, { params: Promise.resolve({ id: '99' }) })
		expect(response.status).toBe(404)
	})
})

describe('PATCH /api/monthly-snapshots/[id]', () => {
	beforeEach(() => vi.clearAllMocks())

	it('updates and returns 200', async () => {
		mockService.update.mockResolvedValue({ ...snapshot, incomeUsd: 3500 })
		const request = new NextRequest(
			'http://localhost/api/monthly-snapshots/1',
			{
				method: 'PATCH',
				body: JSON.stringify({ incomeUsd: 3500 }),
				headers: { 'Content-Type': 'application/json' },
			},
		)
		const response = await PATCH(request, {
			params: Promise.resolve({ id: '1' }),
		})
		expect(response.status).toBe(200)
	})

	it('updates investments and returns 200', async () => {
		mockService.update.mockResolvedValue({
			...snapshot,
			investments: [
				{
					id: 2,
					snapshotId: 1,
					name: 'ETF',
					currency: 'USD',
					value: 25000,
					returnPct: 11,
					createdAt: new Date(),
				},
			],
		})
		const request = new NextRequest(
			'http://localhost/api/monthly-snapshots/1',
			{
				method: 'PATCH',
				body: JSON.stringify({
					investments: [
						{ name: 'ETF', currency: 'USD', value: 25000, returnPct: 11 },
					],
				}),
				headers: { 'Content-Type': 'application/json' },
			},
		)
		const response = await PATCH(request, {
			params: Promise.resolve({ id: '1' }),
		})
		expect(response.status).toBe(200)
	})

	it('returns 404 when not found', async () => {
		mockService.update.mockRejectedValue(new Error('Snapshot not found'))
		const request = new NextRequest(
			'http://localhost/api/monthly-snapshots/1',
			{
				method: 'PATCH',
				body: JSON.stringify({ incomeUsd: 3500 }),
				headers: { 'Content-Type': 'application/json' },
			},
		)
		const response = await PATCH(request, {
			params: Promise.resolve({ id: '99' }),
		})
		expect(response.status).toBe(404)
	})
})
