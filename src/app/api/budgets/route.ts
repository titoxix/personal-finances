import { type NextRequest } from 'next/server'
import { ZodError } from 'zod'
import { prisma } from '@/lib/prisma'
import { createPrismaBudgetRepository } from '@/repositories/prisma/PrismaBudgetRepository'
import { createBudgetService } from '@/services/BudgetService'
import { CreateBudgetSchema } from '@/domain/entities/budget'

function makeService() {
	return createBudgetService(createPrismaBudgetRepository(prisma))
}

export async function GET() {
	const budgets = await makeService().findAll()
	return Response.json(budgets)
}

export async function POST(request: NextRequest) {
	try {
		const body = await request.json()
		const input = CreateBudgetSchema.parse(body)
		const budget = await makeService().create(input)
		return Response.json(budget, { status: 201 })
	} catch (error) {
		if (error instanceof ZodError) {
			return Response.json({ error: error.issues }, { status: 400 })
		}
		if (error instanceof Error && error.message === 'Budget already exists for this month and category') {
			return Response.json({ error: error.message }, { status: 409 })
		}
		if (error instanceof Error) {
			return Response.json({ error: error.message }, { status: 422 })
		}
		return Response.json({ error: 'Internal server error' }, { status: 500 })
	}
}
