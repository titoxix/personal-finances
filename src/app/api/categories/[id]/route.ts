import type { NextRequest } from 'next/server'
import { ZodError } from 'zod'
import { UpdateCategorySchema } from '@/domain/entities/category'
import { requireUser } from '@/lib/auth-helpers'
import { prisma } from '@/lib/prisma'
import { createPrismaCategoryRepository } from '@/repositories/prisma/PrismaCategoryRepository'
import { createCategoryService } from '@/services/CategoryService'

function makeService() {
	return createCategoryService(createPrismaCategoryRepository(prisma))
}

export async function GET(
	_req: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	const user = await requireUser()
	const { id } = await params
	try {
		const category = await makeService().findById(user.id, Number(id))
		return Response.json(category)
	} catch (error) {
		if (error instanceof Error && error.message === 'Category not found') {
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
		const input = UpdateCategorySchema.parse(body)
		const category = await makeService().update(user.id, Number(id), input)
		return Response.json(category)
	} catch (error) {
		if (error instanceof ZodError) {
			return Response.json({ error: error.issues }, { status: 400 })
		}
		if (error instanceof Error && error.message === 'Category not found') {
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
		const category = await makeService().deactivate(user.id, Number(id))
		return Response.json(category)
	} catch (error) {
		if (error instanceof Error && error.message === 'Category not found') {
			return Response.json({ error: error.message }, { status: 404 })
		}
		return Response.json({ error: 'Internal server error' }, { status: 500 })
	}
}
