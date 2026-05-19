// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

vi.mock('@/lib/prisma', () => ({ prisma: {} }))
vi.mock('@/repositories/prisma/PrismaEssentialityLevelRepository', () => ({
	createPrismaEssentialityLevelRepository: vi.fn(() => ({})),
}))

const mockService = {
	findAll: vi.fn(),
	findById: vi.fn(),
	findByCode: vi.fn(),
	create: vi.fn(),
	update: vi.fn(),
	deactivate: vi.fn(),
}

vi.mock('@/services/EssentialityLevelService', () => ({
	createEssentialityLevelService: vi.fn(() => mockService),
}))

const { GET, PATCH, DELETE } = await import('./route')

const req = new NextRequest('http://localhost/api/essentiality-levels/1')
const level = { id: 1, code: 'ESSENTIAL', label: 'Essential', description: null, sortOrder: 1, active: true, createdAt: new Date() }

describe('GET /api/essentiality-levels/[id]', () => {
	beforeEach(() => vi.clearAllMocks())

	it('returns level with 200', async () => {
		mockService.findById.mockResolvedValue(level)
		const response = await GET(req, { params: Promise.resolve({ id: '1' }) })
		expect(response.status).toBe(200)
	})

	it('returns 404 when not found', async () => {
		mockService.findById.mockRejectedValue(new Error('EssentialityLevel not found'))
		const response = await GET(req, { params: Promise.resolve({ id: '99' }) })
		expect(response.status).toBe(404)
	})
})

describe('PATCH /api/essentiality-levels/[id]', () => {
	beforeEach(() => vi.clearAllMocks())

	it('updates and returns 200', async () => {
		mockService.update.mockResolvedValue({ ...level, label: 'Updated' })
		const request = new NextRequest('http://localhost/api/essentiality-levels/1', {
			method: 'PATCH',
			body: JSON.stringify({ label: 'Updated' }),
			headers: { 'Content-Type': 'application/json' },
		})
		const response = await PATCH(request, { params: Promise.resolve({ id: '1' }) })
		expect(response.status).toBe(200)
	})

	it('returns 404 when not found', async () => {
		mockService.update.mockRejectedValue(new Error('EssentialityLevel not found'))
		const request = new NextRequest('http://localhost/api/essentiality-levels/1', {
			method: 'PATCH',
			body: JSON.stringify({ label: 'Updated' }),
			headers: { 'Content-Type': 'application/json' },
		})
		const response = await PATCH(request, { params: Promise.resolve({ id: '99' }) })
		expect(response.status).toBe(404)
	})
})

describe('DELETE /api/essentiality-levels/[id]', () => {
	beforeEach(() => vi.clearAllMocks())

	it('deactivates and returns 200', async () => {
		mockService.deactivate.mockResolvedValue({ ...level, active: false })
		const response = await DELETE(req, { params: Promise.resolve({ id: '1' }) })
		expect(response.status).toBe(200)
		const data = await response.json()
		expect(data.active).toBe(false)
	})

	it('returns 404 when not found', async () => {
		mockService.deactivate.mockRejectedValue(new Error('EssentialityLevel not found'))
		const response = await DELETE(req, { params: Promise.resolve({ id: '99' }) })
		expect(response.status).toBe(404)
	})
})
