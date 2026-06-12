// @vitest-environment node

import { NextRequest } from 'next/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockMonthlySnapshotService = {
	findById: vi.fn(),
}

const mockSnapshotExportService = {
	buildExport: vi.fn(),
}

vi.mock('@/lib/container', () => ({
	monthlySnapshotService: mockMonthlySnapshotService,
	snapshotExportService: mockSnapshotExportService,
}))

const { GET } = await import('./route')

function makeRequest(id: string) {
	return {
		req: new NextRequest(`http://localhost/api/monthly-snapshots/${id}/export`),
		params: Promise.resolve({ id }),
	}
}

describe('GET /api/monthly-snapshots/[id]/export', () => {
	beforeEach(() => vi.clearAllMocks())

	it('returns 200 with a Content-Disposition header derived from the snapshot month', async () => {
		mockMonthlySnapshotService.findById.mockResolvedValue({
			id: 1,
			month: new Date('2026-06-01'),
		})
		mockSnapshotExportService.buildExport.mockResolvedValue({ meta: {} })

		const { req, params } = makeRequest('1')
		const response = await GET(req, { params })

		expect(response.status).toBe(200)
		expect(response.headers.get('Content-Disposition')).toBe(
			'attachment; filename="snapshot-2026-06.json"',
		)
		expect(mockSnapshotExportService.buildExport).toHaveBeenCalledWith(
			new Date('2026-06-01'),
		)
	})

	it('zero-pads single-digit months in the filename', async () => {
		mockMonthlySnapshotService.findById.mockResolvedValue({
			id: 1,
			month: new Date('2026-01-01'),
		})
		mockSnapshotExportService.buildExport.mockResolvedValue({ meta: {} })

		const { req, params } = makeRequest('1')
		const response = await GET(req, { params })

		expect(response.headers.get('Content-Disposition')).toBe(
			'attachment; filename="snapshot-2026-01.json"',
		)
	})

	it('returns 404 when the snapshot does not exist', async () => {
		mockMonthlySnapshotService.findById.mockRejectedValue(
			new Error('MonthlySnapshot not found'),
		)

		const { req, params } = makeRequest('999')
		const response = await GET(req, { params })

		expect(response.status).toBe(404)
	})

	it('returns 500 on unexpected errors', async () => {
		mockMonthlySnapshotService.findById.mockResolvedValue({
			id: 1,
			month: new Date('2026-06-01'),
		})
		mockSnapshotExportService.buildExport.mockRejectedValue(new Error('boom'))

		const { req, params } = makeRequest('1')
		const response = await GET(req, { params })

		expect(response.status).toBe(500)
	})
})
