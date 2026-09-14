import type { NextRequest } from 'next/server'
import { ZodError } from 'zod'
import { CreateSnapshotSchema } from '@/domain/entities/snapshot'
import { requireUser } from '@/lib/auth-helpers'
import { snapshotService } from '@/lib/container'

export async function GET() {
	const user = await requireUser()
	const snapshots = await snapshotService.findAll(user.id)
	return Response.json(snapshots)
}

export async function POST(request: NextRequest) {
	const user = await requireUser()
	try {
		const body = await request.json()
		const input = CreateSnapshotSchema.parse(body)
		const snapshot = await snapshotService.create(user.id, input)
		return Response.json(snapshot, { status: 201 })
	} catch (error) {
		if (error instanceof ZodError) {
			return Response.json({ error: error.issues }, { status: 400 })
		}
		return Response.json({ error: 'Internal server error' }, { status: 500 })
	}
}
