import type { NextRequest } from 'next/server'
import { ZodError } from 'zod'
import { UpdateInstallmentPlanSchema } from '@/domain/entities/installment-plan'
import { prisma } from '@/lib/prisma'
import { createPrismaInstallmentPlanRepository } from '@/repositories/prisma/PrismaInstallmentPlanRepository'
import { createInstallmentPlanService } from '@/services/InstallmentPlanService'

function makeService() {
	return createInstallmentPlanService(
		createPrismaInstallmentPlanRepository(prisma),
	)
}

export async function GET(
	_req: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	const { id } = await params
	try {
		const plan = await makeService().findById(Number(id))
		return Response.json(plan)
	} catch (error) {
		if (
			error instanceof Error &&
			error.message === 'InstallmentPlan not found'
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
	const { id } = await params
	try {
		const body = await request.json()
		const input = UpdateInstallmentPlanSchema.parse(body)
		const plan = await makeService().update(Number(id), input)
		return Response.json(plan)
	} catch (error) {
		if (error instanceof ZodError) {
			return Response.json({ error: error.issues }, { status: 400 })
		}
		if (
			error instanceof Error &&
			error.message === 'InstallmentPlan not found'
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
	const { id } = await params
	try {
		const plan = await makeService().deactivate(Number(id))
		return Response.json(plan)
	} catch (error) {
		if (
			error instanceof Error &&
			error.message === 'InstallmentPlan not found'
		) {
			return Response.json({ error: error.message }, { status: 404 })
		}
		return Response.json({ error: 'Internal server error' }, { status: 500 })
	}
}
