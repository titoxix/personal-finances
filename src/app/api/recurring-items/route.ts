import { type NextRequest } from 'next/server'
import { ZodError } from 'zod'
import { prisma } from '@/lib/prisma'
import { createPrismaRecurringItemRepository } from '@/repositories/prisma/PrismaRecurringItemRepository'
import { createRecurringItemService } from '@/services/RecurringItemService'
import { CreateRecurringItemSchema } from '@/domain/entities/recurring-item'

function makeService() {
	return createRecurringItemService(createPrismaRecurringItemRepository(prisma))
}

export async function GET() {
	const items = await makeService().findAll()
	return Response.json(items)
}

export async function POST(request: NextRequest) {
	try {
		const body = await request.json()
		const input = CreateRecurringItemSchema.parse(body)
		const item = await makeService().create(input)
		return Response.json(item, { status: 201 })
	} catch (error) {
		if (error instanceof ZodError) {
			return Response.json({ error: error.issues }, { status: 400 })
		}
		if (error instanceof Error) {
			return Response.json({ error: error.message }, { status: 422 })
		}
		return Response.json({ error: 'Internal server error' }, { status: 500 })
	}
}
