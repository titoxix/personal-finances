import type { NextRequest } from 'next/server'
import { ZodError } from 'zod'
import { UpdateEssentialityLevelSchema } from '@/domain/entities/essentiality-level'
import { requireUser } from '@/lib/auth-helpers'
import { prisma } from '@/lib/prisma'
import { createPrismaEssentialityLevelRepository } from '@/repositories/prisma/PrismaEssentialityLevelRepository'
import { createEssentialityLevelService } from '@/services/EssentialityLevelService'

function makeService() {
	return createEssentialityLevelService(
		createPrismaEssentialityLevelRepository(prisma),
	)
}

export async function GET(
	_req: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	const user = await requireUser()
	const { id } = await params
	try {
		const level = await makeService().findById(user.id, Number(id))
		return Response.json(level)
	} catch (error) {
		if (
			error instanceof Error &&
			error.message === 'EssentialityLevel not found'
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
	const user = await requireUser()
	const { id } = await params
	try {
		const body = await request.json()
		const input = UpdateEssentialityLevelSchema.parse(body)
		const level = await makeService().update(user.id, Number(id), input)
		return Response.json(level)
	} catch (error) {
		if (error instanceof ZodError) {
			return Response.json({ error: error.issues }, { status: 400 })
		}
		if (
			error instanceof Error &&
			error.message === 'EssentialityLevel not found'
		) {
			return Response.json({ error: error.message }, { status: 404 })
		}
		return Response.json({ error: 'Internal server error' }, { status: 500 })
	}
}

export async function DELETE(
	_req: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	const user = await requireUser()
	const { id } = await params
	try {
		const level = await makeService().deactivate(user.id, Number(id))
		return Response.json(level)
	} catch (error) {
		if (
			error instanceof Error &&
			error.message === 'EssentialityLevel not found'
		) {
			return Response.json({ error: error.message }, { status: 404 })
		}
		return Response.json({ error: 'Internal server error' }, { status: 500 })
	}
}
