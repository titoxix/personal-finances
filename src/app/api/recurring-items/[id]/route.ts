import type { NextRequest } from 'next/server'
import { ZodError } from 'zod'
import { UpdateRecurringItemSchema } from '@/domain/entities/recurring-item'
import { prisma } from '@/lib/prisma'
import { createPrismaRecurringItemRepository } from '@/repositories/prisma/PrismaRecurringItemRepository'
import { createPrismaRecurringItemSkipRepository } from '@/repositories/prisma/PrismaRecurringItemSkipRepository'
import { createRecurringItemService } from '@/services/RecurringItemService'

function makeService() {
	return createRecurringItemService(
		createPrismaRecurringItemRepository(prisma),
		createPrismaRecurringItemSkipRepository(prisma),
	)
}

export async function GET(
	_req: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	const { id } = await params
	try {
		const item = await makeService().findById(Number(id))
		return Response.json(item)
	} catch (error) {
		if (error instanceof Error && error.message === 'RecurringItem not found') {
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
		const input = UpdateRecurringItemSchema.parse(body)
		const item = await makeService().update(Number(id), input)
		return Response.json(item)
	} catch (error) {
		if (error instanceof ZodError) {
			return Response.json({ error: error.issues }, { status: 400 })
		}
		if (error instanceof Error && error.message === 'RecurringItem not found') {
			return Response.json({ error: error.message }, { status: 404 })
		}
		return Response.json({ error: 'Internal server error' }, { status: 500 })
	}
}

export async function DELETE(
	_req: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	const { id } = await params
	try {
		const item = await makeService().deactivate(Number(id))
		return Response.json(item)
	} catch (error) {
		if (error instanceof Error && error.message === 'RecurringItem not found') {
			return Response.json({ error: error.message }, { status: 404 })
		}
		return Response.json({ error: 'Internal server error' }, { status: 500 })
	}
}
