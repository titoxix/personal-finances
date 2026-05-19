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

const { GET, POST } = await import('./route')

const tx = { id: 1, date: new Date('2026-05-10'), description: 'Supermercado', amountGs: 150000, amountUsd: null, exchangeRateValue: null, exchangeRateId: null, categoryId: 1, essentialityId: 1, paymentMethod: 'itau_debito', weekOfMonth: 2, isInstallment: false, installmentCurrent: null, installmentTotal: null, installmentPlanId: null, isRecurring: false, notes: null, createdAt: new Date() }

describe('GET /api/transactions', () => {
	beforeEach(() => vi.clearAllMocks())

	it('returns all transactions with 200', async () => {
		mockService.findAll.mockResolvedValue([tx])
		const response = await GET()
		expect(response.status).toBe(200)
	})
})

describe('POST /api/transactions', () => {
	beforeEach(() => vi.clearAllMocks())

	it('creates transaction and returns 201', async () => {
		mockService.create.mockResolvedValue(tx)
		const request = new NextRequest('http://localhost/api/transactions', {
			method: 'POST',
			body: JSON.stringify({ date: '2026-05-10', description: 'Supermercado', categoryId: 1, essentialityId: 1, paymentMethod: 'itau_debito', amountGs: 150000 }),
			headers: { 'Content-Type': 'application/json' },
		})
		const response = await POST(request)
		expect(response.status).toBe(201)
	})

	it('returns 400 for missing required fields', async () => {
		const request = new NextRequest('http://localhost/api/transactions', {
			method: 'POST',
			body: JSON.stringify({ date: '2026-05-10', description: 'Supermercado' }),
			headers: { 'Content-Type': 'application/json' },
		})
		const response = await POST(request)
		expect(response.status).toBe(400)
	})

	it('returns 422 when no amount provided', async () => {
		mockService.create.mockRejectedValue(new Error('transaction requires amountGs or amountUsd'))
		const request = new NextRequest('http://localhost/api/transactions', {
			method: 'POST',
			body: JSON.stringify({ date: '2026-05-10', description: 'Supermercado', categoryId: 1, essentialityId: 1, paymentMethod: 'itau_debito' }),
			headers: { 'Content-Type': 'application/json' },
		})
		const response = await POST(request)
		expect(response.status).toBe(422)
	})
})
