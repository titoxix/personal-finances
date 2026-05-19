import { type NextRequest } from 'next/server'
import { ZodError } from 'zod'
import { prisma } from '@/lib/prisma'
import { createPrismaExchangeRateRepository } from '@/repositories/prisma/PrismaExchangeRateRepository'
import { createExchangeRateService } from '@/services/ExchangeRateService'
import { CreateExchangeRateSchema } from '@/domain/entities/exchange-rate'

function makeService() {
	return createExchangeRateService(createPrismaExchangeRateRepository(prisma))
}

export async function GET() {
	const rates = await makeService().findAll()
	return Response.json(rates)
}

export async function POST(request: NextRequest) {
	try {
		const body = await request.json()
		const input = CreateExchangeRateSchema.parse(body)
		const rate = await makeService().create(input)
		return Response.json(rate, { status: 201 })
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
