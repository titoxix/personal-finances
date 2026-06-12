import { snapshotExportService } from '@/lib/container'

export async function GET() {
	try {
		const data = await snapshotExportService.buildAllExports()
		return Response.json(data, {
			headers: {
				'Content-Disposition': 'attachment; filename="snapshots-all.json"',
			},
		})
	} catch {
		return Response.json({ error: 'Internal server error' }, { status: 500 })
	}
}
