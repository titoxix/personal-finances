import type { NextRequest } from 'next/server'
import { ZodError } from 'zod'
import { CreateTransactionSchema } from '@/domain/entities/transaction'
import { requireUser } from '@/lib/auth-helpers'
import { prisma } from '@/lib/prisma'
import { createPrismaInstallmentPlanRepository } from '@/repositories/prisma/PrismaInstallmentPlanRepository'
import { createPrismaTransactionRepository } from '@/repositories/prisma/PrismaTransactionRepository'
import { createTransactionService } from '@/services/TransactionService'

function makeService() {
	return createTransactionService(
		createPrismaTransactionRepository(prisma),
		createPrismaInstallmentPlanRepository(prisma),
	)
}

export async function GET() {
	const user = await requireUser()
	const transactions = await makeService().findAll(user.id)
	return Response.json(transactions)
}

export async function POST(request: NextRequest) {
	const user = await requireUser()
	try {
		const body = await request.json()
		const input = CreateTransactionSchema.parse(body)
		const transaction = await makeService().create(user.id, input)
		return Response.json(transaction, { status: 201 })
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
