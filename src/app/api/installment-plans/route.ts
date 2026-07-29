import type { NextRequest } from 'next/server'
import { ZodError } from 'zod'
import { CreateInstallmentPlanSchema } from '@/domain/entities/installment-plan'
import { requireUser } from '@/lib/auth-helpers'
import { prisma } from '@/lib/prisma'
import { createPrismaInstallmentPlanRepository } from '@/repositories/prisma/PrismaInstallmentPlanRepository'
import { createInstallmentPlanService } from '@/services/InstallmentPlanService'

function makeService() {
	return createInstallmentPlanService(
		createPrismaInstallmentPlanRepository(prisma),
	)
}

export async function GET() {
	const user = await requireUser()
	const plans = await makeService().findAll(user.id)
	return Response.json(plans)
}

export async function POST(request: NextRequest) {
	const user = await requireUser()
	try {
		const body = await request.json()
		const input = CreateInstallmentPlanSchema.parse(body)
		const plan = await makeService().create(user.id, input)
		return Response.json(plan, { status: 201 })
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
