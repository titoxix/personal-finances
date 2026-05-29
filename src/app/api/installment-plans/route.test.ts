// @vitest-environment node

import { NextRequest } from 'next/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/prisma', () => ({ prisma: {} }))
vi.mock('@/repositories/prisma/PrismaInstallmentPlanRepository', () => ({
	createPrismaInstallmentPlanRepository: vi.fn(() => ({})),
}))

const mockService = {
	findAll: vi.fn(),
	findById: vi.fn(),
	findActive: vi.fn(),
	create: vi.fn(),
	update: vi.fn(),
	deactivate: vi.fn(),
}

vi.mock('@/services/InstallmentPlanService', () => ({
	createInstallmentPlanService: vi.fn(() => mockService),
}))

const { GET, POST } = await import('./route')

const plan = {
	id: 1,
	description: 'TV Samsung',
	totalAmountGs: null,
	totalAmountUsd: 500,
	installmentsTotal: 12,
	installmentsPaid: 0,
	installmentAmountGs: null,
	startDate: new Date('2026-01-01'),
	endDate: new Date('2027-01-01'),
	paymentMethod: 'itau_visa',
	categoryId: 1,
	essentialityId: 1,
	active: true,
	notes: null,
	createdAt: new Date(),
}

describe('GET /api/installment-plans', () => {
	beforeEach(() => vi.clearAllMocks())

	it('returns all plans with 200', async () => {
		mockService.findAll.mockResolvedValue([plan])
		const response = await GET()
		expect(response.status).toBe(200)
	})
})

describe('POST /api/installment-plans', () => {
	beforeEach(() => vi.clearAllMocks())

	it('creates plan and returns 201', async () => {
		mockService.create.mockResolvedValue(plan)
		const request = new NextRequest('http://localhost/api/installment-plans', {
			method: 'POST',
			body: JSON.stringify({
				description: 'TV Samsung',
				installmentsTotal: 12,
				startDate: '2026-01-01',
				paymentMethod: 'itau_visa',
				categoryId: 1,
				essentialityId: 1,
				totalAmountUsd: 500,
			}),
			headers: { 'Content-Type': 'application/json' },
		})
		const response = await POST(request)
		expect(response.status).toBe(201)
	})

	it('returns 400 for missing required fields', async () => {
		const request = new NextRequest('http://localhost/api/installment-plans', {
			method: 'POST',
			body: JSON.stringify({ description: 'TV Samsung' }),
			headers: { 'Content-Type': 'application/json' },
		})
		const response = await POST(request)
		expect(response.status).toBe(400)
	})

	it('returns 422 for business rule violation', async () => {
		mockService.create.mockRejectedValue(
			new Error('installmentsTotal must be at least 1'),
		)
		const request = new NextRequest('http://localhost/api/installment-plans', {
			method: 'POST',
			body: JSON.stringify({
				description: 'TV Samsung',
				installmentsTotal: 12,
				startDate: '2026-01-01',
				paymentMethod: 'itau_visa',
				categoryId: 1,
				essentialityId: 1,
			}),
			headers: { 'Content-Type': 'application/json' },
		})
		const response = await POST(request)
		expect(response.status).toBe(422)
	})
})
