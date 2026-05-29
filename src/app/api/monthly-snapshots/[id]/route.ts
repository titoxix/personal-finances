import type { NextRequest } from 'next/server'
import { ZodError } from 'zod'
import { UpdateMonthlySnapshotSchema } from '@/domain/entities/monthly-snapshot'
import { prisma } from '@/lib/prisma'
import { createPrismaMonthlySnapshotRepository } from '@/repositories/prisma/PrismaMonthlySnapshotRepository'
import { createMonthlySnapshotService } from '@/services/MonthlySnapshotService'

function makeService() {
	return createMonthlySnapshotService(
		createPrismaMonthlySnapshotRepository(prisma),
	)
}

export async function GET(
	_req: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	const { id } = await params
	try {
		const snapshot = await makeService().findById(Number(id))
		return Response.json(snapshot)
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

export async function PATCH(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	const { id } = await params
	try {
		const body = await request.json()
		const input = UpdateMonthlySnapshotSchema.parse(body)
		const snapshot = await makeService().update(Number(id), input)
		return Response.json(snapshot)
	} catch (error) {
		if (error instanceof ZodError) {
			return Response.json({ error: error.issues }, { status: 400 })
		}
		if (
			error instanceof Error &&
			error.message === 'MonthlySnapshot not found'
		) {
			return Response.json({ error: error.message }, { status: 404 })
		}
		return Response.json({ error: 'Internal server error' }, { status: 500 })
	}
}
