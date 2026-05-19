import { type NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createPrismaExchangeRateRepository } from '@/repositories/prisma/PrismaExchangeRateRepository'
import { createExchangeRateService } from '@/services/ExchangeRateService'

function makeService() {
	return createExchangeRateService(createPrismaExchangeRateRepository(prisma))
}

export async function GET(
	_req: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	const { id } = await params
	try {
		const rate = await makeService().findById(Number(id))
		return Response.json(rate)
	} catch (error) {
		if (error instanceof Error && error.message === 'ExchangeRate not found') {
			return Response.json({ error: error.message }, { status: 404 })
		}
		return Response.json({ error: 'Internal server error' }, { status: 500 })
	}
}
