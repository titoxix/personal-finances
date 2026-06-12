import type { NextRequest } from 'next/server'
import { monthlySnapshotService, snapshotExportService } from '@/lib/container'

function formatFilenameMonth(month: Date): string {
	const year = month.getUTCFullYear()
	const monthNum = String(month.getUTCMonth() + 1).padStart(2, '0')
	return `${year}-${monthNum}`
}

export async function GET(
	_req: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	const { id } = await params
	try {
		const snapshot = await monthlySnapshotService.findById(Number(id))
		const data = await snapshotExportService.buildExport(snapshot.month)
		const filename = `snapshot-${formatFilenameMonth(snapshot.month)}.json`
		return Response.json(data, {
			headers: {
				'Content-Disposition': `attachment; filename="${filename}"`,
			},
		})
	} catch (error) {
		if (
			error instanceof Error &&
			error.message === 'MonthlySnapshot not found'
		) {
			return Response.json({ error: error.message }, { status: 404 })
		}
		return Response.json({ error: 'Internal server error' }, { status: 500 })
	}
}
