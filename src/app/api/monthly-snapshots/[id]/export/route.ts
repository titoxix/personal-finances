import type { NextRequest } from 'next/server'
import { snapshotExportService, snapshotService } from '@/lib/container'

function formatFilenameDate(date: Date): string {
	const year = date.getUTCFullYear()
	const month = String(date.getUTCMonth() + 1).padStart(2, '0')
	const day = String(date.getUTCDate()).padStart(2, '0')
	return `${year}-${month}-${day}`
}

export async function GET(
	_req: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	const { id } = await params
	try {
		const snapshot = await snapshotService.findById(Number(id))
		const data = await snapshotExportService.buildExportForSnapshot(snapshot)
		const filename = `snapshot-${formatFilenameDate(snapshot.date)}.json`
		return Response.json(data, {
			headers: {
				'Content-Disposition': `attachment; filename="${filename}"`,
			},
		})
	} catch (error) {
		if (error instanceof Error && error.message === 'Snapshot not found') {
			return Response.json({ error: error.message }, { status: 404 })
		}
		return Response.json({ error: 'Internal server error' }, { status: 500 })
	}
}
