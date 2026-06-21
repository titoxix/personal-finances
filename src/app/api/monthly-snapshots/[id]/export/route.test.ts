// @vitest-environment node

import { NextRequest } from 'next/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockSnapshotService = {
	findById: vi.fn(),
}

const mockSnapshotExportService = {
	buildExportForSnapshot: vi.fn(),
}

vi.mock('@/lib/container', () => ({
	snapshotService: mockSnapshotService,
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

	it('returns 200 with a Content-Disposition header derived from the snapshot date', async () => {
		const snapshot = {
			id: 1,
			date: new Date('2026-06-15'),
		}
		mockSnapshotService.findById.mockResolvedValue(snapshot)
		mockSnapshotExportService.buildExportForSnapshot.mockResolvedValue({
			meta: {},
		})

		const { req, params } = makeRequest('1')
		const response = await GET(req, { params })

		expect(response.status).toBe(200)
		expect(response.headers.get('Content-Disposition')).toBe(
			'attachment; filename="snapshot-2026-06-15.json"',
		)
		expect(
			mockSnapshotExportService.buildExportForSnapshot,
		).toHaveBeenCalledWith(snapshot)
	})

	it('zero-pads single-digit months and days in the filename', async () => {
		const snapshot = {
			id: 1,
			date: new Date('2026-01-05'),
		}
		mockSnapshotService.findById.mockResolvedValue(snapshot)
		mockSnapshotExportService.buildExportForSnapshot.mockResolvedValue({
			meta: {},
		})

		const { req, params } = makeRequest('1')
		const response = await GET(req, { params })

		expect(response.headers.get('Content-Disposition')).toBe(
			'attachment; filename="snapshot-2026-01-05.json"',
		)
	})

	it('returns 404 when the snapshot does not exist', async () => {
		mockSnapshotService.findById.mockRejectedValue(
			new Error('Snapshot not found'),
		)

		const { req, params } = makeRequest('999')
		const response = await GET(req, { params })

		expect(response.status).toBe(404)
	})

	it('returns 500 on unexpected errors', async () => {
		mockSnapshotService.findById.mockResolvedValue({
			id: 1,
			date: new Date('2026-06-15'),
		})
		mockSnapshotExportService.buildExportForSnapshot.mockRejectedValue(
			new Error('boom'),
		)

		const { req, params } = makeRequest('1')
		const response = await GET(req, { params })

		expect(response.status).toBe(500)
	})
})
