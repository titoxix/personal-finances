// @vitest-environment node

import { NextRequest } from 'next/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

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

const { GET, POST } = await import('./route')

const level = {
	id: 1,
	code: 'ESSENTIAL',
	label: 'Essential',
	description: null,
	sortOrder: 1,
	active: true,
	createdAt: new Date(),
}

describe('GET /api/essentiality-levels', () => {
	beforeEach(() => vi.clearAllMocks())

	it('returns all levels with 200', async () => {
		mockService.findAll.mockResolvedValue([level])
		const response = await GET()
		expect(response.status).toBe(200)
		const data = await response.json()
		expect(data).toHaveLength(1)
	})
})

describe('POST /api/essentiality-levels', () => {
	beforeEach(() => vi.clearAllMocks())

	it('creates a level and returns 201', async () => {
		mockService.create.mockResolvedValue(level)
		const request = new NextRequest(
			'http://localhost/api/essentiality-levels',
			{
				method: 'POST',
				body: JSON.stringify({
					code: 'ESSENTIAL',
					label: 'Essential',
					sortOrder: 1,
				}),
				headers: { 'Content-Type': 'application/json' },
			},
		)
		const response = await POST(request)
		expect(response.status).toBe(201)
	})

	it('returns 400 for missing sortOrder', async () => {
		const request = new NextRequest(
			'http://localhost/api/essentiality-levels',
			{
				method: 'POST',
				body: JSON.stringify({ code: 'ESSENTIAL', label: 'Essential' }),
				headers: { 'Content-Type': 'application/json' },
			},
		)
		const response = await POST(request)
		expect(response.status).toBe(400)
	})

	it('returns 409 when code already exists', async () => {
		mockService.create.mockRejectedValue(
			new Error('EssentialityLevel code already exists'),
		)
		const request = new NextRequest(
			'http://localhost/api/essentiality-levels',
			{
				method: 'POST',
				body: JSON.stringify({
					code: 'ESSENTIAL',
					label: 'Essential',
					sortOrder: 1,
				}),
				headers: { 'Content-Type': 'application/json' },
			},
		)
		const response = await POST(request)
		expect(response.status).toBe(409)
	})
})
