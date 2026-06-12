// @vitest-environment node

import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockSnapshotExportService = {
	buildAllExports: vi.fn(),
}

vi.mock('@/lib/container', () => ({
	snapshotExportService: mockSnapshotExportService,
}))

const { GET } = await import('./route')

describe('GET /api/monthly-snapshots/export', () => {
	beforeEach(() => vi.clearAllMocks())

	it('returns 200 with an array body and a Content-Disposition header', async () => {
		mockSnapshotExportService.buildAllExports.mockResolvedValue([
			{ meta: { month: '2026-05-01' } },
			{ meta: { month: '2026-06-01' } },
		])

		const response = await GET()
		const body = await response.json()

		expect(response.status).toBe(200)
		expect(response.headers.get('Content-Disposition')).toBe(
			'attachment; filename="snapshots-all.json"',
		)
		expect(body).toHaveLength(2)
	})

	it('returns 200 with an empty array when there are no snapshots', async () => {
		mockSnapshotExportService.buildAllExports.mockResolvedValue([])

		const response = await GET()
		const body = await response.json()

		expect(response.status).toBe(200)
		expect(body).toEqual([])
	})

	it('returns 500 on unexpected errors', async () => {
		mockSnapshotExportService.buildAllExports.mockRejectedValue(
			new Error('boom'),
		)

		const response = await GET()

		expect(response.status).toBe(500)
	})
})
