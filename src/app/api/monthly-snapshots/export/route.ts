import { requireUser } from '@/lib/auth-helpers'
import { snapshotExportService } from '@/lib/container'

export async function GET() {
	const user = await requireUser()
	try {
		const data = await snapshotExportService.buildAllExports(user.id)
		return Response.json(data, {
			headers: {
				'Content-Disposition': 'attachment; filename="snapshots-all.json"',
			},
		})
	} catch {
		return Response.json({ error: 'Internal server error' }, { status: 500 })
	}
}
