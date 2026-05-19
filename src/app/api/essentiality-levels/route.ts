import { type NextRequest } from 'next/server'
import { ZodError } from 'zod'
import { prisma } from '@/lib/prisma'
import { createPrismaEssentialityLevelRepository } from '@/repositories/prisma/PrismaEssentialityLevelRepository'
import { createEssentialityLevelService } from '@/services/EssentialityLevelService'
import { CreateEssentialityLevelSchema } from '@/domain/entities/essentiality-level'

function makeService() {
	return createEssentialityLevelService(createPrismaEssentialityLevelRepository(prisma))
}

export async function GET() {
	const levels = await makeService().findAll()
	return Response.json(levels)
}

export async function POST(request: NextRequest) {
	try {
		const body = await request.json()
		const input = CreateEssentialityLevelSchema.parse(body)
		const level = await makeService().create(input)
		return Response.json(level, { status: 201 })
	} catch (error) {
		if (error instanceof ZodError) {
			return Response.json({ error: error.issues }, { status: 400 })
		}
		if (error instanceof Error && error.message === 'EssentialityLevel code already exists') {
			return Response.json({ error: error.message }, { status: 409 })
		}
		return Response.json({ error: 'Internal server error' }, { status: 500 })
	}
}
