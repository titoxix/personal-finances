import type { NextRequest } from 'next/server'
import { ZodError } from 'zod'
import { UpdateIncomeSchema } from '@/domain/entities/income'
import { prisma } from '@/lib/prisma'
import { createPrismaIncomeRepository } from '@/repositories/prisma/PrismaIncomeRepository'
import { createIncomeService } from '@/services/IncomeService'

function makeService() {
	return createIncomeService(createPrismaIncomeRepository(prisma))
}

export async function GET(
	_req: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	const { id } = await params
	try {
		const income = await makeService().findById(Number(id))
		return Response.json(income)
	} catch (error) {
		if (error instanceof Error && error.message === 'Income not found') {
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
		const input = UpdateIncomeSchema.parse(body)
		const income = await makeService().update(Number(id), input)
		return Response.json(income)
	} catch (error) {
		if (error instanceof ZodError) {
			return Response.json({ error: error.issues }, { status: 400 })
		}
		if (error instanceof Error && error.message === 'Income not found') {
			return Response.json({ error: error.message }, { status: 404 })
		}
		return Response.json({ error: 'Internal server error' }, { status: 500 })
	}
}
