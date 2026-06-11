import type { NextRequest } from 'next/server'
import { ZodError } from 'zod'
import { UpdateTransactionSchema } from '@/domain/entities/transaction'
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

export async function GET(
	_req: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	const { id } = await params
	try {
		const transaction = await makeService().findById(Number(id))
		return Response.json(transaction)
	} catch (error) {
		if (error instanceof Error && error.message === 'Transaction not found') {
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
		const input = UpdateTransactionSchema.parse(body)
		const transaction = await makeService().update(Number(id), input)
		return Response.json(transaction)
	} catch (error) {
		if (error instanceof ZodError) {
			return Response.json({ error: error.issues }, { status: 400 })
		}
		if (error instanceof Error && error.message === 'Transaction not found') {
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
		await makeService().delete(Number(id))
		return new Response(null, { status: 204 })
	} catch (error) {
		if (error instanceof Error && error.message === 'Transaction not found') {
			return Response.json({ error: error.message }, { status: 404 })
		}
		return Response.json({ error: 'Internal server error' }, { status: 500 })
	}
}
