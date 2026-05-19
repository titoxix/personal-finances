// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

vi.mock('@/lib/prisma', () => ({ prisma: {} }))
vi.mock('@/repositories/prisma/PrismaTransactionRepository', () => ({
	createPrismaTransactionRepository: vi.fn(() => ({})),
}))

const mockService = {
	findAll: vi.fn(),
	findById: vi.fn(),
	findByMonth: vi.fn(),
	findByMonthAndCategory: vi.fn(),
	create: vi.fn(),
	update: vi.fn(),
	delete: vi.fn(),
}

vi.mock('@/services/TransactionService', () => ({
	createTransactionService: vi.fn(() => mockService),
}))

const { GET, PATCH, DELETE } = await import('./route')

const req = new NextRequest('http://localhost/api/transactions/1')
const tx = { id: 1, date: new Date('2026-05-10'), description: 'Supermercado', amountGs: 150000, amountUsd: null, exchangeRateValue: null, exchangeRateId: null, categoryId: 1, essentialityId: 1, paymentMethod: 'itau_debito', weekOfMonth: 2, isInstallment: false, installmentCurrent: null, installmentTotal: null, installmentPlanId: null, isRecurring: false, notes: null, createdAt: new Date() }

describe('GET /api/transactions/[id]', () => {
	beforeEach(() => vi.clearAllMocks())

	it('returns transaction with 200', async () => {
		mockService.findById.mockResolvedValue(tx)
		const response = await GET(req, { params: Promise.resolve({ id: '1' }) })
		expect(response.status).toBe(200)
	})

	it('returns 404 when not found', async () => {
		mockService.findById.mockRejectedValue(new Error('Transaction not found'))
		const response = await GET(req, { params: Promise.resolve({ id: '99' }) })
		expect(response.status).toBe(404)
	})
})

describe('PATCH /api/transactions/[id]', () => {
	beforeEach(() => vi.clearAllMocks())

	it('updates and returns 200', async () => {
		mockService.update.mockResolvedValue({ ...tx, description: 'Supermercado Disco' })
		const request = new NextRequest('http://localhost/api/transactions/1', {
			method: 'PATCH',
			body: JSON.stringify({ description: 'Supermercado Disco' }),
			headers: { 'Content-Type': 'application/json' },
		})
		const response = await PATCH(request, { params: Promise.resolve({ id: '1' }) })
		expect(response.status).toBe(200)
	})

	it('returns 404 when not found', async () => {
		mockService.update.mockRejectedValue(new Error('Transaction not found'))
		const request = new NextRequest('http://localhost/api/transactions/1', {
			method: 'PATCH',
			body: JSON.stringify({ description: 'Updated' }),
			headers: { 'Content-Type': 'application/json' },
		})
		const response = await PATCH(request, { params: Promise.resolve({ id: '99' }) })
		expect(response.status).toBe(404)
	})
})

describe('DELETE /api/transactions/[id]', () => {
	beforeEach(() => vi.clearAllMocks())

	it('deletes and returns 204', async () => {
		mockService.delete.mockResolvedValue(undefined)
		const response = await DELETE(req, { params: Promise.resolve({ id: '1' }) })
		expect(response.status).toBe(204)
	})

	it('returns 404 when not found', async () => {
		mockService.delete.mockRejectedValue(new Error('Transaction not found'))
		const response = await DELETE(req, { params: Promise.resolve({ id: '99' }) })
		expect(response.status).toBe(404)
	})
})
