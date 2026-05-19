// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

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

const { GET, PATCH, DELETE } = await import('./route')

const req = new NextRequest('http://localhost/api/installment-plans/1')
const plan = { id: 1, description: 'TV Samsung', totalAmountGs: null, totalAmountUsd: 500, installmentsTotal: 12, installmentsPaid: 0, installmentAmountGs: null, startDate: new Date('2026-01-01'), endDate: new Date('2027-01-01'), paymentMethod: 'itau_visa', categoryId: 1, essentialityId: 1, active: true, notes: null, createdAt: new Date() }

describe('GET /api/installment-plans/[id]', () => {
	beforeEach(() => vi.clearAllMocks())

	it('returns plan with 200', async () => {
		mockService.findById.mockResolvedValue(plan)
		const response = await GET(req, { params: Promise.resolve({ id: '1' }) })
		expect(response.status).toBe(200)
	})

	it('returns 404 when not found', async () => {
		mockService.findById.mockRejectedValue(new Error('InstallmentPlan not found'))
		const response = await GET(req, { params: Promise.resolve({ id: '99' }) })
		expect(response.status).toBe(404)
	})
})

describe('PATCH /api/installment-plans/[id]', () => {
	beforeEach(() => vi.clearAllMocks())

	it('updates and returns 200', async () => {
		mockService.update.mockResolvedValue({ ...plan, installmentsPaid: 1 })
		const request = new NextRequest('http://localhost/api/installment-plans/1', {
			method: 'PATCH',
			body: JSON.stringify({ installmentsPaid: 1 }),
			headers: { 'Content-Type': 'application/json' },
		})
		const response = await PATCH(request, { params: Promise.resolve({ id: '1' }) })
		expect(response.status).toBe(200)
	})

	it('returns 404 when not found', async () => {
		mockService.update.mockRejectedValue(new Error('InstallmentPlan not found'))
		const request = new NextRequest('http://localhost/api/installment-plans/1', {
			method: 'PATCH',
			body: JSON.stringify({ installmentsPaid: 1 }),
			headers: { 'Content-Type': 'application/json' },
		})
		const response = await PATCH(request, { params: Promise.resolve({ id: '99' }) })
		expect(response.status).toBe(404)
	})
})

describe('DELETE /api/installment-plans/[id]', () => {
	beforeEach(() => vi.clearAllMocks())

	it('deactivates and returns 200', async () => {
		mockService.deactivate.mockResolvedValue({ ...plan, active: false })
		const response = await DELETE(req, { params: Promise.resolve({ id: '1' }) })
		expect(response.status).toBe(200)
	})

	it('returns 404 when not found', async () => {
		mockService.deactivate.mockRejectedValue(new Error('InstallmentPlan not found'))
		const response = await DELETE(req, { params: Promise.resolve({ id: '99' }) })
		expect(response.status).toBe(404)
	})
})
