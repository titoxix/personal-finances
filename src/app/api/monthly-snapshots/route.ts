import { type NextRequest } from 'next/server'
import { ZodError } from 'zod'
import { prisma } from '@/lib/prisma'
import { createPrismaMonthlySnapshotRepository } from '@/repositories/prisma/PrismaMonthlySnapshotRepository'
import { createMonthlySnapshotService } from '@/services/MonthlySnapshotService'
import { CreateMonthlySnapshotSchema } from '@/domain/entities/monthly-snapshot'

function makeService() {
	return createMonthlySnapshotService(createPrismaMonthlySnapshotRepository(prisma))
}

export async function GET() {
	const snapshots = await makeService().findAll()
	return Response.json(snapshots)
}

export async function POST(request: NextRequest) {
	try {
		const body = await request.json()
		const input = CreateMonthlySnapshotSchema.parse(body)
		const snapshot = await makeService().create(input)
		return Response.json(snapshot, { status: 201 })
	} catch (error) {
		if (error instanceof ZodError) {
			return Response.json({ error: error.issues }, { status: 400 })
		}
		if (error instanceof Error && error.message === 'MonthlySnapshot already exists for this month') {
			return Response.json({ error: error.message }, { status: 409 })
		}
		return Response.json({ error: 'Internal server error' }, { status: 500 })
	}
}
