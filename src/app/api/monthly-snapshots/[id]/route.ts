import type { NextRequest } from 'next/server'
import { ZodError } from 'zod'
import { UpdateSnapshotSchema } from '@/domain/entities/snapshot'
import { requireUser } from '@/lib/auth-helpers'
import { snapshotService } from '@/lib/container'

export async function GET(
	_req: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	const user = await requireUser()
	const { id } = await params
	try {
		const snapshot = await snapshotService.findById(user.id, Number(id))
		return Response.json(snapshot)
	} catch (error) {
		if (error instanceof Error && error.message === 'Snapshot not found') {
			return Response.json({ error: error.message }, { status: 404 })
		}
		return Response.json({ error: 'Internal server error' }, { status: 500 })
	}
}

export async function PATCH(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	const user = await requireUser()
	const { id } = await params
	try {
		const body = await request.json()
		const input = UpdateSnapshotSchema.parse(body)
		const snapshot = await snapshotService.update(user.id, Number(id), input)
		return Response.json(snapshot)
	} catch (error) {
		if (error instanceof ZodError) {
			return Response.json({ error: error.issues }, { status: 400 })
		}
		if (error instanceof Error && error.message === 'Snapshot not found') {
			return Response.json({ error: error.message }, { status: 404 })
		}
		return Response.json({ error: 'Internal server error' }, { status: 500 })
	}
}
