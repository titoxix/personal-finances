import type { NextRequest } from 'next/server'
import { ZodError } from 'zod'
import { CreateCategorySchema } from '@/domain/entities/category'
import { requireUser } from '@/lib/auth-helpers'
import { prisma } from '@/lib/prisma'
import { createPrismaCategoryRepository } from '@/repositories/prisma/PrismaCategoryRepository'
import { createCategoryService } from '@/services/CategoryService'

function makeService() {
	return createCategoryService(createPrismaCategoryRepository(prisma))
}

export async function GET() {
	const user = await requireUser()
	const categories = await makeService().findAll(user.id)
	return Response.json(categories)
}

export async function POST(request: NextRequest) {
	const user = await requireUser()
	try {
		const body = await request.json()
		const input = CreateCategorySchema.parse(body)
		const category = await makeService().create(user.id, input)
		return Response.json(category, { status: 201 })
	} catch (error) {
		if (error instanceof ZodError) {
			return Response.json({ error: error.issues }, { status: 400 })
		}
		if (
			error instanceof Error &&
			error.message === 'Category code already exists'
		) {
			return Response.json({ error: error.message }, { status: 409 })
		}
		return Response.json({ error: 'Internal server error' }, { status: 500 })
	}
}
