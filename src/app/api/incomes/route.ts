import type { NextRequest } from 'next/server'
import { ZodError } from 'zod'
import { CreateIncomeSchema } from '@/domain/entities/income'
import { prisma } from '@/lib/prisma'
import { createPrismaIncomeRepository } from '@/repositories/prisma/PrismaIncomeRepository'
import { createIncomeService } from '@/services/IncomeService'

function makeService() {
	return createIncomeService(createPrismaIncomeRepository(prisma))
}

export async function GET() {
	const incomes = await makeService().findAll()
	return Response.json(incomes)
}

export async function POST(request: NextRequest) {
	try {
		const body = await request.json()
		const input = CreateIncomeSchema.parse(body)
		const income = await makeService().create(input)
		return Response.json(income, { status: 201 })
	} catch (error) {
		if (error instanceof ZodError) {
			return Response.json({ error: error.issues }, { status: 400 })
		}
		if (
			error instanceof Error &&
			error.message === 'Income already exists for this month'
		) {
			return Response.json({ error: error.message }, { status: 409 })
		}
		return Response.json({ error: 'Internal server error' }, { status: 500 })
	}
}
